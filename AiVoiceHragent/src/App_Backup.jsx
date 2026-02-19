

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Sparkles, Zap, CheckCircle, AlertCircle, Upload, List, Play, Download, Clock, FileText, BarChart, Loader, RefreshCw, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';

export default function VapiVoiceCaller() {
  const [activeTab, setActiveTab] = useState('single-call');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [callsList, setCallsList] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [isLoadingCalls, setIsLoadingCalls] = useState(false);
  const [isLoadingCallDetails, setIsLoadingCallDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const CALLS_PER_PAGE = 10;

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_TOKEN = '8e8cc903-f589-4c78-ac5d-069f89b16d88';
  const ASSISTANT_ID = '6e4e2467-1b7a-4b33-b6a0-279b20625da3';
  const PHONE_NUMBER_ID = '80dae03b-4cc5-46d3-a711-44d97585bfdb';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    let animationFrame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('91')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('1')) {
      return '+' + cleaned;
    } else if (cleaned.length > 0) {
      return '+91' + cleaned;
    }
    return '';
  };

  const validatePhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSingleCall = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      setStatus({ type: 'error', message: 'Please enter a valid phone number (10-15 digits)' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
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
        setStatus({ type: 'success', message: `Call initiated successfully to ${formattedNumber}! The candidate will receive a call shortly.` });
        setPhoneNumber('');
        if (data.id) {
          setCallsList(prev => [data, ...prev]);
        }
        setTimeout(() => {
          fetchCallsList();
        }, 2000);
      } else {
        const errorMessage = data.message || data.error || 'Failed to initiate call';
        setStatus({ type: 'error', message: `Error: ${errorMessage}. Please check your API credentials and try again.` });
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please check your internet connection and API token.' });
      console.error('Network Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        let calls = [];

        if (Array.isArray(data)) {
          calls = data;
        } else if (data.data && Array.isArray(data.data)) {
          calls = data.data;
        } else if (data.calls && Array.isArray(data.calls)) {
          calls = data.calls;
        }

        calls.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        setCallsList(calls);
      } else {
        console.error('Failed to fetch calls:', response.status);
        setStatus({ type: 'error', message: 'Failed to load call history' });
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
      setStatus({ type: 'error', message: 'Error loading call history' });
    } finally {
      setIsLoadingCalls(false);
    }
  };

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

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCall(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setStatus({ type: 'success', message: `File "${file.name}" uploaded successfully` });
    } else {
      setStatus({ type: 'error', message: 'Please upload a valid CSV file' });
    }
  };

  const handleCampaignCreate = async () => {
    if (!campaignName || !csvFile) {
      setStatus({ type: 'error', message: 'Please provide both campaign name and CSV file' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1);
        const customers = rows
          .filter(row => row.trim())
          .map(row => {
            const number = row.split(',')[0].trim();
            return { number: formatPhoneNumber(number) };
          })
          .filter(customer => validatePhoneNumber(customer.number));

        if (customers.length === 0) {
          setStatus({ type: 'error', message: 'No valid phone numbers found in CSV file' });
          setIsLoading(false);
          return;
        }

        const response = await fetch('https://api.vapi.ai/campaign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: campaignName,
            phoneNumberId: PHONE_NUMBER_ID,
            assistantId: ASSISTANT_ID,
            customers: customers
          })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus({ type: 'success', message: `Campaign "${campaignName}" created successfully with ${customers.length} contacts!` });
          setCampaignName('');
          setCsvFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          const errorMessage = data.message || data.error || 'Failed to create campaign';
          setStatus({ type: 'error', message: `Error: ${errorMessage}` });
          console.error('Campaign API Error:', data);
        }
        setIsLoading(false);
      };
      reader.readAsText(csvFile);
    } catch (error) {
      setStatus({ type: 'error', message: 'Error processing CSV file. Please check the format and try again.' });
      console.error('CSV Processing Error:', error);
      setIsLoading(false);
    }
  };

  const downloadRecording = async (recordingUrl) => {
    if (!recordingUrl) {
      alert('Recording not available yet. Please wait for the call to complete.');
      return;
    }

    try {
      window.open(recordingUrl, '_blank');
    } catch (error) {
      alert('Error downloading recording');
      console.error('Download Error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'call-list') {
      setCurrentPage(1);
      setViewMode('list');
      fetchCallsList();
    }
  }, [activeTab]);

  const CallDetailsSection = ({ call, onBack }) => {
    if (!call) return null;

    const analysis = call.analysis || {};
    const transcript = call.transcript || '';
    const recordingUrl = call.recordingUrl || call.artifact?.recordingUrl;
    const duration = call.endedAt && call.startedAt ? Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000) : 0;

    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const extractedData = {
      'Candidate Name': analysis.candidateName || analysis.candidate_name || 'Not extracted',
      'City Location': analysis.cityLocation || analysis.city_location || 'Not extracted',
      'Position Applied': analysis.positionApplied || analysis.position_applied || 'Not extracted',
      'Education Background': analysis.educationBackground || analysis.education_background || 'Not extracted',
      'Total Experience': analysis.totalExperience || analysis.total_experience || 'Not extracted',
      'Last Job Role': analysis.lastJobRole || analysis.last_job_role || 'Not extracted',
      'Key Skills': analysis.keySkills || analysis.key_skills || 'Not extracted',
      'Motivation to Join': analysis.motivationToJoin || analysis.motivation_to_join || 'Not extracted',
      'Expected Salary': analysis.expectedSalary || analysis.expected_salary || 'Not extracted',
      'Notice Period': analysis.noticePeriod || analysis.notice_period || 'Not extracted',
      'Previous Company Experience': analysis.previousCompanyExperience || analysis.previous_company_or_city_experience || 'Not extracted',
      'Candidate Questions': analysis.candidateQuestions || analysis.candidate_questions || 'None'
    };

    return (
      <div style={styles.callDetailsContainer}>
        <button
          onClick={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={20} />
          Back to Call History
        </button>

        <div style={styles.detailsHeader}>
          <h3 style={styles.detailsTitle}>Call Analysis & Recording</h3>
          <span style={styles.callId}>Call ID: {call.id || 'N/A'}</span>
        </div>

        <div style={styles.recordingSection}>
          <div style={styles.recordingCard}>
            <Play size={24} style={{color: '#3b82f6'}} />
            <div>
              <p style={styles.recordingLabel}>
                {recordingUrl ? 'Call Recording Available' : 'Recording Processing...'}
              </p>
              <p style={styles.recordingSubtext}>
                Duration: {duration > 0 ? formatDuration(duration) : 'Processing...'}
              </p>
            </div>
            <button
              style={{
                ...styles.downloadBtn,
                opacity: recordingUrl ? 1 : 0.5,
                cursor: recordingUrl ? 'pointer' : 'not-allowed'
              }}
              onClick={() => downloadRecording(recordingUrl)}
            >
              <Download size={16} />
              Play/Download
            </button>
          </div>
        </div>

        <div style={styles.dataGrid}>
          {Object.entries(extractedData).map(([key, value]) => (
            <div key={key} style={styles.dataCard}>
              <p style={styles.dataLabel}>{key}</p>
              <p style={styles.dataValue}>{value}</p>
            </div>
          ))}
        </div>

        {transcript && (
          <div style={styles.transcriptSection}>
            <div style={styles.jsonHeader}>
              <FileText size={20} />
              <span>Call Transcript</span>
            </div>
            <div style={styles.transcriptContent}>
              {transcript}
            </div>
          </div>
        )}

        <div style={styles.jsonSection}>
          <div style={styles.jsonHeader}>
            <FileText size={20} />
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Full Call Details - Raw JSON</span>
            <button
              style={styles.copyBtn}
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(call, null, 2));
                alert('Complete call data copied to clipboard!');
              }}
            >
              Copy All Data
            </button>
          </div>
          <pre style={styles.jsonCode}>
            {JSON.stringify(call, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const styles = {
    container: {
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    canvas: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to top, rgba(59, 130, 246, 0.1), transparent, rgba(168, 85, 247, 0.1))',
      zIndex: 0
    },
    mouseGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
      zIndex: 0,
      background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(59, 130, 246, 0.3), transparent 50%)`
    },
    content: {
      position: 'relative',
      zIndex: 10,
      minHeight: '100vh',
      padding: '2rem 1rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem'
    },
    iconContainer: {
      position: 'relative'
    },
    iconBlur: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#3b82f6',
      filter: 'blur(3rem)',
      opacity: 0.5
    },
    icon: {
      position: 'relative',
      color: '#60a5fa'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: '#bfdbfe'
    },
    tabContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '0.75rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease'
    },
    tabActive: {
      background: 'linear-gradient(to right, #3b82f6, #9333ea)',
      border: '1px solid transparent'
    },
    mainCard: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backdropFilter: 'blur(40px)',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '1.5rem',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.75rem'
    },
    inputWrapper: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#93c5fd',
      width: '1.25rem',
      height: '1.25rem'
    },
    input: {
      width: '100%',
      paddingLeft: '3rem',
      paddingRight: '1rem',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '1.125rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      background: 'linear-gradient(to right, #3b82f6, #9333ea)',
      color: 'white',
      fontWeight: 'bold',
      padding: '1rem 1.5rem',
      borderRadius: '0.75rem',
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.125rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    spinner: {
      width: '1.25rem',
      height: '1.25rem',
      border: '2px solid white',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    alert: {
      marginTop: '1.5rem',
      padding: '1rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem'
    },
    alertSuccess: {
      background: 'rgba(34, 197, 94, 0.2)',
      border: '1px solid rgba(34, 197, 94, 0.5)'
    },
    alertError: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.5)'
    },
    alertIcon: {
      width: '1.25rem',
      height: '1.25rem',
      flexShrink: 0,
      marginTop: '0.125rem'
    },
    alertText: {
      fontSize: '0.875rem'
    },
    fileUploadArea: {
      border: '2px dashed rgba(255, 255, 255, 0.3)',
      borderRadius: '0.75rem',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.05)'
    },
    fileUploadText: {
      color: '#bfdbfe',
      marginTop: '0.5rem'
    },
    callsList: {
      display: 'grid',
      gap: '1rem',
      marginTop: '1rem'
    },
    callItem: {
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '1rem',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    callItemContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    callItemText: {
      color: 'white',
      fontSize: '0.875rem',
      margin: 0
    },
    callDetailsContainer: {
      marginTop: '2rem'
    },
    detailsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    detailsTitle: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0
    },
    callId: {
      color: '#93c5fd',
      fontSize: '0.875rem'
    },
    recordingSection: {
      marginBottom: '2rem'
    },
    recordingCard: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    recordingLabel: {
      color: 'white',
      fontWeight: '600',
      margin: 0
    },
    recordingSubtext: {
      color: '#93c5fd',
      fontSize: '0.875rem',
      margin: 0
    },
    downloadBtn: {
      marginLeft: 'auto',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease'
    },
    dataGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    dataCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '1rem',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    dataLabel: {
      color: '#93c5fd',
      fontSize: '0.75rem',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      fontWeight: '600',
      margin: '0 0 0.5rem 0'
    },
    dataValue: {
      color: 'white',
      fontSize: '1rem',
      fontWeight: '500',
      margin: 0
    },
    transcriptSection: {
      background: 'rgba(59, 130, 246, 0.05)',
      borderRadius: '0.75rem',
      padding: '1rem',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      marginBottom: '2rem'
    },
    transcriptContent: {
      color: '#bfdbfe',
      fontSize: '0.875rem',
      lineHeight: '1.6',
      maxHeight: '300px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap'
    },
    jsonSection: {
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '2px solid rgba(59, 130, 246, 0.3)',
      marginTop: '2rem'
    },
    jsonHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'white',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    copyBtn: {
      marginLeft: 'auto',
      background: 'rgba(59, 130, 246, 0.3)',
      color: '#60a5fa',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease',
      fontWeight: '600'
    },
    jsonCode: {
      color: '#93c5fd',
      fontSize: '0.875rem',
      overflow: 'auto',
      maxHeight: '600px',
      margin: 0,
      lineHeight: '1.5',
      fontFamily: 'monospace'
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
      padding: '1rem'
    },
    paginationButton: {
      background: 'rgba(59, 130, 246, 0.2)',
      color: '#60a5fa',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease'
    },
    paginationInfo: {
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    backButton: {
      background: 'rgba(59, 130, 246, 0.2)',
      color: '#60a5fa',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      marginBottom: '1.5rem',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
      <div style={styles.gradientOverlay} />
      <div style={styles.mouseGradient} />
      
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <div style={styles.iconContainer}>
              <div style={styles.iconBlur} />
              <Sparkles size={48} style={styles.icon} />
            </div>
          </div>
          <h1 style={styles.title}>AI HR Calling Agent</h1>
          <p style={styles.subtitle}>Automated Candidate Screening & Interview Platform</p>
        </div>

        <div style={styles.tabContainer}>
          {[
            { id: 'single-call', icon: Phone, label: 'Single Call' },
            { id: 'call-list', icon: List, label: 'Call History' },
            { id: 'campaign', icon: BarChart, label: 'Bulk Campaign' }
          ].map(tab => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.mainCard}>
          <div style={styles.card}>
            {activeTab === 'single-call' && (
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Candidate Phone Number
                  </label>
                  <div style={styles.inputWrapper}>
                    <Phone style={styles.inputIcon} />
                    <input
                      type="tel"
                      placeholder="Enter phone number (e.g., 9876543210 or +919876543210)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={styles.input}
                      onKeyPress={(e) => e.key === 'Enter' && handleSingleCall()}
                    />
                  </div>
                </div>
                
                <button
                  style={{
                    ...styles.button,
                    ...(isLoading ? styles.buttonDisabled : {})
                  }}
                  onClick={handleSingleCall}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div style={styles.spinner} />
                      Initiating Call...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Start Screening Call
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'call-list' && (
              <div>
                {viewMode === 'list' ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <List size={20} style={{ color: '#60a5fa' }} />
                      <h3 style={{ color: 'white', margin: 0 }}>Call History</h3>
                      <button
                        onClick={fetchCallsList}
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>

                    {isLoadingCalls ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <Loader size={32} style={{ color: '#3b82f6', margin: '0 auto' }} />
                        <p style={{ color: '#bfdbfe', marginTop: '1rem' }}>Loading call history...</p>
                      </div>
                    ) : (
                      <>
                        <div style={styles.callsList}>
                          {callsList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#bfdbfe' }}>
                              <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                              <p>No calls found. Make your first call to see history here.</p>
                            </div>
                          ) : (
                            (() => {
                              const startIndex = (currentPage - 1) * CALLS_PER_PAGE;
                              const endIndex = startIndex + CALLS_PER_PAGE;
                              const currentCalls = callsList.slice(startIndex, endIndex);

                              return (
                                <>
                                  {currentCalls.map(call => (
                                    <div
                                      key={call.id}
                                      style={styles.callItem}
                                      onClick={() => fetchCallDetails(call.id)}
                                    >
                                      <div style={styles.callItemContent}>
                                        <div style={{
                                          width: '12px',
                                          height: '12px',
                                          borderRadius: '50%',
                                          background: call.status === 'completed' ? '#10b981' :
                                                     call.status === 'in-progress' ? '#f59e0b' :
                                                     call.status === 'failed' ? '#ef4444' : '#6b7280'
                                        }} />
                                        <div>
                                          <p style={styles.callItemText}>
                                            {call.customer?.number || 'Unknown number'}
                                          </p>
                                          <p style={{ ...styles.callItemText, fontSize: '0.75rem', opacity: 0.7 }}>
                                            {call.createdAt ? new Date(call.createdAt).toLocaleString() : 'Unknown date'}
                                          </p>
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                          color: '#bfdbfe',
                                          fontSize: '0.75rem',
                                          textTransform: 'capitalize'
                                        }}>
                                          {call.status || 'unknown'}
                                        </span>
                                        <ChevronRight size={16} style={{ color: '#6b7280' }} />
                                      </div>
                                    </div>
                                  ))}
                                </>
                              );
                            })()
                          )}
                        </div>

                        {callsList.length > CALLS_PER_PAGE && (
                          <div style={styles.paginationContainer}>
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              style={{
                                ...styles.paginationButton,
                                opacity: currentPage === 1 ? 0.5 : 1,
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <ChevronLeft size={16} />
                              Previous
                            </button>

                            <span style={styles.paginationInfo}>
                              Page {currentPage} of {Math.ceil(callsList.length / CALLS_PER_PAGE)}
                            </span>

                            <button
                              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(callsList.length / CALLS_PER_PAGE), prev + 1))}
                              disabled={currentPage === Math.ceil(callsList.length / CALLS_PER_PAGE)}
                              style={{
                                ...styles.paginationButton,
                                opacity: currentPage === Math.ceil(callsList.length / CALLS_PER_PAGE) ? 0.5 : 1,
                                cursor: currentPage === Math.ceil(callsList.length / CALLS_PER_PAGE) ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Next
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {isLoadingCallDetails ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <Loader size={32} style={{ color: '#3b82f6', margin: '0 auto' }} />
                        <p style={{ color: '#bfdbfe', marginTop: '1rem' }}>Loading call details...</p>
                      </div>
                    ) : (
                      selectedCall && <CallDetailsSection call={selectedCall} onBack={handleBackToList} />
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'campaign' && (
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter campaign name (e.g., 'April Tech Hiring')"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    style={{ ...styles.input, paddingLeft: '1rem' }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Upload CSV File
                  </label>
                  <div
                    style={styles.fileUploadArea}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} style={{ color: '#60a5fa', margin: '0 auto' }} />
                    <p style={styles.fileUploadText}>
                      {csvFile ? `Selected: ${csvFile.name}` : 'Click to upload CSV file with phone numbers'}
                    </p>
                    <p style={{ ...styles.fileUploadText, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      CSV format: phone numbers in first column, one per line
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".csv"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <button
                  style={{
                    ...styles.button,
                    ...(isLoading ? styles.buttonDisabled : {})
                  }}
                  onClick={handleCampaignCreate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div style={styles.spinner} />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <BarChart size={20} />
                      Create Bulk Campaign
                    </>
                  )}
                </button>
              </div>
            )}

            {status && (
              <div style={{
                ...styles.alert,
                ...(status.type === 'success' ? styles.alertSuccess : styles.alertError)
              }}>
                {status.type === 'success' ? (
                  <CheckCircle style={styles.alertIcon} />
                ) : (
                  <AlertCircle style={styles.alertIcon} />
                )}
                <p style={styles.alertText}>{status.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}


