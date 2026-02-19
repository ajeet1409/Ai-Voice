/**
 * Centralized Styles for Vapi Voice Caller Application
 * 
 * This file contains all the styling definitions used throughout the app.
 * Organized by component/section for easy maintenance.
 */

const styles = {
  // ============================================
  // LAYOUT & CONTAINER STYLES
  // ============================================
  
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #030712 0%, #0c1222 50%, #030712 100%)',
    position: 'relative',
    overflow: 'hidden'
  },

  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },

  // ============================================
  // ANIMATED BACKGROUND STYLES
  // ============================================
  
  canvas: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  },

  gradientOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 2
  },

  mouseGradient: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(96, 165, 250, 0.15) 0%, transparent 25%)',
    pointerEvents: 'none',
    zIndex: 3
  },

  // ============================================
  // HEADER STYLES
  // ============================================
  
  header: {
    textAlign: 'center',
    marginBottom: '3rem'
  },

  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem'
  },

  iconContainer: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
    padding: '1rem',
    borderRadius: '1rem',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
  },

  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem'
  },

  subtitle: {
    color: '#bfdbfe',
    fontSize: '1.125rem'
  },

  // ============================================
  // CARD & PANEL STYLES
  // ============================================
  
  card: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },

  featureCard: {
    background: 'rgba(30, 41, 59, 0.4)',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease'
  },

  // ============================================
  // TAB NAVIGATION STYLES
  // ============================================
  
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '0'
  },

  tab: {
    background: 'transparent',
    color: '#94a3b8',
    border: 'none',
    padding: '1rem 1.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
    position: 'relative'
  },

  activeTab: {
    color: '#60a5fa',
    borderBottomColor: '#60a5fa'
  },

  // ============================================
  // FORM STYLES
  // ============================================
  
  formGroup: {
    marginBottom: '1.5rem'
  },

  label: {
    display: 'block',
    color: 'white',
    marginBottom: '0.5rem',
    fontWeight: '500'
  },

  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  hint: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginTop: '0.5rem'
  },

  // ============================================
  // BUTTON STYLES (Enhanced with animations)
  // ============================================
  
  button: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
    position: 'relative',
    overflow: 'hidden'
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
    transition: 'all 0.3s ease',
    fontWeight: '500'
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
    transition: 'all 0.3s ease',
    fontWeight: '500'
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

  downloadBtn: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  },

  // ============================================
  // FILE UPLOAD STYLES
  // ============================================
  
  fileUploadContainer: {
    position: 'relative'
  },

  fileInput: {
    display: 'none'
  },

  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(30, 41, 59, 0.5)',
    border: '2px dashed rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    color: '#bfdbfe',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  },

  // ============================================
  // STATUS MESSAGE STYLES
  // ============================================
  
  statusMessage: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    animation: 'slideIn 0.3s ease'
  },

  // ============================================
  // FEATURE GRID STYLES
  // ============================================
  
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },

  featureTitle: {
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem'
  },

  featureText: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: '1.5'
  },

  // ============================================
  // CALL HISTORY STYLES
  // ============================================

  callsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  callItem: {
    background: 'rgba(30, 41, 59, 0.4)',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease'
  },

  callItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },

  callItemText: {
    color: 'white',
    margin: 0,
    fontSize: '0.875rem'
  },

  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '1rem'
  },

  paginationInfo: {
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500'
  },

  // ============================================
  // CALL DETAILS STYLES
  // ============================================

  callDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  detailsHeader: {
    marginBottom: '1rem'
  },

  detailsTitle: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },

  callMeta: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap'
  },

  metaItem: {
    color: '#bfdbfe',
    fontSize: '0.875rem'
  },

  recordingSection: {
    background: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },

  recordingCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },

  recordingLabel: {
    color: 'white',
    fontWeight: '500',
    marginBottom: '0.5rem'
  },

  audioPlayer: {
    width: '100%',
    marginTop: '0.5rem'
  },

  extractedInfo: {
    background: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },

  sectionTitle: {
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },

  infoCard: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },

  infoValue: {
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500'
  },

  transcriptSection: {
    background: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },

  transcriptContent: {
    color: '#bfdbfe',
    fontSize: '0.875rem',
    lineHeight: '1.6',
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

  jsonCode: {
    color: '#93c5fd',
    fontSize: '0.875rem',
    overflow: 'auto',
    maxHeight: '600px',
    margin: 0,
    lineHeight: '1.5',
    fontFamily: 'monospace'
  }
};

export { styles };
export default styles;

