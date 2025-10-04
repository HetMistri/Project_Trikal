# Frontend Service - World Map Location Selector

A React-based frontend application that allows users to select a location on a world map and send the coordinates along with a timestamp to a backend API.

## Features

- 🗺️ **Fullscreen interactive map** - Immersive Google Maps/Apple Maps-style interface
- 📍 Click anywhere on the map to select coordinates
- ✅ Floating confirm button for clean UX
- 📡 Real-time coordinate display in floating panel
- ⏱️ Automatic timestamp generation
- 🎨 Modern glassmorphic UI with backdrop blur effects
- 📱 Fully responsive for mobile and desktop
- 🖱️ Smooth scroll wheel zoom enabled

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and dev server
- **Leaflet** - Interactive map library
- **React Leaflet** - React components for Leaflet
- **Axios** - HTTP client for API calls

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Navigate to the frontend directory:
```powershell
cd frontend_service
```

2. Install dependencies:
```powershell
npm install --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is required due to React 19 compatibility with react-leaflet. This is safe and the application works correctly.

## Configuration

The application is configured to send data to a Django backend. Update the API endpoint in `src/components/MapSelector.jsx` if needed:

```javascript
const BACKEND_API_URL = 'http://localhost:8000/api/coordinates';
```

### Expected Backend API Format

The frontend sends a POST request with the following JSON payload:

```json
{
  "latitude": 40.712776,
  "longitude": -74.005974,
  "timestamp": "2025-10-04T12:34:56.789Z"
}
```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```powershell
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Create an optimized production build:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

## Usage

1. Open the application in your browser
2. Click anywhere on the world map to select a location
3. The selected coordinates will be displayed above the map
4. Click the "Confirm" button to send the coordinates and timestamp to the backend
5. A success or error message will be displayed

## Project Structure

```
frontend_service/
├── src/
│   ├── components/
│   │   └── MapSelector.jsx      # Main map component with click handling
│   ├── assets/
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # Application styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Component Details

### MapSelector Component

The main component that handles:
- Rendering the interactive map
- Capturing click events on the map
- Displaying selected coordinates
- Sending data to the backend via API call
- Showing success/error messages

## Error Handling

The application provides clear error messages for common scenarios:
- No location selected when clicking "Confirm"
- Backend server not responding
- Network errors
- HTTP error responses from the backend

## Troubleshooting

### Map container initialization error

If you see "Map container is already initialized" error:
- This is a known issue with Leaflet and React 18/19 Strict Mode
- **Fixed:** StrictMode has been disabled in `main.jsx` to prevent this issue
- Leaflet doesn't support React's double-mounting behavior in development mode
- This is safe and doesn't affect production builds

### Map not displaying

If the map doesn't render, ensure:
1. Dependencies are installed: `npm install --legacy-peer-deps`
2. Leaflet CSS is properly imported in `MapSelector.jsx`
3. Browser console shows no errors

### CORS Issues

If you encounter CORS errors when sending data to the backend:
1. Ensure the Django backend has CORS configured
2. Add `django-cors-headers` to the backend
3. Configure allowed origins in Django settings

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual port.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

This frontend is designed to work with a Django backend. The backend developer should:

1. Create an endpoint at `/api/coordinates` (or update the URL in MapSelector.jsx)
2. Accept POST requests with JSON payload containing `latitude`, `longitude`, and `timestamp`
3. Configure CORS to allow requests from the frontend origin
4. Return appropriate success/error responses

### Example Django View (for backend reference)

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def save_coordinates(request):
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    timestamp = request.data.get('timestamp')
    
    # Process and save data
    # ...
    
    return Response({
        'message': 'Coordinates received successfully',
        'data': {
            'latitude': latitude,
            'longitude': longitude,
            'timestamp': timestamp
        }
    }, status=status.HTTP_201_CREATED)
```

## License

This project is part of Project_Trikla.

## Contributing

When making changes:
1. Create a feature branch from `frontend`
2. Test your changes locally
3. Open a pull request with a clear description

## Contact

For issues or questions, please contact the project maintainers.
