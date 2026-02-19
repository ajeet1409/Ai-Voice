import express from 'express';
import axios from 'axios';

const router = express.Router();

// OmniDim API Configuration
const OMNIDIM_BASE_URL = 'https://backend.omnidim.io/api/v1';

// In-memory per-agent call lock to enforce one active call at a time
// NOTE: This is process-local and resets on server restart
const agentLocks = new Map(); // agent_id -> { currentCallId, startedAt, timer, interval }
const detailLogOnce = new Set(); // track which callLogIds we've already logged for details

const FINAL_STATUSES = new Set([
  'completed', 'failed', 'busy', 'no-answer', 'no_answer', 'not_answered', 'canceled', 'cancelled', 'hangup', 'hang_up', 'ended',
  'disconnected', 'finished', 'complete', 'completed_successfully'
]);


const ONGOING_STATUSES = new Set([
  'in_progress','in-progress','ringing','dialing','connected','live','ongoing','active','answer','answered','talking'
]);

function releaseAgentLock(agentId, reason = 'completed') {
  const lock = agentLocks.get(String(agentId));
  if (lock) {
    if (lock.interval) clearInterval(lock.interval);
    if (lock.timer) clearTimeout(lock.timer);
  }
  agentLocks.delete(String(agentId));
  console.log(`🔓 Released lock for agent ${agentId} (${reason})`);
}

function startCompletionWatcher(agentId, callLogId, token) {
  const MAX_WATCH_MS = 10 * 60 * 1000; // 10 minutes max
  const INTERVAL_MS = 1000; // poll every 1s for faster lock release
  const startedAt = Date.now();
  let lastStatus;
  let startLogged = false;
  let seenOngoing = false;
  let seenOngoingAt = 0;
  let lastListCheckAt = 0;
  let consecutiveErrors = 0;
  let lastSuccessAt = Date.now();


  // Failsafe timeout
  const timer = setTimeout(() => releaseAgentLock(agentId, 'timeout'), MAX_WATCH_MS);

  const interval = setInterval(async () => {
    try {
      const resp = await axios.get(`${OMNIDIM_BASE_URL}/calls/logs/${callLogId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      let callData = resp.data;
      if (callData && callData.call_log_data) callData = callData.call_log_data;
      const status = String((callData?.call_status ?? callData?.status ?? callData?.state) || '').toLowerCase().trim();
      const hasEndArtifacts = !!(callData?.recording_url || callData?.ended_at || callData?.end_time || callData?.duration);
      const nowElapsed = Math.round((Date.now() - startedAt)/1000);

      // Track when the call becomes active/connected
      if (status && ONGOING_STATUSES.has(status)) {
        if (!seenOngoing) seenOngoing = true;
        if (!seenOngoingAt) seenOngoingAt = Date.now();
      }
      // Reset error counter on successful poll
      consecutiveErrors = 0;
      lastSuccessAt = Date.now();

      if (!startLogged) {
        console.log(`👀 Started watcher for agent ${agentId}, call ${callLogId}`);
        startLogged = true;
      }

      // Cross-check via list if call was active and details endpoint may lag
      if (seenOngoing && seenOngoingAt && (Date.now() - seenOngoingAt) >= 5000) {
        if ((Date.now() - lastListCheckAt) >= 3000) {
          lastListCheckAt = Date.now();
          try {
            const params = new URLSearchParams({ page: '1', page_size: '30', agent_id: String(agentId) });
            const listResp = await axios.get(`${OMNIDIM_BASE_URL}/calls/logs?${params.toString()}`, {
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            let items = listResp.data;
            if (listResp.data && Array.isArray(listResp.data.call_log_data)) items = listResp.data.call_log_data;
            const match = Array.isArray(items) ? items.find(it => String(it?.id) === String(callLogId) || String(it?.call_log_id) === String(callLogId)) : null;
            if (match) {
              const listStatus = String((match.call_status ?? match.status ?? match.state) || '').toLowerCase().trim();
              if (FINAL_STATUSES.has(listStatus)) {
                console.log(`✅ [agent ${agentId}] call ${callLogId} final via list: ${listStatus} (${nowElapsed}s)`);
                releaseAgentLock(agentId, `final_status_list:${listStatus}`);
              }
            }
          } catch (e2) {
            console.warn(`⚠️ watcher list cross-check error for agent ${agentId} call ${callLogId}:`, e2.response?.status || e2.message);
          }
        }
      }

      if (status !== lastStatus) {
        console.log(`🔁 [agent ${agentId}] call ${callLogId} status -> ${status || 'unknown'} (${nowElapsed}s)`);
        lastStatus = status;
      }
      if (FINAL_STATUSES.has(status) || hasEndArtifacts) {
        const finalStatusLabel = status || (hasEndArtifacts ? 'ended_by_artifacts' : 'unknown');
        console.log(`✅ [agent ${agentId}] call ${callLogId} final: ${finalStatusLabel} (${nowElapsed}s)`);
        releaseAgentLock(agentId, `final_status:${finalStatusLabel}`);
      }
    } catch (e) {
      consecutiveErrors++;
      const code = e.response?.status || e.code || e.message;
      console.warn(`⚠️ watcher error for agent ${agentId} call ${callLogId}:`, code);
      // On transient 5xx or gateway/network errors, try list cross-check to avoid lock getting stuck
      const is5xx = (e.response?.status >= 500 && e.response?.status < 600) || /ECONN|ETIMEDOUT|ENET|EAI_AGAIN|Bad Gateway|Gateway/i.test(String(code));
      if (seenOngoing && ((Date.now() - lastListCheckAt) >= 3000) && is5xx) {
        lastListCheckAt = Date.now();
        try {
          const params = new URLSearchParams({ page: '1', page_size: '30', agent_id: String(agentId) });
          const listResp = await axios.get(`${OMNIDIM_BASE_URL}/calls/logs?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          let items = listResp.data;
          if (listResp.data && Array.isArray(listResp.data.call_log_data)) items = listResp.data.call_log_data;
          const match = Array.isArray(items) ? items.find(it => String(it?.id) === String(callLogId) || String(it?.call_log_id) === String(callLogId)) : null;
          if (match) {
            const listStatus = String((match.call_status ?? match.status ?? match.state) || '').toLowerCase().trim();
            if (FINAL_STATUSES.has(listStatus)) {
              console.log(`✅ [agent ${agentId}] call ${callLogId} final via list (on error): ${listStatus}`);
              releaseAgentLock(agentId, `final_status_list_on_error:${listStatus}`);
            }
          }
        } catch (e3) {
      // Emergency unlock: if we've seen the call active and errors persist, avoid deadlock
      const errorSinceMs = Date.now() - lastSuccessAt;
      if (seenOngoing && is5xx && (consecutiveErrors >= 10 || errorSinceMs >= 45000)) {
        console.error(`❌ Persistent 5xx for agent ${agentId} call ${callLogId} (${consecutiveErrors}x, ${Math.round(errorSinceMs/1000)}s). Releasing lock to avoid deadlock.`);
        releaseAgentLock(agentId, 'api_error_fallback');
      }

          console.warn(`⚠️ watcher list cross-check failed during error for agent ${agentId} call ${callLogId}:`, e3.response?.status || e3.message);
        }
      }
    }
  }, INTERVAL_MS);

  const existing = agentLocks.get(String(agentId)) || {};
  agentLocks.set(String(agentId), { ...existing, currentCallId: callLogId, startedAt, timer, interval });
}

