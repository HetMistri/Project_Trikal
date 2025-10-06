# Project Trikal - Frontend Service (OpenStreetMap Edition)

A modern React-based frontend for the Project Trikal geohazard analysis platform, featuring glassmorphism UI design and interactive map components powered by **OpenStreetMap** - completely free with no API keys required!

## 🗺️ Features

- ✨ **Free OpenStreetMap Integration** - No API keys, no registration, no credit cards needed!
- 🎨 **Multiple Map Styles** - Streets, Satellite, Topographic, and Dark themes
- 🖱️ **Interactive Map Interface** - Built with React Leaflet
- ✨ **Glassmorphism Design** - Modern UI with beautiful glass effects
- 🎯 **Location Analysis** - Click anywhere on the map to analyze geohazard risks
- 📊 **Real-time Data Visualization** - Risk assessment with visual indicators
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🎨 **Smooth Animations** - Powered by Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- **No API keys required!** 🎉

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - Start clicking on the map immediately - no setup needed!

## 🎮 Usage

### Basic Map Interaction

1. **Select a Location**: Click anywhere on the map to place a marker
2. **View Coordinates**: See latitude, longitude, and selection time in the popup
3. **Generate Analysis**: Click "Generate Analysis" to process the location
4. **Review Results**: View risk assessment, confidence scores, and recommendations
5. **Download Data**: Use action buttons to download reports or data

### Map Controls

- **Zoom In/Out**: Use the + and - buttons on the bottom right
- **Locate User**: Click the navigation icon to center on your location
- **Change Map Style**: Click the layers icon to switch between map types
- **Clear Selection**: Use the trash button in the analysis panel

### Available Map Styles

- **Streets**: Standard OpenStreetMap view (default)
- **Satellite**: High-resolution satellite imagery via Esri
- **Topographic**: Detailed topographic maps via OpenTopoMap
- **Dark**: Dark theme via CartoDB (perfect for the app's design)

## 🗂️ Component Structure

```
src/
├── MapInterface.jsx     # Main map component (React Leaflet)
├── MapInterface.css     # Glassmorphism styles + Leaflet customization
├── apiService.js        # Backend API integration
├── App.jsx             # Root application component
└── main.jsx            # Application entry point
```

## 🎨 Free Map Providers Used

| Provider          | Style       | Description                         |
| ----------------- | ----------- | ----------------------------------- |
| **OpenStreetMap** | Streets     | Community-driven street maps        |
| **Esri ArcGIS**   | Satellite   | High-resolution satellite imagery   |
| **OpenTopoMap**   | Topographic | Detailed elevation and terrain data |
| **CartoDB**       | Dark        | Dark-themed maps perfect for our UI |

All providers are **completely free** for this type of usage!

## 🔧 Technical Details

### Key Changes from Mapbox

- ✅ **Removed**: Mapbox GL JS, React Map GL, API tokens
- ✅ **Added**: Leaflet, React Leaflet (100% free)
- ✅ **Updated**: Custom marker icons, tile layer management
- ✅ **Enhanced**: Dark theme integration, responsive controls

### Dependencies

```json
{
  "leaflet": "^1.9.x", // Core mapping library
  "react-leaflet": "^4.2.x", // React integration
  "framer-motion": "^12.x", // Animations
  "lucide-react": "^0.x" // Icons
}
```

## 🌍 Environment Variables

| Variable            | Description          | Default                     |
| ------------------- | -------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |
| `VITE_ENV`          | Environment mode     | `development`               |

**No map API tokens needed!** 🎉

## 🔗 Backend Integration

The frontend expects the same API endpoints as before:

### POST `/api/analyze`

```json
{
  "coordinates": {
    "longitude": 85.324,
    "latitude": 27.7172
  },
  "analysis_type": "landslide_risk"
}
```

### POST `/api/report` & `/api/data` & `/api/heatmap`

Same as previous implementation.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Custom Map Styling

The CSS includes custom Leaflet styling:

- Dark theme integration
- Custom marker animations
- Glassmorphism tile layer effects
- Responsive attribution styling

## 🎯 Advantages of OpenStreetMap

1. **🆓 Completely Free** - No API limits, no billing
2. **🌍 Global Coverage** - Worldwide map data
3. **👥 Community-Driven** - Constantly updated by contributors
4. **🔒 No Vendor Lock-in** - Open source and portable
5. **⚡ Fast Loading** - Efficient tile-based system
6. **📱 Mobile Friendly** - Works perfectly on all devices

## 🚧 Troubleshooting

### Common Issues

1. **Map tiles not loading**: Check internet connection
2. **Blank map**: Verify React Leaflet is properly imported
3. **Marker not appearing**: Check coordinate format (lat, lng order)
4. **API errors**: Verify backend is running

### Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🎉 Benefits of This Change

- ✅ **No Registration Required** - Start mapping immediately
- ✅ **No Credit Card Needed** - Completely free forever
- ✅ **No API Limits** - Use as much as you want
- ✅ **Better Performance** - Lighter weight than Mapbox GL
- ✅ **More Map Styles** - Access to diverse tile providers
- ✅ **Open Source** - Full control and transparency

## 📝 Next Steps

1. **Test the new map interface** - Click around and enjoy the free mapping!
2. **Customize tile providers** - Add more free providers if needed
3. **Implement heatmap overlays** - Using Leaflet heat plugins
4. **Add more interactive features** - Drawing tools, measure tools, etc.

## 🤝 Contributing

This OpenStreetMap implementation makes the project more accessible to everyone! No API barriers means easier development and deployment.

---

**🎉 Now you have a fully functional map interface with ZERO setup requirements!**
