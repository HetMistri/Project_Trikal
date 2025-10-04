/**
 * Custom hook for handling coordinate submission
 * @module hooks/useCoordinateSubmission
 */

import { useState, useCallback } from 'react';
import { createCoordinatePayload } from '../utils/coordinates';
import { logger } from '../utils/logger';
import { UI_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

/**
 * Hook for handling coordinate submission logic
 * @param {Object} options - Configuration options
 * @returns {Object} Submission state and handlers
 */
export const useCoordinateSubmission = ({ onSuccess, onError } = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submits coordinates to backend or logs them
   * @param {Object} position - Position object with lat and lng
   * @returns {Promise} Submission promise
   */
  const submitCoordinates = useCallback(async (position) => {
    if (!position) {
      const error = new Error(ERROR_MESSAGES.NO_LOCATION_SELECTED);
      onError?.(error);
      return Promise.reject(error);
    }

    setIsSubmitting(true);

    try {
      // Create payload
      const payload = createCoordinatePayload(position);

      // Simulate async operation (replace with actual API call when backend is ready)
      await new Promise(resolve => setTimeout(resolve, UI_CONFIG.LOADING_SIMULATION_DELAY));

      // Log to console
      logger.logCoordinateSelection(payload);

      // Call success callback
      onSuccess?.(payload, position);

      return payload;
    } catch (error) {
      logger.error('Failed to submit coordinates:', error);
      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, onError]);

  return {
    isSubmitting,
    submitCoordinates,
  };
};

export default useCoordinateSubmission;