/**
 * Proxy middleware to forward requests to OmniDim API
 * This solves CORS issues by making requests from the backend
 */

// Dispatch a call
router.post('/calls/dispatch', async (req, res) => {
  try {
    const { agent_id, to_number, from_number_id, call_context } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Enforce one active call per agent using a simple in-memory lock
    const agentKey = String(agent_id || 'default');
    const existing = agentLocks.get(agentKey);
    if (existing && (existing.currentCallId || existing.startedAt)) {
      console.warn(`⛔ Dispatch blocked for agent ${agentKey}: call in progress`, existing);
      return res.status(409).json({
        error: 'CALL_IN_PROGRESS',
        message: 'Another call is in progress for this agent. Please wait until it finishes.',
        agent_id: agentKey,
        current_call_id: existing.currentCallId || undefined
      });
    }

    // Acquire lock immediately to prevent bursts
    agentLocks.set(agentKey, { startedAt: Date.now(), currentCallId: null });

    console.log('Proxying call dispatch:', { agent_id, to_number, from_number_id });

    const response = await axios.post(
      `${OMNIDIM_BASE_URL}/calls/dispatch`,
      {
        agent_id,
        to_number,
        from_number_id,
        call_context: call_context || {}
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Call dispatched successfully:', response.data);

    // Start watcher to release lock when the call finishes
    const callLogId = response.data?.call_log_id || response.data?.id || response.data?.call_id;
    if (callLogId) {
      startCompletionWatcher(agentKey, callLogId, token);
    } else {
      // If we cannot determine the id, schedule an automatic release after 30s to avoid deadlock
      const existingLock = agentLocks.get(agentKey) || {};
      const timer = setTimeout(() => releaseAgentLock(agentKey, 'no_id_auto_release'), 3000);
      agentLocks.set(agentKey, { ...existingLock, timer });
      console.warn(`⚠️ No call_log_id from dispatch. Will auto-release agent ${agentKey} lock in 3s.`);
    }

   return res.json(response.data);
  } catch (error) {
    console.error('Error dispatching call:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

// Bulk call creation
router.post('/calls/bulk_call/create', async (req, res) => {
  try {
    const { agent_id, name, contact_list, phone_number_id, is_scheduled, retry_config, enabled_reschedule_call, concurrent_call_limit } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    console.log('📞 Proxying bulk call creation:', {
      agent_id,
      name,
      contact_count: contact_list?.length,
      concurrent_call_limit 
    });

    const response = await axios.post(
      `${OMNIDIM_BASE_URL}/calls/bulk_call/create`,
      {
        agent_id,
        name,
        contact_list,
        phone_number_id,
        is_scheduled,
        retry_config,
        enabled_reschedule_call,
        concurrent_call_limit
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Bulk call created successfully');
    return res.json(response.data);
  } catch (error) {
    console.error('❌ Error creating bulk call:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.response?.data?.error || error.message,
      details: error.response?.data
    });
  }
});



// Get call logs
// router.get('/call/logs', async (req, res) => {
//   try {
//     const { page = 1, page_size = 30, agent_id, call_status } = req.query;
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ error: 'No authorization token provided' });
//     }

//     console.log('Proxying call logs request:', { page, page_size, agent_id, call_status });

//     const params = new URLSearchParams({
//       page,
//       page_size
//     });

//     if (agent_id) params.append('agent_id', agent_id);
//     if (call_status) params.append('call_status', call_status);

//     const response = await axios.get(
//       `${OMNIDIM_BASE_URL}/call/logs?${params.toString()}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching call logs:', error.response?.data || error.message);
//     res.status(error.response?.status || 500).json({
//       error: error.response?.data?.message || error.message,
//       details: error.response?.data
//     });
//   }
// });
// Get call logs
router.get('/call/logs', async (req, res) => {
  try {
    const { page = 1, page_size = 30, agent_id, call_status } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }


    const params = new URLSearchParams({
      page: String(page),
      page_size: String(page_size)
    });

    if (agent_id) params.append('agent_id', agent_id);
    if (call_status) params.append('call_status', call_status);

    const fullUrl = `${OMNIDIM_BASE_URL}/calls/logs?${params.toString()}`;

    const response = await axios.get(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });


    // Extract the actual calls array from the response
    let callsData = response.data;

    // If data is nested in call_log_data, extract it
    if (response.data.call_log_data && Array.isArray(response.data.call_log_data)) {
      callsData = response.data.call_log_data;
    }


    res.status(200).json(callsData);
  } catch (error) {
    console.error('❌ Error fetching call logs');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error data type:', typeof error.response?.data);
    if (typeof error.response?.data === 'string') {
      console.error('Error (first 200 chars):', error.response?.data.substring(0, 200));
    } else {
      console.error('Error data:', error.response?.data);
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message,
      details: error.response?.data
    });
  }
});


// Allow frontend to explicitly release an agent lock once it knows a call is finished
router.post('/agent/release', (req, res) => {
  const { agent_id } = req.body || {};
  const agentKey = String(agent_id || 'default');
  releaseAgentLock(agentKey, 'frontend_release');
  return res.json({ ok: true, agent_id: agentKey });
});


// Get specific call log details
router.get('/call/log/:callLogId', async (req, res) => {
  try {
    const { callLogId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (!detailLogOnce.has(callLogId)) {
      console.log('📞 Fetching call log details for ID:', callLogId);
      detailLogOnce.add(callLogId);
    }

    const fullUrl = `${OMNIDIM_BASE_URL}/calls/logs/${callLogId}`;
    // console.log('🌐 Full URL:', fullUrl);

    const response = await axios.get(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });


    // Extract the actual call data from the nested structure
    let callData = response.data;

    // If data is nested in call_log_data, extract it
    if (response.data.call_log_data) {
      callData = response.data.call_log_data;
    }

    // Return the extracted call data
    return res.json(callData);
  } catch (error) {
    console.error('Error fetching call log details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

export default router;

