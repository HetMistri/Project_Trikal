/**
 * ActionButtons Component
 * Floating action buttons for confirm and clear actions
 * @module components/UI/ActionButtons
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { ARIA_LABELS, KEYBOARD_KEYS } from '../../constants';
import './ActionButtons.css';

/**
 * ActionButtons component
 * @param {Object} props - Component props
 */
const ActionButtons = memo(({
  onConfirm,
  onClear,
  isLoading,
  isDisabled,
  confirmText,
  clearText,
  loadingText,
}) => {
  const handleKeyDown = (e, callback) => {
    if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div className="action-buttons" role="group" aria-label="Map actions">
      <button
        onClick={onConfirm}
        onKeyDown={(e) => handleKeyDown(e, onConfirm)}
        disabled={isDisabled || isLoading}
        className="confirm-button"
        aria-label={ARIA_LABELS.CONFIRM_BUTTON}
        type="button"
      >
        {isLoading ? loadingText : confirmText}
      </button>
      <button
        onClick={onClear}
        onKeyDown={(e) => handleKeyDown(e, onClear)}
        disabled={isLoading}
        className="clear-button"
        aria-label={ARIA_LABELS.CLEAR_BUTTON}
        type="button"
      >
        {clearText}
      </button>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

ActionButtons.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  confirmText: PropTypes.string,
  clearText: PropTypes.string,
  loadingText: PropTypes.string,
};

ActionButtons.defaultProps = {
  isLoading: false,
  isDisabled: false,
  confirmText: '✓ Confirm & Log',
  clearText: '✕ Clear',
  loadingText: '⏳ Logging...',
};

export default ActionButtons;
