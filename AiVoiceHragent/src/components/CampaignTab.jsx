/**
 * CampaignTab Component
 * 
 * Handles bulk campaign functionality:
 * - CSV file upload for multiple candidates
 * - Campaign name input
 * - Create campaign button
 * - Status messages
 * - Loading states
 * 
 * @param {string} campaignName - Current campaign name value
 * @param {Function} setCampaignName - Function to update campaign name
 * @param {File|null} csvFile - Selected CSV file
 * @param {Function} setCsvFile - Function to update CSV file
 * @param {Function} onCreateCampaign - Callback to create campaign
 * @param {boolean} isLoading - Loading state indicator
 * @param {Object} status - Status object with type and message
 * @param {Object} styles - Style object
 */

import React from 'react';
import { Upload, BarChart, CheckCircle, AlertCircle } from 'lucide-react';

const CampaignTab = ({
  campaignName,
  setCampaignName,
  csvFile,
  setCsvFile,
  onCreateCampaign,
  isLoading,
  status,
  styles,
  fileInputRef,
  progress
}) => {
  /**
   * Handle file selection
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateCampaign();
  };

  return (
    <div>
      {/* Campaign Info Card */}
      <div style={styles.featureCard}>
        <BarChart size={24} style={{ color: '#60a5fa' }} />
        <h3 style={styles.featureTitle}>Bulk Campaign</h3>
        <p style={styles.featureText}>
          Upload a CSV file with candidate phone numbers to create a bulk calling campaign.
          The system will automatically call all candidates and collect their information.
        </p>
      </div>

      {/* Campaign Form */}
      <form onSubmit={handleSubmit}>
        {/* Campaign Name Input Group */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Campaign Name
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., Q1 2024 Developer Hiring"
            style={styles.input}
            disabled={isLoading}
            required
          />
          <p style={styles.hint}>
            Give your campaign a descriptive name for easy identification
          </p>
        </div>

        {/* CSV File Upload Group */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Upload CSV File
          </label>
          <div style={styles.fileUploadContainer}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={styles.fileInput}
              id="csv-upload"
              disabled={isLoading}
              required
            />
            <label 
              htmlFor="csv-upload" 
              style={{
                ...styles.fileLabel,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              className="interactive-button"
            >
              <Upload size={20} />
              {csvFile ? csvFile.name : 'Choose CSV File'}
            </label>
          </div>
          <p style={styles.hint}>
            CSV should contain a column named 'phone' with phone numbers including country code
          </p>
        </div>

        {/* Create Campaign Button */}
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
          <BarChart size={20} />
          {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
        </button>
      </form>

      {/* Progress Bar */}
      {progress && progress.total > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            color: '#93c5fd',
            fontSize: '0.875rem'
          }}>
            <span>Progress: {progress.current}/{progress.total}</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div style={{
            height: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${(progress.current / progress.total) * 100}%`,
              transition: 'width 250ms linear',
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              borderRadius: '6px'
            }} />
          </div>
        </div>
      )}

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

      {/* CSV Format Example */}
      <div style={{
        ...styles.featureCard,
        marginTop: '1.5rem',
        background: 'rgba(59, 130, 246, 0.05)'
      }}>
        <h4 style={{ ...styles.featureTitle, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          CSV Format Example:
        </h4>
        <pre style={{
          color: '#93c5fd',
          fontSize: '0.75rem',
          margin: 0,
          fontFamily: 'monospace'
        }}>
{`phone
+1234567890
+1987654321
+1555123456`}
        </pre>
      </div>
    </div>
  );
};

export default CampaignTab;

