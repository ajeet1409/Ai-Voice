/**
 * SingleCallTab Component
 * 
 * Handles single call functionality:
 * - Phone number input
 * - Initiate call button
 * - Status messages
 * - Loading states
 * 
 * @param {string} phoneNumber - Current phone number value
 * @param {Function} setPhoneNumber - Function to update phone number
 * @param {Function} onMakeCall - Callback to initiate a call
 * @param {boolean} isLoading - Loading state indicator
 * @param {Object} status - Status object with type and message
 * @param {Object} styles - Style object
 */

import React from 'react';
import { Phone, Sparkles, Zap, CheckCircle, AlertCircle } from 'lucide-react';

const SingleCallTab = ({ 
  phoneNumber, 
  setPhoneNumber, 
  onMakeCall, 
  isLoading, 
  status,
  styles 
}) => {
  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onMakeCall();
  };

  return (
    <div>
      {/* Feature Cards */}
      <div style={styles.featureGrid}>
        {/* AI-Powered Feature Card */}
        <div style={styles.featureCard}>
          <Sparkles size={24} style={{ color: '#60a5fa' }} />
          <h3 style={styles.featureTitle}>AI-Powered</h3>
          <p style={styles.featureText}>
            Advanced voice AI conducts natural conversations
          </p>
        </div>

        {/* Instant Connection Feature Card */}
        <div style={styles.featureCard}>
          <Zap size={24} style={{ color: '#60a5fa' }} />
          <h3 style={styles.featureTitle}>Instant</h3>
          <p style={styles.featureText}>
            Connect with candidates in seconds
          </p>
        </div>
      </div>

      {/* Call Form */}
      <form onSubmit={handleSubmit}>
        {/* Phone Number Input Group */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            style={styles.input}
            disabled={isLoading}
            required
          />
          <p style={styles.hint}>
            Enter phone number with country code (e.g., +1 for US)
          </p>
        </div>

        {/* Make Call Button */}
        <button
          type="submit"
          className="primary-button"
          style={{
            ...styles.button,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading}
        >
          <Phone size={20} />
          {isLoading ? 'Initiating Call...' : 'Make Call'}
        </button>
      </form>

      {/* Status Messages */}
      {status && status.message && (
        <div style={{
          ...styles.statusMessage,
          background: status.type === 'success' 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          borderColor: status.type === 'success' 
            ? 'rgba(16, 185, 129, 0.3)' 
            : 'rgba(239, 68, 68, 0.3)'
        }}>
          {status.type === 'success' ? (
            <CheckCircle size={20} style={{ color: '#10b981' }} />
          ) : (
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
          )}
          <span style={{
            color: status.type === 'success' ? '#10b981' : '#ef4444'
          }}>
            {status.message}
          </span>
        </div>
      )}
    </div>
  );
};

export default SingleCallTab;

