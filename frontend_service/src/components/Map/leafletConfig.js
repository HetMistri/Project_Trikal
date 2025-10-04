/**
 * Leaflet icon configuration
 * Fixes default marker icon issues in react-leaflet
 * @module components/Map/leafletConfig
 */

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

/**
 * Configures Leaflet default icons
 * Must be called before using MapContainer
 */
export const setupLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
};

export default setupLeafletIcons;
