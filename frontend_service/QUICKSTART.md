# Quick Start Guide - Frontend to Backend

## 🚀 Start Both Servers

### Terminal 1: Start Django Backend
```powershell
cd backend_service\himaliyan_sentinel
python manage.py runserver
```

Expected output:
```
Django version 4.x.x, using settings 'himaliyan_sentinel.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Terminal 2: Start React Frontend
```powershell
cd frontend_service
npm run dev
```

Expected output:
```
VITE v7.x.x  ready in 1144 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## ✅ Test the Integration

1. **Open Browser**: Navigate to http://localhost:5173/
2. **Open Console**: Press F12 to see logs
3. **Click Map**: Click anywhere on the world map
4. **Click Button**: Click "✓ Send to Backend"
5. **Check Response**: See success message with AOI data

## 📊 Expected Flow

```
User clicks map
    ↓
Frontend captures lat/lng
    ↓
User clicks "Send to Backend"
    ↓
POST http://localhost:8000/api/aoi-format/
    { latitude: X, longitude: Y }
    ↓
Django receives request
    ↓
Creates bounding box polygon
    ↓
Returns AOI + date range
    ↓
Frontend displays success message
```

## 🧪 Test with Browser Console

If backend isn't working, test it directly:

```javascript
// Test backend directly from browser console
fetch('http://localhost:8000/api/aoi-format/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ latitude: 40.7128, longitude: -74.0060 })
})
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

## 🔧 Troubleshooting

### CORS Error?
Add to Django `settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Backend Not Found?
Make sure Django is running:
```powershell
cd backend_service\himaliyan_sentinel
python manage.py runserver
```

### Check if Backend is Up
Open: http://localhost:8000/admin/
(Should see Django admin login)

## 📝 Environment Variables (Optional)

Create `frontend_service/.env`:
```env
VITE_BACKEND_URL=http://localhost:8000
```

This allows you to change backend URL without modifying code.

## 🎯 Next Steps

1. ✅ Start both servers
2. ✅ Test the integration
3. Add more data to payload (if needed)
4. Handle additional backend responses
5. Add validation and error recovery
6. Add loading indicators
7. Display results on map

---

**Current Status**: Frontend is configured to send lat/lng to Django backend's AOI Format endpoint.
