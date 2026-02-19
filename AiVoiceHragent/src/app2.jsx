// import React, { useState, useEffect, useRef } from 'react';
// import { Phone, Sparkles, Zap, CheckCircle, AlertCircle, Upload, List, Play, Download, Clock, FileText, BarChart } from 'lucide-react';

// export default function VapiVoiceCaller() {
//   const [activeTab, setActiveTab] = useState('single-call');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [status, setStatus] = useState(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [callsList, setCallsList] = useState([]);
//   const [selectedCall, setSelectedCall] = useState(null);
//   const [csvFile, setCsvFile] = useState(null);
//   const [campaignName, setCampaignName] = useState('');
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const API_TOKEN = '8e8cc903-f589-4c78-ac5d-069f89b16d88';
//   const ASSISTANT_ID = '6e4e2467-1b7a-4b33-b6a0-279b20625da3';
//   const PHONE_NUMBER_ID = '80dae03b-4cc5-46d3-a711-44d97585bfdb';

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       setMousePosition({
//         x: (e.clientX / window.innerWidth) * 2 - 1,
//         y: -(e.clientY / window.innerHeight) * 2 + 1
//       });
//     };
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
    
//     const ctx = canvas.getContext('2d');
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const particles = [];
//     for (let i = 0; i < 50; i++) {
//       particles.push({
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         radius: Math.random() * 2 + 1,
//         vx: (Math.random() - 0.5) * 0.5,
//         vy: (Math.random() - 0.5) * 0.5
//       });
//     }

//     let animationFrame;
//     const animate = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
//       ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
//       particles.forEach(p => {
//         p.x += p.vx;
//         p.y += p.vy;
        
//         if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
//         if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
//         ctx.fill();
//       });

//       particles.forEach((p1, i) => {
//         particles.slice(i + 1).forEach(p2 => {
//           const dx = p1.x - p2.x;
//           const dy = p1.y - p2.y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
          
//           if (dist < 150) {
//             ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - dist / 150)})`;
//             ctx.lineWidth = 1;
//             ctx.beginPath();
//             ctx.moveTo(p1.x, p1.y);
//             ctx.lineTo(p2.x, p2.y);
//             ctx.stroke();
//           }
//         });
//       });

//       animationFrame = requestAnimationFrame(animate);
//     };
//     animate();

//     return () => cancelAnimationFrame(animationFrame);
//   }, []);

//   const formatPhoneNumber = (value) => {
//     const cleaned = value.replace(/\D/g, '');
//     if (cleaned.startsWith('91')) {
//       return '+' + cleaned;
//     } else if (cleaned.startsWith('1')) {
//       return '+' + cleaned;
//     } else if (cleaned.length > 0) {
//       return '+91' + cleaned;
//     }
//     return '';
//   };

//   const validatePhoneNumber = (number) => {
//     const cleaned = number.replace(/\D/g, '');
//     return cleaned.length >= 10 && cleaned.length <= 15;
//   };

//   const handleSingleCall = async () => {
//     if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
//       setStatus({ type: 'error', message: 'Please enter a valid phone number' });
//       return;
//     }

//     setIsLoading(true);
//     setStatus(null);

//     try {
//       const formattedNumber = formatPhoneNumber(phoneNumber);
      
//       const response = await fetch('https://api.vapi.ai/call', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${API_TOKEN}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           assistantId: ASSISTANT_ID,
//           phoneNumberId: PHONE_NUMBER_ID,
//           customer: {
//             number: formattedNumber
//           }
//         })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         console.log('Call initiated successfully:', data);
//         setStatus({
//           type: 'success',
//           message: 'Call initiated successfully! You should receive a call shortly.'
//         });
//         setPhoneNumber('');
        
//         // Add the new call to the list immediately
//         if (data.id) {
//           setCallsList(prev => [data, ...prev]);
//         }
        
//         // Fetch updated list after a short delay
//         setTimeout(() => {
//           fetchCallsList();
//         }, 2000);
//       } else {
//         setStatus({
//           type: 'error',
//           message: data.message || 'Failed to initiate call. Please try again.'
//         });
//       }
//     } catch (error) {
//       setStatus({
//         type: 'error',
//         message: 'Network error. Please check your connection and try again.'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchCallsList = async () => {
//     try {
//       const response = await fetch('https://api.vapi.ai/call', {
//         headers: {
//           'Authorization': `Bearer ${API_TOKEN}`
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Calls API Response:', data);
        
//         // Handle different response formats
//         if (Array.isArray(data)) {
//           setCallsList(data);
//         } else if (data.data && Array.isArray(data.data)) {
//           setCallsList(data.data);
//         } else if (data.calls && Array.isArray(data.calls)) {
//           setCallsList(data.calls);
//         } else {
//           console.log('Unexpected response format:', data);
//           setCallsList([]);
//         }
//       } else {
//         console.error('Failed to fetch calls:', response.status);
//       }
//     } catch (error) {
//       console.error('Error fetching calls:', error);
//     }
//   };

//   const fetchCallDetails = async (callId) => {
//     try {
//       const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
//         headers: {
//           'Authorization': `Bearer ${API_TOKEN}`
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setSelectedCall(data);
//       }
//     } catch (error) {
//       console.error('Error fetching call details:', error);
//     }
//   };

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type === 'text/csv') {
//       setCsvFile(file);
//       setStatus({ type: 'success', message: 'File uploaded successfully' });
//     } else {
//       setStatus({ type: 'error', message: 'Please upload a valid CSV file' });
//     }
//   };

//   const handleCampaignCreate = async () => {
//     if (!campaignName || !csvFile) {
//       setStatus({ type: 'error', message: 'Please provide campaign name and CSV file' });
//       return;
//     }

//     setIsLoading(true);
//     setStatus(null);

//     try {
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const text = e.target.result;
//         const rows = text.split('\n').slice(1);
//         const customers = rows
//           .filter(row => row.trim())
//           .map(row => {
//             const number = row.split(',')[0].trim();
//             return { number: formatPhoneNumber(number) };
//           });

//         const response = await fetch('https://api.vapi.ai/campaign', {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${API_TOKEN}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             name: campaignName,
//             phoneNumberId: PHONE_NUMBER_ID,
//             customers: customers
//           })
//         });

//         const data = await response.json();

//         if (response.ok) {
//           setStatus({
//             type: 'success',
//             message: `Campaign created successfully with ${customers.length} contacts`
//           });
//           setCampaignName('');
//           setCsvFile(null);
//           if (fileInputRef.current) fileInputRef.current.value = '';
//         } else {
//           setStatus({
//             type: 'error',
//             message: data.message || 'Failed to create campaign. Please try again.'
//           });
//         }
//       };
//       reader.readAsText(csvFile);
//     } catch (error) {
//       setStatus({
//         type: 'error',
//         message: 'Error processing CSV file. Please check the format.'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === 'call-list') {
//       fetchCallsList();
//     }
//   }, [activeTab]);

//   const CallDetailsSection = ({ call }) => {
//     const extractedData = call?.analysis || {
//       candidate_name: "John Doe",
//       city_location: "Mumbai",
//       position_applied: "Senior Software Engineer",
//       education_background: "B.Tech Computer Science",
//       total_experience: "5 years",
//       last_job_role: "Full Stack Developer",
//       key_skills: "React, Node.js, Python, AWS",
//       motivation_to_join: "Career growth and innovative projects",
//       expected_salary: "18-20 LPA",
//       notice_period: "30 days",
//       previous_company_or_city_experience: "Worked in Bangalore for 3 years",
//       candidate_questions: "Team size and work culture"
//     };

//     return (
//       <div style={styles.callDetailsContainer}>
//         <div style={styles.detailsHeader}>
//           <h3 style={styles.detailsTitle}>Call Analysis</h3>
//           <span style={styles.callId}>Call ID: {call?.id || 'N/A'}</span>
//         </div>

//         <div style={styles.recordingSection}>
//           <div style={styles.recordingCard}>
//             <Play size={24} style={{color: '#3b82f6'}} />
//             <div>
//               <p style={styles.recordingLabel}>Call Recording</p>
//               <p style={styles.recordingSubtext}>Duration: {call?.duration || '5:32'}</p>
//             </div>
//             <button style={styles.downloadBtn}>
//               <Download size={16} />
//               Download
//             </button>
//           </div>
//         </div>

//         <div style={styles.dataGrid}>
//           {Object.entries(extractedData).map(([key, value]) => (
//             <div key={key} style={styles.dataCard}>
//               <p style={styles.dataLabel}>{key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
//               <p style={styles.dataValue}>{value || 'N/A'}</p>
//             </div>
//           ))}
//         </div>

//         <div style={styles.jsonSection}>
//           <div style={styles.jsonHeader}>
//             <FileText size={20} />
//             <span>Raw JSON Data</span>
//             <button style={styles.copyBtn} onClick={() => {
//               navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
//               alert('JSON copied to clipboard');
//             }}>Copy JSON</button>
//           </div>
//           <pre style={styles.jsonCode}>
//             {JSON.stringify(extractedData, null, 2)}
//           </pre>
//         </div>
//       </div>
//     );
//   };

//   const styles = {
//     container: {
//       position: 'relative',
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
//       overflow: 'hidden',
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//     },
//     canvas: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       zIndex: 0
//     },
//     gradientOverlay: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       background: 'linear-gradient(to top, rgba(59, 130, 246, 0.1), transparent, rgba(168, 85, 247, 0.1))',
//       zIndex: 0
//     },
//     mouseGradient: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       opacity: 0.3,
//       zIndex: 0,
//       background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(59, 130, 246, 0.3), transparent 50%)`
//     },
//     content: {
//       position: 'relative',
//       zIndex: 10,
//       minHeight: '100vh',
//       padding: '2rem 1rem'
//     },
//     header: {
//       textAlign: 'center',
//       marginBottom: '2rem'
//     },
//     iconWrapper: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginBottom: '1rem'
//     },
//     iconContainer: {
//       position: 'relative'
//     },
//     iconBlur: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       background: '#3b82f6',
//       filter: 'blur(3rem)',
//       opacity: 0.5
//     },
//     icon: {
//       position: 'relative',
//       color: '#60a5fa'
//     },
//     title: {
//       fontSize: '3rem',
//       fontWeight: 'bold',
//       color: 'white',
//       marginBottom: '0.5rem'
//     },
//     subtitle: {
//       fontSize: '1.125rem',
//       color: '#bfdbfe'
//     },
//     tabContainer: {
//       display: 'flex',
//       gap: '1rem',
//       justifyContent: 'center',
//       marginBottom: '2rem',
//       flexWrap: 'wrap'
//     },
//     tab: {
//       padding: '0.75rem 1.5rem',
//       background: 'rgba(255, 255, 255, 0.1)',
//       border: '1px solid rgba(255, 255, 255, 0.2)',
//       borderRadius: '0.75rem',
//       color: 'white',
//       cursor: 'pointer',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       transition: 'all 0.3s ease'
//     },
//     tabActive: {
//       background: 'linear-gradient(to right, #3b82f6, #9333ea)',
//       border: '1px solid transparent'
//     },
//     mainCard: {
//       maxWidth: '1200px',
//       margin: '0 auto'
//     },
//     card: {
//       backdropFilter: 'blur(40px)',
//       background: 'rgba(255, 255, 255, 0.1)',
//       borderRadius: '1.5rem',
//       padding: '2rem',
//       border: '1px solid rgba(255, 255, 255, 0.2)',
//       boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
//     },
//     formGroup: {
//       marginBottom: '1.5rem'
//     },
//     label: {
//       display: 'block',
//       color: 'white',
//       fontSize: '0.875rem',
//       fontWeight: '600',
//       marginBottom: '0.75rem'
//     },
//     inputWrapper: {
//       position: 'relative'
//     },
//     inputIcon: {
//       position: 'absolute',
//       left: '1rem',
//       top: '50%',
//       transform: 'translateY(-50%)',
//       color: '#93c5fd',
//       width: '1.25rem',
//       height: '1.25rem'
//     },
//     input: {
//       width: '100%',
//       paddingLeft: '3rem',
//       paddingRight: '1rem',
//       paddingTop: '1rem',
//       paddingBottom: '1rem',
//       background: 'rgba(255, 255, 255, 0.1)',
//       border: '1px solid rgba(255, 255, 255, 0.3)',
//       borderRadius: '0.75rem',
//       color: 'white',
//       fontSize: '1.125rem',
//       outline: 'none',
//       transition: 'all 0.3s ease',
//       boxSizing: 'border-box'
//     },
//     button: {
//       width: '100%',
//       background: 'linear-gradient(to right, #3b82f6, #9333ea)',
//       color: 'white',
//       fontWeight: 'bold',
//       padding: '1rem 1.5rem',
//       borderRadius: '0.75rem',
//       transition: 'all 0.3s ease',
//       border: 'none',
//       cursor: 'pointer',
//       fontSize: '1.125rem',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: '0.75rem',
//       boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
//     },
//     buttonDisabled: {
//       opacity: 0.5,
//       cursor: 'not-allowed'
//     },
//     spinner: {
//       width: '1.25rem',
//       height: '1.25rem',
//       border: '2px solid white',
//       borderTopColor: 'transparent',
//       borderRadius: '50%',
//       animation: 'spin 1s linear infinite'
//     },
//     alert: {
//       marginTop: '1.5rem',
//       padding: '1rem',
//       borderRadius: '0.75rem',
//       display: 'flex',
//       alignItems: 'flex-start',
//       gap: '0.75rem'
//     },
//     alertSuccess: {
//       background: 'rgba(34, 197, 94, 0.2)',
//       border: '1px solid rgba(34, 197, 94, 0.5)'
//     },
//     alertError: {
//       background: 'rgba(239, 68, 68, 0.2)',
//       border: '1px solid rgba(239, 68, 68, 0.5)'
//     },
//     alertIcon: {
//       width: '1.25rem',
//       height: '1.25rem',
//       flexShrink: 0,
//       marginTop: '0.125rem'
//     },
//     alertText: {
//       fontSize: '0.875rem'
//     },
//     fileUploadArea: {
//       border: '2px dashed rgba(255, 255, 255, 0.3)',
//       borderRadius: '0.75rem',
//       padding: '2rem',
//       textAlign: 'center',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       background: 'rgba(255, 255, 255, 0.05)'
//     },
//     fileUploadText: {
//       color: '#bfdbfe',
//       marginTop: '0.5rem'
//     },
//     callsList: {
//       display: 'grid',
//       gap: '1rem',
//       marginTop: '1rem'
//     },
//     callItem: {
//       background: 'rgba(255, 255, 255, 0.05)',
//       padding: '1rem',
//       borderRadius: '0.75rem',
//       border: '1px solid rgba(255, 255, 255, 0.1)',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center'
//     },
//     callItemContent: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '1rem'
//     },
//     callItemText: {
//       color: 'white',
//       fontSize: '0.875rem'
//     },
//     callDetailsContainer: {
//       marginTop: '2rem'
//     },
//     detailsHeader: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: '1.5rem'
//     },
//     detailsTitle: {
//       color: 'white',
//       fontSize: '1.5rem',
//       fontWeight: 'bold'
//     },
//     callId: {
//       color: '#93c5fd',
//       fontSize: '0.875rem'
//     },
//     recordingSection: {
//       marginBottom: '2rem'
//     },
//     recordingCard: {
//       background: 'rgba(59, 130, 246, 0.1)',
//       border: '1px solid rgba(59, 130, 246, 0.3)',
//       borderRadius: '0.75rem',
//       padding: '1.5rem',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '1rem'
//     },
//     recordingLabel: {
//       color: 'white',
//       fontWeight: '600',
//       marginBottom: '0.25rem'
//     },
//     recordingSubtext: {
//       color: '#93c5fd',
//       fontSize: '0.875rem'
//     },
//     downloadBtn: {
//       marginLeft: 'auto',
//       background: '#3b82f6',
//       color: 'white',
//       border: 'none',
//       padding: '0.5rem 1rem',
//       borderRadius: '0.5rem',
//       cursor: 'pointer',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       fontSize: '0.875rem'
//     },
//     dataGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//       gap: '1rem',
//       marginBottom: '2rem'
//     },
//     dataCard: {
//       background: 'rgba(255, 255, 255, 0.05)',
//       padding: '1rem',
//       borderRadius: '0.75rem',
//       border: '1px solid rgba(255, 255, 255, 0.1)'
//     },
//     dataLabel: {
//       color: '#93c5fd',
//       fontSize: '0.75rem',
//       marginBottom: '0.5rem',
//       textTransform: 'uppercase',
//       fontWeight: '600'
//     },
//     dataValue: {
//       color: 'white',
//       fontSize: '1rem',
//       fontWeight: '500'
//     },
//     jsonSection: {
//       background: 'rgba(0, 0, 0, 0.3)',
//       borderRadius: '0.75rem',
//       padding: '1rem',
//       border: '1px solid rgba(255, 255, 255, 0.1)'
//     },
//     jsonHeader: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '0.5rem',
//       color: 'white',
//       marginBottom: '1rem',
//       fontSize: '0.875rem'
//     },
//     copyBtn: {
//       marginLeft: 'auto',
//       background: 'rgba(59, 130, 246, 0.2)',
//       color: '#60a5fa',
//       border: '1px solid rgba(59, 130, 246, 0.3)',
//       padding: '0.375rem 0.75rem',
//       borderRadius: '0.375rem',
//       cursor: 'pointer',
//       fontSize: '0.75rem'
//     },
//     jsonCode: {
//       color: '#93c5fd',
//       fontSize: '0.75rem',
//       overflow: 'auto',
//       maxHeight: '300px',
//       margin: 0
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <canvas ref={canvasRef} style={styles.canvas} />
//       <div style={styles.gradientOverlay} />
//       <div style={styles.mouseGradient} />

//       <div style={styles.content}>
//         <div style={styles.header}>
//           <div style={styles.iconWrapper}>
//             <div style={styles.iconContainer}>
//               <div style={styles.iconBlur} />
//               <Sparkles size={48} style={styles.icon} />
//             </div>
//           </div>
//           <h1 style={styles.title}>Meta Voice AI Platform</h1>
//           <p style={styles.subtitle}>Complete Vapi Campaign Management System</p>
//         </div>

//         <div style={styles.tabContainer}>
//           {[
//             { id: 'single-call', icon: Phone, label: 'Single Call' },
//             { id: 'call-list', icon: List, label: 'Call History' },
//             { id: 'campaign', icon: BarChart, label: 'Create Campaign' }
//           ].map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               style={{
//                 ...styles.tab,
//                 ...(activeTab === tab.id ? styles.tabActive : {})
//               }}
//             >
//               <tab.icon size={20} />
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <div style={styles.mainCard}>
//           {activeTab === 'single-call' && (
//             <div style={styles.card}>
//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Enter Phone Number</label>
//                 <div style={styles.inputWrapper}>
//                   <Phone style={styles.inputIcon} />
//                   <input
//                     type="tel"
//                     value={phoneNumber}
//                     onChange={(e) => setPhoneNumber(e.target.value)}
//                     placeholder="+91 9876543210"
//                     style={styles.input}
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={handleSingleCall}
//                 disabled={isLoading}
//                 style={{
//                   ...styles.button,
//                   ...(isLoading ? styles.buttonDisabled : {})
//                 }}
//               >
//                 {isLoading ? (
//                   <React.Fragment>
//                     <div style={styles.spinner} />
//                     Initiating Call...
//                   </React.Fragment>
//                 ) : (
//                   <React.Fragment>
//                     <Phone size={20} />
//                     Start Voice Call
//                   </React.Fragment>
//                 )}
//               </button>

//               {status && (
//                 <div style={{
//                   ...styles.alert,
//                   ...(status.type === 'success' ? styles.alertSuccess : styles.alertError)
//                 }}>
//                   {status.type === 'success' ? (
//                     <CheckCircle style={{...styles.alertIcon, color: '#4ade80'}} />
//                   ) : (
//                     <AlertCircle style={{...styles.alertIcon, color: '#f87171'}} />
//                   )}
//                   <p style={{
//                     ...styles.alertText,
//                     color: status.type === 'success' ? '#d1fae5' : '#fecaca'
//                   }}>
//                     {status.message}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'call-list' && (
//             <div style={styles.card}>
//               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
//                 <h2 style={{color: 'white', margin: 0}}>Call History</h2>
//                 <button 
//                   onClick={fetchCallsList}
//                   style={{
//                     background: 'rgba(59, 130, 246, 0.2)',
//                     color: '#60a5fa',
//                     border: '1px solid rgba(59, 130, 246, 0.3)',
//                     padding: '0.5rem 1rem',
//                     borderRadius: '0.5rem',
//                     cursor: 'pointer',
//                     fontSize: '0.875rem',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '0.5rem'
//                   }}
//                 >
//                   <Zap size={16} />
//                   Refresh
//                 </button>
//               </div>
              
//               <div style={styles.callsList}>
//                 {callsList.length > 0 ? (
//                   callsList.map((call, index) => (
//                     <div
//                       key={call.id || index}
//                       style={styles.callItem}
//                       onClick={() => fetchCallDetails(call.id)}
//                     >
//                       <div style={styles.callItemContent}>
//                         <Phone size={20} style={{color: '#60a5fa'}} />
//                         <div>
//                           <p style={styles.callItemText}>
//                             <strong>Call {index + 1}</strong> - {call.customer?.number || call.phoneNumber || 'Unknown'}
//                           </p>
//                           <p style={{...styles.callItemText, fontSize: '0.75rem', color: '#93c5fd'}}>
//                             Status: {call.status || 'Completed'} • {call.createdAt ? new Date(call.createdAt).toLocaleString() : 'Just now'}
//                           </p>
//                         </div>
//                       </div>
//                       <Clock size={16} style={{color: '#93c5fd'}} />
//                     </div>
//                   ))
//                 ) : (
//                   <div style={{textAlign: 'center', padding: '3rem'}}>
//                     <Phone size={48} style={{color: '#93c5fd', margin: '0 auto 1rem'}} />
//                     <p style={{color: '#93c5fd', fontSize: '1rem', marginBottom: '0.5rem'}}>
//                       No calls found
//                     </p>
//                     <p style={{color: '#93c5fd', fontSize: '0.875rem'}}>
//                       Make your first call or click refresh to load history
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {selectedCall && <CallDetailsSection call={selectedCall} />}
//             </div>
//           )}

//           {activeTab === 'campaign' && (
//             <div style={styles.card}>
//               <h2 style={{color: 'white', marginBottom: '1.5rem'}}>Create Campaign</h2>
              
//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Campaign Name</label>
//                 <input
//                   type="text"
//                   value={campaignName}
//                   onChange={(e) => setCampaignName(e.target.value)}
//                   placeholder="Q2 Sales Campaign"
//                   style={styles.input}
//                 />
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Upload CSV File</label>
//                 <div
//                   style={styles.fileUploadArea}
//                   onClick={() => fileInputRef.current && fileInputRef.current.click()}
//                 >
//                   <Upload size={32} style={{color: '#60a5fa', margin: '0 auto'}} />
//                   <p style={styles.fileUploadText}>
//                     {csvFile ? csvFile.name : 'Click to upload CSV file'}
//                   </p>
//                   <p style={{...styles.fileUploadText, fontSize: '0.75rem', marginTop: '0.25rem'}}>
//                     CSV format: phone_number per row
//                   </p>
//                 </div>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept=".csv"
//                   onChange={handleFileUpload}
//                   style={{display: 'none'}}
//                 />
//               </div>

//               <button
//                 onClick={handleCampaignCreate}
//                 disabled={isLoading}
//                 style={{
//                   ...styles.button,
//                   ...(isLoading ? styles.buttonDisabled : {})
//                 }}
//               >
//                 {isLoading ? (
//                   <React.Fragment>
//                     <div style={styles.spinner} />
//                     Creating Campaign...
//                   </React.Fragment>
//                 ) : (
//                   <React.Fragment>
//                     <BarChart size={20} />
//                     Create Campaign
//                   </React.Fragment>
//                 )}
//               </button>

//               {status && (
//                 <div style={{
//                   ...styles.alert,
//                   ...(status.type === 'success' ? styles.alertSuccess : styles.alertError)
//                 }}>
//                   {status.type === 'success' ? (
//                     <CheckCircle style={{...styles.alertIcon, color: '#4ade80'}} />
//                   ) : (
//                     <AlertCircle style={{...styles.alertIcon, color: '#f87171'}} />
//                   )}
//                   <p style={{
//                     ...styles.alertText,
//                     color: status.type === 'success' ? '#d1fae5' : '#fecaca'
//                   }}>
//                     {status.message}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//         input::placeholder {
//           color: rgba(191, 219, 254, 0.5);
//         }
//       `}</style>
//     </div>
//   );
// }