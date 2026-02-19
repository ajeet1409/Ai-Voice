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
import './styles/animations.css';

// Import components
import AnimatedBackground from './components/AnimatedBackground';
import SingleCallTab from './components/SingleCallTab';
// import CampaignTab from './components/CampaignTab';
import CallHistoryList from './components/CallHistoryList';
import CallDetailsSection from './components/CallDetailsSection';

// Import centralized styles
import { styles } from './styles/appStyles';

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
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============================================
  // API CONFIGURATION
  // ============================================
  
  const API_TOKEN = '8e8cc903-f589-4c78-ac5d-069f89b16d88';
  const ASSISTANT_ID = '6e4e2467-1b7a-4b33-b6a0-279b20625da3';
  const PHONE_NUMBER_ID = '80dae03b-4cc5-46d3-a711-44d97585bfdb';

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
  // API FUNCTIONS
  // ============================================
  
  /**
   * Fetch list of all calls from Vapi API
   */
  const fetchCallsList = async () => {
    setIsLoadingCalls(true);
    try {
      const response = await fetch('https://api.vapi.ai/call', {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCallsList(data || []);
      } else {
        console.error('Failed to fetch calls');
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
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
      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assistantId: ASSISTANT_ID,
          phoneNumberId: PHONE_NUMBER_ID,
          customer: {
            number: formattedNumber
          }
        })
      });

      const data = await response.json();

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
        setStatus({ type: 'error', message: `Error: ${errorMessage}` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle campaign creation with CSV file
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

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const customers = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const customer = {};
        headers.forEach((header, index) => {
          customer[header] = values[index];
        });
        return customer;
      });

      // Create calls for each customer
      for (const customer of customers) {
        const phoneNumber = customer.phone || customer.Phone || customer.number;
        if (!phoneNumber) continue;

        const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

        await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assistantId: ASSISTANT_ID,
            phoneNumberId: PHONE_NUMBER_ID,
            customer: {
              number: formattedNumber,
              ...customer
            }
          })
        });
      }

      // Show brief success notification
      setStatus({ type: 'success', message: `Campaign created: ${customers.length} calls initiated` });
      setCampaignName('');
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Auto-clear success message after 2 seconds
      setTimeout(() => {
        setStatus(null);
      }, 2000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Error processing CSV file' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle call item click to view details
   */
  const handleCallClick = (call) => {
    setSelectedCall(call);
    setViewMode('detail');
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
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>AI HR Calling Agent</h1>
          <p style={styles.subtitle}>Powered by Vapi AI Voice Technology</p>
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
          <button
            className="tab-button"
            style={{
              ...styles.tab,
              ...(activeTab === 'campaign' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('campaign')}
          >
            <Upload size={20} />
            Campaign
          </button>
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

          {/* {activeTab === 'campaign' && (
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
            />
          )} */}

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

