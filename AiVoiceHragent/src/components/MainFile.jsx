// yash
/**
 * Main Application Component - AI HR Voice Call Agent
 *
 * This is the main entry point for the AI-powered HR calling application.
 * It manages the overall state and coordinates between different components.
 *
 * Features:
 * - Single call functionality
 * - Bulk campaign creation
 * - Call history with pagination
 * - Detailed call view
 * - Animated background
 */

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Upload, List } from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/animations.css';

// Import components
import AnimatedBackground from './AnimatedBackground';
import SingleCallTab from './SingleCallTab';
import CampaignTab from './CampaignTab';
import CallHistoryList from './CallHistoryList';
import CallDetailsSection from './/CallDetailsSection';
import UserProfileDropdown from './UserProfileDropdown';
import axios from 'axios';

// Import centralized styles
import { styles } from '../styles/appStyles';

export default function VapiVoiceCaller() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Tab and view management
  const [activeTab, setActiveTab] = useState('single-call');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  // Single call state
  const [phoneNumber, setPhoneNumber] = useState('');

  // Campaign state
  const [campaignName, setCampaignName] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Call history state
  const [callsList, setCallsList] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  

  // Loading and status states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);
  const [status, setStatus] = useState(null);

  // Mouse position for interactive effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Refs
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // ============================================
  // API CONFIGURATION
  // ============================================

  const API_TOKEN = 'wu2rq5auZwgIuyJdr9KKfITCMyr9XFXGsuq7oDBIZVo';
  const AGENT_ID = 51650; // Replace with your numeric agent ID from OmniDim dashboard
  const FROM_NUMBER_ID = 941; // Replace with your from_number_id from phone number API
  const DELAY_MS_BETWEEN_CALLS = 500; // Delay between sequential calls

  // Use environment variable for backend URL
  // In production (when served from same server), use relative URL
  // In development, use localhost:3000
  const getBackendUrl = () => {
    // If VITE_BACKEND_URL is set, use it
    if (import.meta.env.VITE_BACKEND_URL) {
      return `${import.meta.env.VITE_BACKEND_URL}/api/omnidim`;
    }
    // If in production (same origin), use relative URL
    if (window.location.hostname !== 'localhost') {
      return '/api/omnidim';
    }
    // Default to localhost for development
    return 'http://localhost:3000/api/omnidim';
  };

  const BACKEND_URL = getBackendUrl();

  // ============================================
  // EFFECTS
  // ============================================

  /**
   * Track mouse position for interactive effects
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /**
   * Fetch calls list when Call History tab is active
   */
  useEffect(() => {
    if (activeTab === 'call-history') {
      fetchCallsList();
      setCurrentPage(1);
      setViewMode('list');
    }
  }, [activeTab]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Robust CSV parser that handles quoted fields, commas inside quotes, empty fields
   */
  const parseCSV = (text) => {
    const rows = [];
    let cur = "";
    let row = [];
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const ch = text[i];

      if (ch === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }

      if (ch === "," && !inQuotes) {
        row.push(cur);
        cur = "";
        i++;
        continue;
      }

      if ((ch === "\n" || ch === "\r") && !inQuotes) {
        if (ch === "\r" && text[i + 1] === "\n") {
          i++;
        }
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
        i++;
        continue;
      }

      cur += ch;
      i++;
    }

    if (cur !== "" || inQuotes || row.length > 0) {
      row.push(cur);
      rows.push(row);
    }

    return rows.map(r => r.map(f => f === undefined ? "" : f.trim()));
  };

  /**
   * Find phone column index in CSV headers
   */
  const findPhoneIndex = (headers) => {
    const lower = headers.map(h => (h || "").toLowerCase());
    const candidates = ["phone", "number", "phone_number", "phonenumber", "mobile", "mobile_number"];
    for (let c of candidates) {
      const idx = lower.indexOf(c);
      if (idx !== -1) return idx;
    }
    for (let i = 0; i < lower.length; i++) {
      if (lower[i].includes("phone") || lower[i].includes("mobile") || lower[i].includes("num")) return i;
    }
    return -1;
  };

  /**
   * Normalize phone number to E.164 format
   */
  const normalizePhone = (raw) => {
    if (!raw) return null;
    const digits = raw.replace(/[^\d+]/g, "");
    if (!digits) return null;
    return digits.startsWith('+') ? digits : `+${digits}`;
  };

  // ============================================
  // API FUNCTIONS
  // ============================================

  /**
   * Fetch list of all calls from OmniDim API via backend proxy
   */
  const fetchCallsList = async () => {
    setIsLoadingCalls(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/call/logs`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          page_size: 30,
          agent_id: AGENT_ID,
          call_status: 'completed'
        }
      });

      console.log('✅ Call logs response:', response.data);
      console.log('✅ Call logs records:', response.data.total_records);
      console.log('📊 Response type:', typeof response.data);
      console.log('🔑 Response keys:', Object.keys(response.data || {}));

      // Extract the array from the response
      let callsArray = [];
      if (Array.isArray(response.data)) {
        console.log('✅ Response is array');
        callsArray = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        console.log('✅ Found results array');
        callsArray = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('✅ Found data array');
        callsArray = response.data.data;
      } else if (response.data.calls && Array.isArray(response.data.calls)) {
        console.log('✅ Found calls array');
        callsArray = response.data.calls;
      } else {
        console.warn('⚠️ Could not find array in response, checking all properties...');
        // Try to find any array property
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`✅ Found array at key: ${key}`);
            callsArray = response.data[key];
            break;
          }
        }
      }

      console.log('📋 Extracted calls array:', callsArray);
      console.log('📏 Array length:', callsArray.length);
      if (callsArray.length > 0) {
        console.log('📝 First call sample:', callsArray[0]);
        console.log('📅 Available date fields:', {
          date: callsArray[0].date,
          created_at: callsArray[0].created_at,
          createdAt: callsArray[0].createdAt,
          start_time: callsArray[0].start_time,
          timestamp: callsArray[0].timestamp,
          updated_at: callsArray[0].updated_at
        });
        console.log('📅 All keys in first call:', Object.keys(callsArray[0]));
      }
      setCallsList(callsArray);
    } catch (error) {
      console.error('❌ Error fetching calls:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      // Always set to empty array on error to prevent crashes
      setCallsList([]);
    } finally {
      setIsLoadingCalls(false);
    }
  };

  /**
   * Handle single call initiation
   */
  const handleSingleCall = async () => {
    if (!phoneNumber.trim()) {
      setStatus({ type: 'error', message: 'Please enter a phone number' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    try {
      const requestBody = {
        agent_id: AGENT_ID,
        to_number: formattedNumber,
        from_number_id: FROM_NUMBER_ID,
        call_context: {}
      };

      console.log('Dispatching call with payload:', requestBody);

      const response = await fetch(`${BACKEND_URL}/calls/dispatch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (response.ok) {
        // Show brief success notification
        setStatus({ type: 'success', message: `Call connected to ${formattedNumber}` });
        setPhoneNumber('');

        // Add call to list
        if (data.id) {
          setCallsList(prev => [data, ...prev]);
        }

        // Auto-clear success message after 2 seconds and return to ready state
        setTimeout(() => {
          setStatus(null);
          fetchCallsList();
        }, 2000);
      } else {
        const errorMessage = data.message || data.error || 'Failed to initiate call';
        console.error('API Error:', { status: response.status, message: errorMessage, fullResponse: data });
        setStatus({ type: 'error', message: `Error: ${errorMessage}` });
      }
    } catch (error) {
      console.error('Network error:', error);
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Try bulk call creation (attempts to create all calls at once)
   * Uses OmniDim bulk_call/create API with concurrent_call_limit: 1 for sequential calls
   */
  const tryBulkCreate = async (campaignName, customers) => {
    // Build contact list in OmniDim format
    const contactList = customers.map((c, idx) => {
      const phoneNumber = normalizePhone(c.phone || c.number || c.phone_number || c["phone number"] || "");

      // Build contact object with all CSV data
      const contact = {
        phone_number: phoneNumber,
        call_number: `${idx + 1}/${customers.length}`,
        campaign_name: campaignName
      };

      // Add all other CSV fields to the contact
      Object.keys(c).forEach(key => {
        if (key !== 'phone' && key !== 'number' && key !== 'phone_number' && c[key]) {
          contact[key] = c[key];
        }
      });

      return contact;
    });

    // Filter out invalid phone numbers
    const validContacts = contactList.filter(c => c.phone_number && c.phone_number !== "+");

    if (validContacts.length === 0) {
      throw new Error("No valid phone numbers for bulk create.");
    }

    console.log('📞 Bulk call payload:', {
      name: campaignName,
      contact_count: validContacts.length,
      concurrent_call_limit: 1
    });

    const resp = await fetch(`${BACKEND_URL}/calls/bulk_call/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agent_id: AGENT_ID,
        name: campaignName,
        contact_list: validContacts,
        phone_number_id: FROM_NUMBER_ID,
        is_scheduled: false,
        retry_config: {
          auto_retry: true,
          auto_retry_schedule: "scheduled_time",
          retry_schedule_days: 3,
          retry_schedule_hours: 0,
          retry_limit: 3
        },
        enabled_reschedule_call: true,
        concurrent_call_limit: 1  // KEY: This makes calls sequential (one at a time)
      })
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => null);
      console.error('❌ Bulk create failed:', body);
      const message = body?.message || body?.error || `Bulk create failed with status ${resp.status}`;
      console.error('❌ Bulk create error:', body);
      const err = new Error(message);
      err.response = body;
      throw err;
    }

    const result = await resp.json();
    console.log('✅ Bulk create response:', result);
    return result;
  };

  /**
   * Dispatch a single call
   */
  const dispatchSingleCall = async (customer, idx, total, _retry = 0) => {
    const formatted = normalizePhone(customer.phone || customer.number || customer.phone_number || "");
    if (!formatted) throw new Error("No phone number");

    const resp = await fetch(`${BACKEND_URL}/calls/dispatch`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agent_id: AGENT_ID,
        to_number: formatted,
        from_number_id: FROM_NUMBER_ID,
        call_context: {
          campaign_name: campaignName,
          call_number: `${idx + 1}/${total}`,
          ...customer
        }
      })
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => null);

      // If backend says a call is already in progress, wait for it to finish then retry (max 3 retries)
      if (resp.status === 409 && (body?.error === 'CALL_IN_PROGRESS' || body?.code === 'CALL_IN_PROGRESS')) {
        const currentId = body?.current_call_id || body?.call_log_id || body?.id;
        console.warn(`🚧 Dispatch blocked: call in progress for agent. Waiting for ${currentId || '15s'} then retry...`);
        if (currentId) {
          await waitForCallCompletion(currentId);
        } else {
          await new Promise(r => setTimeout(r, 15000));
        }
        if (_retry < 3) {
          return await dispatchSingleCall(customer, idx, total, _retry + 1);
        }
        const err = new Error('Call still in progress after retries');
        err.response = body;
        throw err;
      }

      const message = body?.message || `Dispatch failed with status ${resp.status}`;
      const err = new Error(message);
      err.response = body;
      throw err;
    }
    return resp.json();
  };

  // Explicitly tell backend to release the agent lock once a call is finished
  const releaseAgentLockBackend = async () => {
    try {
      await fetch(`${BACKEND_URL}/agent/release`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ agent_id: AGENT_ID })
      });
    } catch (e) {
      console.warn("⚠️ Failed to release backend agent lock:", e.message);
    }
  };


  /**
   * Resolve call log ID by checking recent call logs for the target number
   * Used when the dispatch API does not return a call_log_id
   */
  const resolveCallLogId = async (dispatchData, toNumber) => {
    const MAX_WAIT_MS = 60 * 1000; // 60s max to find the call in logs
    const INTERVAL_MS = 3000;      // poll every 3s
    const target = normalizePhone(toNumber);
    let attempt = 0;

    // Try to infer from dispatch data first (defensive)
    const directId = dispatchData?.call_log_id || dispatchData?.id || dispatchData?.call_id;
    if (directId) return directId;

    console.log(`🔎 Trying to resolve call log id for ${target} from logs...`);
    const start = Date.now();
    while (Date.now() - start < MAX_WAIT_MS) {
      attempt++;
      try {
        const params = new URLSearchParams({
          page: '1',
          page_size: '30',
          agent_id: String(AGENT_ID)
        });
        const url = `${BACKEND_URL}/call/logs?${params.toString()}`;
        const resp = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
          }
        });
        if (resp.ok) {
          const arr = await resp.json();
          if (Array.isArray(arr)) {
            const match = arr.find(c => normalizePhone(c?.to_number) === target);
            if (match?.id) {
              console.log(`🔎 Resolved call log id ${match.id} for ${target} (status: ${match.call_status})`);
              return match.id;
            }
          }
        }
      } catch (e) {
        console.warn(`⚠️ resolveCallLogId attempt #${attempt} failed:`, e.message);
      }
      await new Promise(r => setTimeout(r, INTERVAL_MS));
    }

    console.warn(`⏱️ resolveCallLogId: Timed out resolving id for ${target}`);
    return null;
  };



  /**
   * Wait for a call to complete by polling its status
   * @param {string} callLogId - The ID of the call to monitor
   * @returns {Promise<object>} - The final call data
   */
  const waitForCallCompletion = async (callLogId) => {
    const MAX_POLL_TIME = 10 * 60 * 1000; // 10 minutes max
    const POLL_INTERVAL = 1000; // Check every 1 second for faster handoff
    const startTime = Date.now();
    let pollCount = 0;

    // Track connection/active phase and robust completion detection
    let seenOngoing = false;
    let consecutiveNonOngoing = 0;
    let seenOngoingAt = null;
    let lastListCheckAt = 0;

    let errorStreak = 0;
    let lastSuccessAt = Date.now();

    const FINAL_STATUSES = new Set([
      'completed','failed','busy','no-answer','no_answer','ended','hangup','hang_up','canceled','cancelled','not_answered',
      'disconnected','finished','complete','completed_successfully'
    ]);
    const ONGOING_STATUSES = new Set([
      'in_progress','in-progress','ringing','dialing','connected','live','ongoing','active','answer','answered','talking'
    ]);

    console.log(`⏳ Starting to poll call ${callLogId} (max ${MAX_POLL_TIME/1000}s, interval ${POLL_INTERVAL/1000}s)`);

    while (Date.now() - startTime < MAX_POLL_TIME) {
      pollCount++;
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      try {
        console.log(`   🔍 Poll #${pollCount} (${elapsed}s elapsed) - Checking status of call ${callLogId}...`);

        const resp = await fetch(`${BACKEND_URL}/call/log/${callLogId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
          }
        });

        if (resp.ok) {
          const callData = await resp.json();
          // Successful fetch — reset error tracking
          errorStreak = 0;
          lastSuccessAt = Date.now();
          const statusRaw = callData.call_status ?? callData.status ?? callData.state;
          const status = String(statusRaw || '').toLowerCase().trim();

          console.log(`   📊 Poll #${pollCount}: Status = "${status || 'unknown'}"`);

          // Mark as connected/active once we see an ongoing status
          if (ONGOING_STATUSES.has(status)) {
            if (!seenOngoing) {
              console.log(`   🔊 Call ${callLogId} CONNECTED/ACTIVE (status: ${status})`);
              seenOngoingAt = Date.now();
            }
            seenOngoing = true;
            consecutiveNonOngoing = 0;
          }

          // Hard final statuses
          if (FINAL_STATUSES.has(status)) {
            console.log(`   ✅ Call ${callLogId} FINISHED with status: ${status} (after ${pollCount} polls, ${elapsed}s)`);
            return callData;
          }

          // Artifact-based hints that call ended
          const hasEndArtifacts = !!(callData.recording_url || callData.recordingUrl || callData.artifact?.recordingUrl || callData.ended_at || callData.end_time || callData.duration);
          if (hasEndArtifacts) {
            console.log(`   ✅ Call ${callLogId} appears finished (end artifacts present)`);
            return callData;
          }

          // If status exists and is not ongoing, treat as finished after a short confirmation
          if (status && !ONGOING_STATUSES.has(status)) {
            consecutiveNonOngoing++;
            console.log(`   🔍 Non-ongoing status "${status}" (${consecutiveNonOngoing}x)`);
            if (consecutiveNonOngoing >= 2) {
              console.log(`   ✅ Treating call ${callLogId} as finished after non-ongoing status streak`);
              return callData;
            }
          } else if (!status && seenOngoing) {
            // After we've seen it active, missing/empty status likely indicates end — confirm twice
            consecutiveNonOngoing++;
            console.log(`   🔍 Missing status post-connection (${consecutiveNonOngoing}x)`);
            if (consecutiveNonOngoing >= 2) {
              console.log(`   ✅ Treating call ${callLogId} as finished after missing status post-connection`);
              return callData;
            }
          } else {
            // Still ongoing or not yet started — keep polling
          }

          // Cross-check using the call logs list to see if this ID is marked finished there
          if (seenOngoing && seenOngoingAt && Date.now() - seenOngoingAt >= 5000) {
            if (Date.now() - lastListCheckAt >= 3000) { // throttle list checks to every 3s
              lastListCheckAt = Date.now();
              try {
                const params = new URLSearchParams({ page: '1', page_size: '30', agent_id: String(AGENT_ID) });
                const listResp = await fetch(`${BACKEND_URL}/call/logs?${params.toString()}`, {
                  headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' }
                });
                if (listResp.ok) {
                  const listData = await listResp.json();
                  const items = Array.isArray(listData) ? listData : (Array.isArray(listData?.data) ? listData.data : []);
                  const match = items.find(it => String(it?.id) === String(callLogId) || String(it?.call_log_id) === String(callLogId));
                  if (match) {
                    const listStatusRaw = match.call_status ?? match.status ?? match.state ?? match.callStatus ?? match.final_status;
                    const listStatus = String(listStatusRaw || '').toLowerCase().trim();
                    if (FINAL_STATUSES.has(listStatus)) {
                      console.log(`   ✅ List view shows call finished: ${listStatus} — proceeding`);
                      return { ...callData, call_status: listStatus || callData.call_status };
                    }
                    if (listStatus && !ONGOING_STATUSES.has(listStatus)) {
                      consecutiveNonOngoing++;
                      console.log(`   🔍 List shows non-ongoing status "${listStatus}" (${consecutiveNonOngoing}x)`);
                      if (consecutiveNonOngoing >= 2) {
                        console.log(`   ✅ Treating call ${callLogId} as finished based on list status`);
                        return { ...callData, call_status: listStatus || callData.call_status };
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn(`   ⚠️ List cross-check error:`, e.message);
              }
            }
          }
        } else {
          console.warn(`   ⚠️ Poll #${pollCount}: HTTP ${resp.status} - ${resp.statusText}`);
          // Count as an error and consider fallback if persistent
          errorStreak++;
          const sinceMs = Date.now() - lastSuccessAt;
          if (seenOngoing && (errorStreak >= 10 || sinceMs >= 45000)) {
            console.warn(`   ❌ Persistent API errors (${errorStreak}x, ${Math.round(sinceMs/1000)}s since success). Proceeding as finished (frontend fallback).`);
            return { call_status: 'ended_by_error_fallback' };
          }
        }
      } catch (error) {
        console.warn(`   ⚠️ Poll #${pollCount}: Error polling call status for ${callLogId}:`, error.message);
        // Count as an error and consider fallback if persistent
        errorStreak++;
        const sinceMs = Date.now() - lastSuccessAt;
        if (seenOngoing && (errorStreak >= 10 || sinceMs >= 45000)) {
          console.warn(`   ❌ Persistent API errors (${errorStreak}x, ${Math.round(sinceMs/1000)}s since success). Proceeding as finished (frontend fallback).`);
          return { call_status: 'ended_by_error_fallback' };
        }
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    // Timeout reached
    console.warn(`⏱️ TIMEOUT waiting for call ${callLogId} to complete (${pollCount} polls, ${MAX_POLL_TIME/1000}s)`);
    return null;
  };

  /**
   * Handle campaign creation with CSV file
   * Tries bulk creation first, falls back to one-by-one if bulk fails
   */
  const handleCampaignCreate = async () => {
    if (!campaignName.trim()) {
      setStatus({ type: 'error', message: 'Please enter a campaign name' });
      return;
    }

    if (!csvFile) {
      setStatus({ type: 'error', message: 'Please upload a CSV file' });
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setProgress({ current: 0, total: 0 });

    try {
      const text = await csvFile.text();
      const rows = parseCSV(text).filter(r => r.length > 0 && !(r.length === 1 && r[0] === ""));

      if (rows.length < 2) {
        setStatus({ type: 'error', message: 'CSV must have a header row and at least 1 data row.' });
        setIsLoading(false);
        return;
      }

      const rawHeaders = rows[0].map(h => (h || "").trim());
      const phoneIndex = findPhoneIndex(rawHeaders);

      if (phoneIndex === -1) {
        setStatus({ type: 'error', message: 'CSV must have a "phone" or "number" column' });
        setIsLoading(false);
        return;
      }

      const dataRows = rows.slice(1);
      const customers = dataRows.map((r) => {
        const obj = {};
        rawHeaders.forEach((hdr, i) => {
          obj[hdr || `col_${i}`] = r[i] !== undefined ? r[i] : "";
        });
        const phoneVal = r[phoneIndex] || "";
        obj.phone = phoneVal;
        return obj;
      });

      let summary = {
        campaignName,
        total: customers.length,
        successful: 0,
        failed: 0,
        results: []
      };

      setProgress({ current: 0, total: customers.length });

      // DISABLE bulk create - use one-by-one approach for true sequential calling
      const USE_BULK = false;  // Set to true to try bulk API first

      console.log(`🔧 DEBUG: USE_BULK = ${USE_BULK}`);
      console.log(`🔧 DEBUG: Will use ${USE_BULK ? 'BULK API' : 'ONE-BY-ONE'} approach`);

      if (USE_BULK) {
        try {
          console.log(`📞 Attempting bulk create for campaign "${campaignName}" with ${customers.length} calls`);
          const bulkResp = await tryBulkCreate(campaignName, customers);

          summary.successful = customers.length;
          summary.failed = 0;
          summary.results = customers.map((c, idx) => ({
            index: idx + 1,
            phone: normalizePhone(c.phone),
            status: "bulk_created",
            data: bulkResp?.calls?.[idx] ?? null
          }));

          toast.success(`✅ Bulk created ${summary.successful} calls for campaign "${campaignName}"`);
          console.log("✅ Bulk response:", bulkResp);
        } catch (bulkError) {
          console.warn("⚠️ Bulk create failed, falling back to single-call creation. Reason:", bulkError);
          toast.info("Bulk create unavailable, creating calls one-by-one...");
        }
      }

      // ONE-BY-ONE approach: Each call waits for previous to complete
        const DELAY_AFTER_DISCONNECT_MS = 3000; // wait 3s after a call finishes before starting next

      if (!USE_BULK) {
        console.log(`📞 Starting campaign "${campaignName}" with ${customers.length} calls (ONE-BY-ONE mode)`);
        toast.info(`Starting campaign with ${customers.length} calls - calling one by one...`);

        for (let i = 0; i < customers.length; i++) {
          const customer = customers[i];
          const idxLabel = `${i + 1}/${customers.length}`;

          setProgress({ current: i + 1, total: customers.length });
          console.log(`\n${'='.repeat(60)}`);
          console.log(`📞 CALL ${idxLabel} - Starting...`);
          console.log(`${'='.repeat(60)}`);

          const phoneNormalized = normalizePhone(customer.phone);
          if (!phoneNormalized) {
            console.warn(`⚠️ [${idxLabel}] Skipping row - no valid phone:`, customer);
            summary.failed++;
            summary.results.push({ index: i + 1, phone: "N/A", status: "skipped", reason: "No phone number" });
            continue;
          }

          try {
            // Step 1: Initiate the call
            console.log(`📞 [${idxLabel}] STEP 1: Initiating call to ${phoneNormalized}...`);
            const data = await dispatchSingleCall(customer, i, customers.length);
            toast.success(`✅ Call ${idxLabel} initiated: ${phoneNormalized}`);
            console.log(`✅ [${idxLabel}] Call dispatched successfully:`, data);
            console.log(`🔔 [${idxLabel}] INITIATED -> ${phoneNormalized}`);


            // Step 2: Wait for the call to complete before moving to next
            let callLogId = data.call_log_id || data.id || data.call_id;
            if (!callLogId) {
              console.log(`🔍 [${idxLabel}] No call_log_id returned. Resolving via call logs for ${phoneNormalized}...`);
              callLogId = await resolveCallLogId(data, phoneNormalized);
              console.log(`🔍 [${idxLabel}] Resolved call_log_id: ${callLogId}`);
            }

            if (callLogId) {
              console.log(`⏳ [${idxLabel}] STEP 2: Waiting for call ${callLogId} to complete before next call...`);
              toast.info(`⏳ Waiting for call ${idxLabel} to complete...`, { duration: 3000 });

              const completedCallData = await waitForCallCompletion(callLogId);

              if (completedCallData) {
                const finalStatus = completedCallData.call_status?.toLowerCase();
                console.log(`🔚 [${idxLabel}] DISCONNECTED -> ${phoneNormalized} (status: ${finalStatus})`);
                console.log(`✅ [${idxLabel}] STEP 3: Call COMPLETED with status: ${finalStatus}`);
                console.log(`${'='.repeat(60)}\n`);
                toast.success(`✅ Call ${idxLabel} completed (${finalStatus}) - Moving to next...`);
                summary.successful++;
                summary.results.push({
                  index: i + 1,
                  phone: phoneNormalized,
                  status: "completed",
                  finalStatus: finalStatus,
                  data: completedCallData
                });

                // Tell backend it's safe to release the agent lock for this call
                await releaseAgentLockBackend();

                console.log(`⏳ [${idxLabel}] Waiting ${DELAY_AFTER_DISCONNECT_MS/1000}s after disconnect before next call...`);
                await new Promise(res => setTimeout(res, DELAY_AFTER_DISCONNECT_MS));
              } else {
                // Timeout / could not determine completion
                console.warn(`⏱️ [${idxLabel}] Could not confirm completion (timeout or id not found) - moving to next`);
                console.log(`${'='.repeat(60)}\n`);
                toast.warning(`⏱️ Call ${idxLabel} not confirmed - moving to next call`);
                summary.successful++;
                summary.results.push({
                  index: i + 1,
                  phone: phoneNormalized,
                  status: "unknown",
                  data
                });

                // Best-effort: ask backend to release the agent lock so the next call can proceed
                await releaseAgentLockBackend();
              }
            } else {
              // As a safety, wait a bit to avoid immediate overlap if no ID could be resolved
              console.warn(`⚠️ [${idxLabel}] No call ID found for ${phoneNormalized}. Waiting 30s before next to avoid overlap...`);
              await new Promise(res => setTimeout(res, 30000));
              summary.successful++;
              summary.results.push({ index: i + 1, phone: phoneNormalized, status: "no_id", data });

              // Also ask backend to release the lock in this no-id edge case
              await releaseAgentLockBackend();
            }

          } catch (err) {
            summary.failed++;
            summary.results.push({ index: i + 1, phone: phoneNormalized, status: "failed", error: err.response ?? err.message });
            toast.error(`Call ${idxLabel} failed: ${phoneNormalized}`);
            console.error(`❌ [${idxLabel}] Error:`, err);
          }


        }
      }

      console.log('📊 Campaign Summary:', summary);

      if (summary.successful > 0) {
        setStatus({
          type: 'success',
          message: `Campaign "${campaignName}" finished: ${summary.successful}/${summary.total} calls initiated${summary.failed ? `, ${summary.failed} failed` : ""}`
        });

        // Reset form
        setCampaignName('');
        setCsvFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Auto-clear after 6s
        setTimeout(() => setStatus(null), 6000);

        // Refresh list
        await fetchCallsList();
      } else {
        setStatus({
          type: 'error',
          message: `Campaign failed: No calls were initiated. ${summary.failed} errors.`
        });
      }

    } catch (err) {
      console.error('Error processing CSV:', err);
      setStatus({ type: 'error', message: `Error processing CSV: ${err.message}` });
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  /**
   * Handle call item click to view details
   * Fetches complete call details including recording and transcript
   */
  const handleCallClick = async (callId) => {
    setIsLoadingCalls(true);
    try {
      // Fetch complete call details from OmniDim API via backend proxy
      const response = await fetch(`${BACKEND_URL}/call/log/${callId}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });


      if (response.ok) {
        const callDetails = await response.json();
        console.log('📞 hello Call Details Fetched:', callDetails);

        console.log('🎙️ Recording URL:', callDetails.artifact?.recordingUrl || callDetails.recordingUrl);
        console.log('📝 Transcript:', callDetails.artifact?.transcript || callDetails.transcript);
        console.log('📊 Analysis:', callDetails.analysis);
        setSelectedCall(callDetails);
        setViewMode('detail');
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch call details:', response.status, errorData);
        setStatus({ type: 'error', message: 'Failed to load call details' });
      }
    } catch (error) {
      console.error('Error fetching call details:', error);
      setStatus({ type: 'error', message: 'Error loading call details' });
    } finally {
      setIsLoadingCalls(false);
    }
  };

  /**
   * Handle back button from call details
   */
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCall(null);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground canvasRef={canvasRef} styles={styles} />

      {/* Gradient Overlays */}
      <div style={styles.gradientOverlay} />
      <div style={{
        ...styles.mouseGradient,
        background: `radial-gradient(circle at ${(mousePosition.x + 1) * 50}% ${(-mousePosition.y + 1) * 50}%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
      }} />

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header with User Profile */}
        <div style={{...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h1 style={styles.title}>AI HR Calling Agent</h1>
            <p style={styles.subtitle}>Powered by Ruvanta Technology</p>
          </div>
          <UserProfileDropdown />
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabs}>
          <button
            className="tab-button"
            style={{
              ...styles.tab,
              ...(activeTab === 'single-call' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('single-call')}
          >
            <Phone size={20} />
            Single Call
          </button>
          {/* <button
            className="tab-button"
            style={{
              ...styles.tab,
              ...(activeTab === 'campaign' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('campaign')}
          >
            <Upload size={20} />
            Campaign
          </button> */}
          <button
            className="tab-button"
            style={{
              ...styles.tab,
              ...(activeTab === 'call-history' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('call-history')}
          >
            <List size={20} />
            Call History
          </button>
        </div>

        {/* Tab Content */}
        <div style={styles.card}>
          {activeTab === 'single-call' && (
            <SingleCallTab
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onMakeCall={handleSingleCall}
              isLoading={isLoading}
              status={status}
              styles={styles}
            />
          )}

          {activeTab === 'campaign' && (
            <CampaignTab
              campaignName={campaignName}
              setCampaignName={setCampaignName}
              csvFile={csvFile}
              setCsvFile={setCsvFile}
              onCreateCampaign={handleCampaignCreate}
              isLoading={isLoading}
              status={status}
              styles={styles}
              fileInputRef={fileInputRef}
              progress={progress}
            />
          )}

          {activeTab === 'call-history' && (
            viewMode === 'list' ? (
              <CallHistoryList
                callsList={callsList}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onCallClick={handleCallClick}
                onRefresh={fetchCallsList}
                isLoading={isLoadingCalls}
                styles={styles}
                call={selectedCall}
              />
            ) : (
              <CallDetailsSection
                call={selectedCall}
                onBack={handleBackToList}
                styles={styles}
              />
            )
          )}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );

}