/**
 * Logger utility for consistent console output
 * @module utils/logger
 */

import { CONSOLE_CONFIG } from '../constants';

/**
 * Logger class for structured console output
 */
class Logger {
  constructor(enabled = CONSOLE_CONFIG.ENABLE_LOGS) {
    this.enabled = enabled;
  }

  /**
   * Logs coordinate selection with formatted output
   * @param {Object} payload - Coordinate payload
   */
  logCoordinateSelection(payload) {
    if (!this.enabled) return;

    console.log('%c📍 Location Selected:', CONSOLE_CONFIG.LOG_STYLE.HEADER);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', CONSOLE_CONFIG.LOG_STYLE.SEPARATOR);
    console.log('%c📌 Latitude:%c', CONSOLE_CONFIG.LOG_STYLE.LABEL, CONSOLE_CONFIG.LOG_STYLE.VALUE, payload.latitude);
    console.log('%c📌 Longitude:%c', CONSOLE_CONFIG.LOG_STYLE.LABEL, CONSOLE_CONFIG.LOG_STYLE.VALUE, payload.longitude);
    console.log('%c🕐 Timestamp:%c', CONSOLE_CONFIG.LOG_STYLE.LABEL, CONSOLE_CONFIG.LOG_STYLE.VALUE, payload.timestamp);
    console.log('%c📦 Full Payload:', CONSOLE_CONFIG.LOG_STYLE.LABEL);
    console.log(JSON.stringify(payload, null, 2));
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', CONSOLE_CONFIG.LOG_STYLE.SEPARATOR);
  }

  /**
   * Logs general information
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  info(message, data) {
    if (!this.enabled) return;
    if (data) {
      console.info(message, data);
    } else {
      console.info(message);
    }
  }

  /**
   * Logs warnings
   * @param {string} message - Warning message
   * @param {any} data - Optional data to log
   */
  warn(message, data) {
    if (!this.enabled) return;
    if (data) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }

  /**
   * Logs errors
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  error(message, error) {
    if (!this.enabled) return;
    console.error(message);
    if (error) {
      console.error(error);
    }
  }

  /**
   * Groups related console logs
   * @param {string} label - Group label
   * @param {Function} fn - Function containing logs
   */
  group(label, fn) {
    if (!this.enabled) return fn();
    console.group(label);
    fn();
    console.groupEnd();
  }
}

// Export singleton instance
export const logger = new Logger();

export default logger;
