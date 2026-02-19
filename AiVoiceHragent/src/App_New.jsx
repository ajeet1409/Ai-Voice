/**
 * Vapi Voice Caller - Main Application Component
 * 
 * This is the main entry point for the HR Voice Calling Agent application.
 * It manages the overall state and coordinates between different components.
 * 
 * Features:
 * - Single call functionality
 * - Bulk campaign creation
 * - Call history with pagination
 * - Detailed call analysis view
 * - Animated background effects
 * 
 * @author HR Voice Call Agent Team
 * @version 2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';

// Component imports
import AnimatedBackground from './components/AnimatedBackground';
import SingleCallTab from './components/SingleCallTab';
import CampaignTab from './components/CampaignTab';
import CallHistoryList from './components/CallHistoryList';
import CallDetailsSection from './components/CallDetailsSection';

// Styles import
import styles from './styles/appStyles';
import './styles/animations.css';

/**
 * Main Application Component
 */
export default function VapiVoiceCaller() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState('single-call');
  
  // Single call state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Campaign state
  const [csvFile, setCsvFile] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  
  // Call history state
  const [callsList, setCallsList] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);
  const [isLoadingCallDetails, setIsLoadingCallDetails] = useState(false);
  
  // Pagination and view state
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  
  // Refs
  const canvasRef = useRef(null);

  // ============================================
  // API CONFIGURATION
  // ============================================
  
  const API_TOKEN = '8e8cc903-f589-4c78-ac5d-069f89b16d88';
  const ASSISTANT_ID = '6e4e2467-1b7a-4b33-b6a0-279b20625da3';
  const PHONE_NUMBER_ID = '80dae03b-4cc5-46d3-a711-44d97585bfdb';

  // ============================================
  // API FUNCTIONS
  // ============================================
  
  /**
   * Make a single call to a phone number
   */
  const makeCall = async () => {
    // Validate phone number
    if (!phoneNumber.trim()) {
      setStatus({ type: 'error', message: 'Please enter a phone number' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistantId: ASSISTANT_ID,
          phoneNumberId: PHONE_NUMBER_ID,
          customer: {
            number: phoneNumber
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ 
          type: 'success', 
          message: `Call initiated successfully! Call ID: ${data.id}` 
        });
        setPhoneNumber('');
      } else {
        const errorData = await response.json();
        setStatus({ 
          type: 'error', 
          message: `Failed to initiate call: ${errorData.message || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('Error making call:', error);
      setStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch list of all calls
   */
  const fetchCallsList = async () => {
    setIsLoadingCalls(true);
    
    try {
      const response = await fetch('https://api.vapi.ai/call', {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Sort calls by creation date (newest first)
        const sortedCalls = data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCallsList(sortedCalls);
      } else {
        setStatus({ type: 'error', message: 'Failed to load call history' });
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
      setStatus({ type: 'error', message: 'Error loading call history' });
    } finally {
      setIsLoadingCalls(false);
    }
  };

  /**
   * Fetch detailed information for a specific call
   * @param {string} callId - The ID of the call to fetch
   */
  const fetchCallDetails = async (callId) => {
    setIsLoadingCallDetails(true);
    setSelectedCall(null);

    try {
      const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedCall(data);
        setViewMode('detail'); // Switch to detail view
      } else {
        setStatus({ type: 'error', message: 'Failed to load call details' });
      }
    } catch (error) {
      console.error('Error fetching call details:', error);
      setStatus({ type: 'error', message: 'Error loading call details' });
    } finally {
      setIsLoadingCallDetails(false);
    }
  };

  /**
   * Create a bulk campaign from CSV file
   */
  const createCampaign = async () => {
    // Validate inputs
    if (!campaignName.trim()) {
      setStatus({ type: 'error', message: 'Please enter a campaign name' });
      return;
    }

    if (!csvFile) {
      setStatus({ type: 'error', message: 'Please upload a CSV file' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Parse CSV file
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const phoneIndex = headers.indexOf('phone');

      if (phoneIndex === -1) {
        setStatus({ 
          type: 'error', 
          message: 'CSV must contain a "phone" column' 
        });
        setIsLoading(false);
        return;
      }

      // Extract phone numbers
      const phoneNumbers = lines.slice(1)
        .map(line => line.split(',')[phoneIndex]?.trim())
        .filter(phone => phone);

      if (phoneNumbers.length === 0) {
        setStatus({ 
          type: 'error', 
          message: 'No valid phone numbers found in CSV' 
        });
        setIsLoading(false);
        return;
      }

      // Create campaign
      const response = await fetch('https://api.vapi.ai/campaign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: campaignName,
          assistantId: ASSISTANT_ID,
          phoneNumberId: PHONE_NUMBER_ID,
          customers: phoneNumbers.map(phone => ({ number: phone }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ 
          type: 'success', 
          message: `Campaign created successfully! ${phoneNumbers.length} calls will be initiated.` 
        });
        setCampaignName('');
        setCsvFile(null);
      } else {
        const errorData = await response.json();
        setStatus({ 
          type: 'error', 
          message: `Failed to create campaign: ${errorData.message || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setStatus({ 
        type: 'error', 
        message: 'Error processing campaign. Please check your CSV format.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle back to list navigation
   */
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCall(null);
  };

  // ============================================
  // EFFECTS
  // ============================================
  
  /**
   * Load call history when switching to call-list tab
   */
  useEffect(() => {
    if (activeTab === 'call-list') {
      setCurrentPage(1);
      setViewMode('list');
      fetchCallsList();
    }
  }, [activeTab]);

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground canvasRef={canvasRef} styles={styles} />
      
      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <div style={styles.iconContainer}>
              <Phone size={48} style={{ color: '#60a5fa' }} />
            </div>
          </div>
          <h1 style={styles.title}>AI HR Calling Agent</h1>
          <p style={styles.subtitle}>
            Automate candidate screening with intelligent voice conversations
          </p>
        </div>

        {/* Main Card */}
        <div style={styles.card}>
          {/* Tab Navigation */}
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'single-call' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('single-call')}
              className="tab-button"
            >
              Single Call
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'campaign' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('campaign')}
              className="tab-button"
            >
              Bulk Campaign
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'call-list' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('call-list')}
              className="tab-button"
            >
              Call History
            </button>
          </div>

          {/* Tab Content */}
          <div className="fade-in">
            {/* Single Call Tab */}
            {activeTab === 'single-call' && (
              <SingleCallTab
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                onMakeCall={makeCall}
                isLoading={isLoading}
                status={status}
                styles={styles}
              />
            )}

            {/* Campaign Tab */}
            {activeTab === 'campaign' && (
              <CampaignTab
                campaignName={campaignName}
                setCampaignName={setCampaignName}
                csvFile={csvFile}
                setCsvFile={setCsvFile}
                onCreateCampaign={createCampaign}
                isLoading={isLoading}
                status={status}
                styles={styles}
              />
            )}

            {/* Call History Tab */}
            {activeTab === 'call-list' && (
              <div>
                {viewMode === 'list' ? (
                  <CallHistoryList
                    callsList={callsList}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onCallClick={fetchCallDetails}
                    onRefresh={fetchCallsList}
                    isLoading={isLoadingCalls}
                    styles={styles}
                  />
                ) : (
                  <>
                    {isLoadingCallDetails ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="spinner" style={{
                          width: '32px',
                          height: '32px',
                          border: '3px solid rgba(59, 130, 246, 0.3)',
                          borderTop: '3px solid #3b82f6',
                          borderRadius: '50%',
                          margin: '0 auto'
                        }} />
                        <p style={{ color: '#bfdbfe', marginTop: '1rem' }}>
                          Loading call details...
                        </p>
                      </div>
                    ) : (
                      selectedCall && (
                        <CallDetailsSection
                          call={selectedCall}
                          onBack={handleBackToList}
                          styles={styles}
                        />
                      )
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

