/**
 * Custom hook for managing notification messages with auto-hide
 * @module hooks/useNotification
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { UI_CONFIG, MESSAGE_TYPES } from '../constants';

/**
 * Hook for managing notification messages
 * @returns {Object} Notification state and handlers
 */
export const useNotification = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INFO);
  const timeoutRef = useRef(null);

  /**
   * Clears any existing timeout
   */
  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Shows a notification message
   * @param {string} msg - Message to display
   * @param {string} type - Message type (success, error, warning, info)
   * @param {number|null} autoHideDelay - Auto-hide delay in ms (null to disable)
   */
  const showNotification = useCallback((msg, type = MESSAGE_TYPES.INFO, autoHideDelay = UI_CONFIG.MESSAGE_AUTO_HIDE_DELAY) => {
    clearExistingTimeout();
    setMessage(msg);
    setMessageType(type);

    if (autoHideDelay !== null) {
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, autoHideDelay);
    }
  }, [clearExistingTimeout]);

  /**
   * Shows a success message
   * @param {string} msg - Success message
   */
  const showSuccess = useCallback((msg) => {
    showNotification(msg, MESSAGE_TYPES.SUCCESS, UI_CONFIG.MESSAGE_AUTO_HIDE_DELAY);
  }, [showNotification]);

  /**
   * Shows an error message
   * @param {string} msg - Error message
   */
  const showError = useCallback((msg) => {
    showNotification(msg, MESSAGE_TYPES.ERROR, null); // Errors don't auto-hide
  }, [showNotification]);

  /**
   * Shows a warning message
   * @param {string} msg - Warning message
   */
  const showWarning = useCallback((msg) => {
    showNotification(msg, MESSAGE_TYPES.WARNING, UI_CONFIG.WARNING_AUTO_HIDE_DELAY);
  }, [showNotification]);

  /**
   * Hides the current message
   */
  const hideNotification = useCallback(() => {
    clearExistingTimeout();
    setMessage('');
  }, [clearExistingTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearExistingTimeout();
    };
  }, [clearExistingTimeout]);

  return {
    message,
    messageType,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    hideNotification,
  };
};

export default useNotification;
