/**
 * Header Component
 * Application header with title and instructions
 * @module components/UI/Header
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { ARIA_LABELS } from '../../constants';
import './Header.css';

/**
 * Header component
 * @param {Object} props - Component props
 */
const Header = memo(({ title, instructions }) => {
  return (
    <header 
      className="header-panel"
      role="banner"
      aria-label={ARIA_LABELS.HEADER_PANEL}
    >
      <h1 className="header-panel__title">{title}</h1>
      <p className="header-panel__instructions">{instructions}</p>
    </header>
  );
});

Header.displayName = 'Header';

Header.propTypes = {
  title: PropTypes.string,
  instructions: PropTypes.string,
};

Header.defaultProps = {
  title: 'Select Location on Map',
  instructions: 'Click anywhere on the map to select coordinates. Open browser console (F12) to view output.',
};

export default Header;
