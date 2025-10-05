# Frontend to Backend Data Flow Guide

## 🎯 Overview

Your project has a Django backend and React frontend. Here's how to send data from frontend to backend.

## 📍 Current Backend Endpoints

Based on your Django backend (`backend_service/himaliyan_sentinel/`):

### Base URL
```
http://localhost:8000/api/
```

### Available Endpoints

1. **AOI Format Endpoint** (Area of Interest)
   - **URL**: `POST http://localhost:8000/api/aoi-format/`
   - **Purpose**: Converts lat/lng coordinates to a bounding box (WKT format)
   - **Request Body**:
     ```json
     {
       "latitude": 23.0225,
       "longitude": 72.5714
     }
     ```
   - **Response**:
     ```json
     {
       "aoi": "POLYGON((...))",
       "input_date": {
         "start": "2025-09-04T12:00:00Z",
         "end": "2025-10-04T12:00:00Z"
       }
     }
     ```

2. **ML Request Endpoint**
   - **URL**: `POST http://localhost:8000/api/ml-requests/`
   - **Purpose**: Runs ML model on area coordinates
   - **Request Body**:
     ```json
     {
       "area_coordinates": [[...]],
       "start_date": "2025-09-01",
       "end_date": "2025-10-01"
     }
     ```

## 🔄 Three Ways to Send Data from Frontend

### Method 1: Using Fetch API (Native JavaScript)

```javascript
const sendToBackend = async (latitude, longitude) => {
  try {
    const response = await fetch('http://localhost:8000/api/aoi-format/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: latitude,
        longitude: longitude
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response:', data);
    return data;
  } catch (error) {
    console.error('Error sending to backend:', error);
    throw error;
  }
};
```

### Method 2: Using Axios (Recommended - Already in package.json)

```javascript
import axios from 'axios';

const sendToBackend = async (latitude, longitude) => {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/aoi-format/',
      {
        latitude: latitude,
        longitude: longitude
      }
    );
    
    console.log('Backend response:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
    } else {
      // Error setting up request
      console.error('Error:', error.message);
    }
    throw error;
  }
};
```

### Method 3: Using Custom Hook (Best Practice)

```javascript
// hooks/useBackendAPI.js
import { useState } from 'react';
import axios from 'axios';

export const useBackendAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const sendCoordinates = async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/aoi-format/`,
        { latitude, longitude }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      setLoading(false);
      throw err;
    }
  };

  return { sendCoordinates, loading, error };
};
```

## 🚀 How to Update Your MapSelector.jsx

Replace the `handleConfirm` function in your MapSelector component:

```javascript
import axios from 'axios';

function MapSelector() {
  // ... existing state ...

  const handleConfirm = async () => {
    if (!position) {
      setMessage('⚠️ Please select a location on the map first!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    const payload = {
      latitude: position.lat,
      longitude: position.lng,
    };

    try {
      // Send to backend
      const response = await axios.post(
        'http://localhost:8000/api/aoi-format/',
        payload
      );

      console.log('✅ Backend Response:', response.data);
      
      setMessage(
        `✅ Success! Coordinates sent to backend.\n` +
        `AOI: ${response.data.aoi.substring(0, 50)}...\n` +
        `Date Range: ${response.data.input_date.start} to ${response.data.input_date.end}`
      );

      // Auto-hide after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('❌ Error:', error);
      
      if (error.response) {
        setMessage(`❌ Server Error: ${error.response.status}\n${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setMessage('❌ No response from backend. Is Django server running?');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
      
      setTimeout(() => setMessage(''), 7000);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## ⚙️ Backend Setup Checklist

Before sending requests from frontend, ensure:

### 1. Django Server is Running
```bash
cd backend_service/himaliyan_sentinel
python manage.py runserver
```

### 2. CORS is Configured
Your Django `settings.py` should have:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# Allow frontend origin
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

# Or for development, allow all (NOT for production!)
# CORS_ALLOW_ALL_ORIGINS = True
```

### 3. Install CORS Headers (if not already)
```bash
pip install django-cors-headers
```

### 4. URLs are Properly Configured
Check `backend_service/himaliyan_sentinel/himaliyan_sentinel/urls.py`:
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('mlapi.urls')),
]
```

And `backend_service/himaliyan_sentinel/mlapi/urls.py`:
```python
from django.urls import path
from .views import AOIFormatView, MLRequestView

urlpatterns = [
    path('aoi-format/', AOIFormatView.as_view(), name='aoi-format'),
    path('ml-requests/', MLRequestView.as_view(), name='ml-request'),
]
```

## 🧪 Testing the Connection

### 1. Test Backend Directly (using curl or Postman)
```bash
curl -X POST http://localhost:8000/api/aoi-format/ \
  -H "Content-Type: application/json" \
  -d '{"latitude": 23.0225, "longitude": 72.5714}'
```

Expected response:
```json
{
  "aoi": "POLYGON((72.5614 23.0125, ...))",
  "input_date": {
    "start": "2025-09-04T...",
    "end": "2025-10-04T..."
  }
}
```

### 2. Test from Browser Console
Open your frontend (http://localhost:5173), open console (F12), and run:

```javascript
fetch('http://localhost:8000/api/aoi-format/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ latitude: 23.0225, longitude: 72.5714 })
})
  .then(r => r.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

## 🔧 Common Issues & Solutions

### Issue 1: CORS Error
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution**: Add `django-cors-headers` and configure CORS in Django settings.

### Issue 2: Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Solution**: Django server is not running. Start it with `python manage.py runserver`.

### Issue 3: 404 Not Found
```
Error: Request failed with status code 404
```

**Solution**: Check the URL path. Should be `/api/aoi-format/` not `/api/coordinates/`.

### Issue 4: 400 Bad Request
```
Error: Request failed with status code 400
{"error": "Missing latitude or longitude"}
```

**Solution**: Ensure you're sending `latitude` and `longitude` in the request body.

## 📊 Data Flow Diagram

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React Map     │  HTTP   │  Django Backend  │  Process│   ML Service    │
│  (Frontend)     │ ──────> │  AOIFormatView   │ ──────> │  (Optional)     │
│                 │  POST   │                  │         │                 │
│ - Click map     │         │ - Validate data  │         │ - Run model     │
│ - Get lat/lng   │         │ - Create polygon │         │ - Return result │
│ - Send to API   │  <────  │ - Return AOI     │  <────  │                 │
│ - Display result│ Response│                  │ Result  │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## 🎯 Next Steps

1. **Update MapSelector.jsx** - Replace console.log with actual API call
2. **Start Django backend** - Run `python manage.py runserver`
3. **Test the flow** - Click map → Send coordinates → Check backend response
4. **Add error handling** - Handle network errors, validation errors
5. **Add loading states** - Show spinner/loading indicator
6. **Display results** - Show backend response on the map

## 📝 Environment Variables

Create `.env` file in `frontend_service/`:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Then use in your code:
```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
```

---

**Note**: Your backend currently has `AOIFormatView` which converts a single lat/lng point to a polygon. Make sure this is the endpoint you want to use!
