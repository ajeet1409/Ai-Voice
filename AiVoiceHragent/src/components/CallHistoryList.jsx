/**
 * CallHistoryList Component
 * 
 * Displays a paginated list of call history with the following features:
 * - Shows 10 calls per page
 * - Pagination controls (Previous/Next)
 * - Click on call to view details
 * - Refresh button to reload calls
 * - Loading states
 * 
 * @param {Array} callsList - Array of call objects
 * @param {number} currentPage - Current page number
 * @param {Function} setCurrentPage - Function to update current page
 * @param {Function} onCallClick - Callback when a call is clicked
 * @param {Function} onRefresh - Callback to refresh the call list
 * @param {boolean} isLoading - Loading state indicator
 * @param {Object} styles - Style object
 */

import React, { useEffect, useRef } from 'react';
import { List, RefreshCw, Clock, ChevronRight, ChevronLeft, Loader } from 'lucide-react';

const CallHistoryList = ({
  callsList,
  currentPage,
  setCurrentPage,
  onCallClick,
  onRefresh,
  isLoading,
  styles
}) => {
  // Use ref to track if we've already logged the calls list
  const loggedCallsRef = useRef(false);

  useEffect(() => {
    // Log calls list only once when it changes
    if (callsList && callsList.length > 0 && !loggedCallsRef.current) {
      console.log('\n📋 ========== CALL HISTORY LOADED ==========');
      console.log('📋 Total calls:', callsList.length);
      console.log('📝 First call sample:', callsList[0]);
      console.log('📅 Date fields in first call:', {
        time_of_call: callsList[0].time_of_call,
        date: callsList[0].date,
        created_at: callsList[0].created_at,
        createdAt: callsList[0].createdAt,
        start_time: callsList[0].start_time,
        startTime: callsList[0].startTime,
        timestamp: callsList[0].timestamp,
        updated_at: callsList[0].updated_at
      });

      // Test date parsing
      if (callsList[0].time_of_call) {
        const testDate = new Date(callsList[0].time_of_call);
        console.log('📅 Parsed time_of_call:', callsList[0].time_of_call);
        console.log('📅 Date object:', testDate);
        console.log('📅 Formatted:', testDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }));
      }

      console.log('📋 ==========================================\n');
      loggedCallsRef.current = true;
    }
  }, [callsList])


  // Number of calls to display per page
  const CALLS_PER_PAGE = 10;

  // Ensure callsList is always an array to prevent crashes
  const safeCallsList = Array.isArray(callsList) ? callsList : [];

  /**
   * Get status color based on call status
   * @param {string} status - Call status (completed, in-progress, failed)
   * @returns {string} Color code for the status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  /**
   * Calculate pagination values
   */
  const totalPages = Math.ceil(safeCallsList.length / CALLS_PER_PAGE);
  const startIndex = (currentPage - 1) * CALLS_PER_PAGE;
  const endIndex = startIndex + CALLS_PER_PAGE;
  const currentCalls = safeCallsList.slice(startIndex, endIndex);

  /**
   * Handle previous page navigation
   */
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  /**
   * Handle next page navigation
   */
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <>
      {/* Header with title and refresh button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <List size={20} style={{ color: '#60a5fa' }} />
        <h3 style={{ color: 'white', margin: 0 }}>Call History</h3>
        <button
          className="interactive-button"
          onClick={onRefresh}
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

      {/* Loading State */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader size={32} style={{ color: '#3b82f6', margin: '0 auto' }} className="spinner" />
          <p style={{ color: '#bfdbfe', marginTop: '1rem' }}>Loading call history...</p>
        </div>
      ) : (
        <>
          {/* Calls List */}
          <div style={styles.callsList}>
            {safeCallsList.length === 0 ? (
              // Empty State
              <div style={{ textAlign: 'center', padding: '2rem', color: '#bfdbfe' }}>
                <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No calls found. Make your first call to see history here.</p>
              </div>
            ) : (
              // Render paginated calls
              currentCalls.map(call => (
                <div
                  key={call.id}
                  style={styles.callItem}
                  onClick={() => onCallClick(call.id)}
                  className="call-item"
                >
                  {/* Call Item Content */}
                  <div style={styles.callItemContent}>
                    {/* Status Indicator Dot */}
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getStatusColor(call.call_status || call.status),
                      flexShrink: 0
                    }} />

                    {/* Call Information */}
                    <div>
                      {/* Display phone number */}
                      <p style={styles.callItemText}>
                        {call.to_number || call.from_number || call.customer?.number || 'Unknown number'}
                      </p>

                      {/* Display formatted date using Date object */}
                      <p style={{ ...styles.callItemText, fontSize: '0.75rem', opacity: 0.7 }}>
                        {(() => {
                          // Try multiple date field names from OmniDim API (time_of_call is the primary field)
                          // const dateStr = call.time_of_call ||
                          //   call.date ||
                          //   call.created_at ||
                          //   call.createdAt ||
                          //   call.start_time ||
                          //   call.startTime ||
                          //   call.timestamp ||
                          //   call.updated_at;

                          // if (dateStr) {
                          //   try {
                          //     let dateObj;

                          //     // Handle numeric timestamps (Unix timestamp)
                          //     if (typeof dateStr === 'number') {
                          //       dateObj = new Date(dateStr * 1000);
                          //     } else if (typeof dateStr === 'string') {
                          //       // Handle OmniDim format: "11/04/2025 10:27:43" (MM/DD/YYYY HH:mm:ss)
                          //       // Also handles ISO format and other standard formats
                          //       dateObj = new Date(dateStr);
                          //     }

                          //     // Validate the Date object
                          //     if (dateObj && !isNaN(dateObj.getTime())) {
                          //       // Format: Dec 4, 2024, 02:30 PM
                          //       // return dateObj.toLocaleString('en-US', {
                          //       //   month: 'short',
                          //       //   day: 'numeric',
                          //       //   year: 'numeric',
                          //       //   hour: '2-digit',
                          //       //   minute: '2-digit',
                          //       //   hour12: true
                          //       // });
                          //       return new Intl.DateTimeFormat('en-US', {
                          //         timeZone: 'Asia/Kolkata',       // <-- IST conversion
                          //         month: 'short',
                          //         day: 'numeric',
                          //         year: 'numeric',
                          //         hour: '2-digit',
                          //         minute: '2-digit',
                          //         hour12: true
                          //       }).format(dateObj);
                          //     }
                          //   } catch (error) {
                          //     console.error('Error creating Date object:', error, 'for date:', dateStr);
                          //   }
                          // }
                          const dateStr = call.time_of_call ||
                            call.date ||
                            call.created_at ||
                            call.createdAt ||
                            call.start_time ||
                            call.startTime ||
                            call.timestamp ||
                            call.updated_at;

                          if (dateStr) {
                            try {
                              let dateObj;

                              // Handle numeric timestamps (Unix timestamp)
                              if (typeof dateStr === 'number') {
                                dateObj = new Date(dateStr * 1000);
                                console.log('Unix timestamp detected:', dateStr);
                              } else if (typeof dateStr === 'string') {
                                const omniDimPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
                                const match = dateStr.trim().match(omniDimPattern);

                                if (match) {
                                  // OmniDim format like "11/15/2025 10:11:5" (assumed UTC)
                                  const [, mm, dd, yyyy, hh, min, ss] = match;

                                  const utcDate = new Date(Date.UTC(
                                    parseInt(yyyy, 10),
                                    parseInt(mm, 10) - 1,
                                    parseInt(dd, 10),
                                    parseInt(hh, 10),
                                    parseInt(min, 10),
                                    parseInt(ss, 10)
                                  ));

                                  // Format as Indian Standard Time (12-hour with AM/PM)
                                  const formattedIST = new Intl.DateTimeFormat('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }).format(utcDate);

                                  return `${formattedIST} `;
                                } else {
                                  // Fallback: let Date parse ISO / other formats
                                  console.log('String date (fallback) detected:', dateStr);
                                  dateObj = new Date(dateStr);
                                }
                              }

                              // Validate the Date object (for non-OmniDim formats)
                              if (dateObj && !isNaN(dateObj.getTime())) {
                                const formattedIST = new Intl.DateTimeFormat('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                }).format(dateObj);

                                return `${formattedIST} IST`;
                              }
                            } catch (error) {
                              console.error('Error creating Date object:', error, 'for date:', dateStr);
                            }
                          }

                          return 'Unknown date';
                        })()}
                      </p>
                    </div>

                  </div>

                  {/* Status and Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      color: '#bfdbfe',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize'
                    }}>
                      {call.call_status || call.status || 'unknown'}
                    </span>
                    <ChevronRight size={16} style={{ color: '#6b7280' }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {safeCallsList.length > CALLS_PER_PAGE && (
            <div style={styles.paginationContainer}>
              {/* Previous Button */}
              <button
                className="interactive-button"
                onClick={handlePreviousPage}
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

              {/* Page Info */}
              <span style={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>

              {/* Next Button */}
              <button
                className="interactive-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.paginationButton,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
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
  );
};

export default CallHistoryList;

