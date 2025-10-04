/**
 * Notification Component
 * Displays status messages with auto-hide functionality
 * @module components/UI/Notification
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { MESSAGE_TYPES, ARIA_LABELS } from '../../constants';
import './Notification.css';

/**
 * Notification component
 * @param {Object} props - Component props
 */
const Notification = memo(({ message, type, onClose }) => {
  if (!message) {
    return null;
  }

  const getAriaLabel = () => {
    switch (type) {
      case MESSAGE_TYPES.SUCCESS:
        return 'Success message';
      case MESSAGE_TYPES.ERROR:
        return 'Error message';
      case MESSAGE_TYPES.WARNING:
        return 'Warning message';
      default:
        return 'Information message';
    }
  };

  return (
    <div 
      className={`notification notification--${type}`}
      role="alert"
      aria-label={`${ARIA_LABELS.MESSAGE_PANEL}: ${getAriaLabel()}`}
      aria-live="assertive"
    >
      <div className="notification__content">
        {message}
      </div>
      {onClose && (
        <button
          className="notification__close"
          onClick={onClose}
          aria-label="Close notification"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
});

Notification.displayName = 'Notification';

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(Object.values(MESSAGE_TYPES)),
  onClose: PropTypes.func,
};

Notification.defaultProps = {
  message: '',
  type: MESSAGE_TYPES.INFO,
  onClose: null,
};

export default Notification;
