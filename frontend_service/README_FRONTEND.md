# Project Trikal - Frontend Service

A modern React-based frontend for the Project Trikal geohazard analysis platform, featuring glassmorphism UI design and interactive map components.

## Features

- 🗺️ **Interactive Map Interface** - Built with Mapbox GL JS and React Map GL
- ✨ **Glassmorphism Design** - Modern UI with beautiful glass effects
- 🎯 **Location Analysis** - Click anywhere on the map to analyze geohazard risks
- 📊 **Real-time Data Visualization** - Risk assessment with visual indicators
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🎨 **Smooth Animations** - Powered by Framer Motion

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Mapbox account and access token

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Mapbox token:**

   - Visit [Mapbox Account](https://account.mapbox.com/access-tokens/)
   - Create a new access token or use an existing one
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Replace `pk.your_mapbox_token_here` with your actual Mapbox token in `.env`

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173`

## Usage

### Basic Map Interaction

1. **Select a Location**: Click anywhere on the map to place a marker
2. **View Coordinates**: See latitude, longitude, and selection time in the popup card
3. **Generate Analysis**: Click "Generate Analysis" to process the location
4. **Review Results**: View risk assessment, confidence scores, and recommendations
5. **Download Data**: Use action buttons to download reports or data

### Map Controls

- **Zoom In/Out**: Use the + and - buttons on the bottom right
- **Locate User**: Click the navigation icon to center on your location
- **Change Map Style**: Click the layers icon to switch between map types
- **Clear Selection**: Use the trash button in the analysis panel

### Map Styles Available

- **Dark**: High-contrast dark theme (default)
- **Satellite**: Satellite imagery
- **Streets**: Standard street map
- **Outdoors**: Topographic style map

## Component Structure

```
src/
├── MapInterface.jsx     # Main map component
├── MapInterface.css     # Glassmorphism styles
├── apiService.js        # Backend API integration
├── App.jsx             # Root application component
└── main.jsx            # Application entry point
```

## Key Components

### MapInterface

The main component containing:

- Interactive map with Mapbox GL
- Sidebar with project info and instructions
- Map controls (zoom, location, style switcher)
- Location selection and analysis cards
- API integration for data fetching

### API Service

Handles communication with backend services:

- Location analysis requests
- Report and data downloads
- Heatmap data fetching
- Mock data fallbacks for development

## Glassmorphism Design

The UI features modern glassmorphism effects with:

- Semi-transparent backgrounds with backdrop blur
- Subtle borders and shadows
- Smooth hover and click animations
- Responsive design patterns

## Environment Variables

| Variable                   | Description            | Default                     |
| -------------------------- | ---------------------- | --------------------------- |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox GL access token | Required                    |
| `VITE_API_BASE_URL`        | Backend API base URL   | `http://localhost:8000/api` |
| `VITE_ENV`                 | Environment mode       | `development`               |

## Backend Integration

The frontend expects the following API endpoints:

### POST `/api/analyze`

Analyze a location for geohazard risks

```json
{
  "coordinates": {
    "longitude": 85.324,
    "latitude": 27.7172
  },
  "analysis_type": "landslide_risk"
}
```

### POST `/api/report`

Generate and download analysis report

```json
{
  "coordinates": {
    "longitude": 85.324,
    "latitude": 27.7172
  },
  "format": "pdf"
}
```

### POST `/api/data`

Download raw analysis data

```json
{
  "coordinates": {
    "longitude": 85.324,
    "latitude": 27.7172
  },
  "format": "json"
}
```

### POST `/api/heatmap`

Get heatmap visualization data

```json
{
  "center": {
    "longitude": 85.324,
    "latitude": 27.7172
  },
  "radius": 5000
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Mock Data

When the backend is unavailable, the API service automatically falls back to mock data generation, allowing frontend development without backend dependencies.

## Troubleshooting

### Common Issues

1. **Map not loading**: Check that your Mapbox token is correctly set in `.env`
2. **API errors**: Verify backend is running and `VITE_API_BASE_URL` is correct
3. **Blank screen**: Check browser console for JavaScript errors

### Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is part of the NASA Space Apps Challenge 2025 submission.
