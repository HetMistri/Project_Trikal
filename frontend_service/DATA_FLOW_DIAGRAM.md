# Frontend to Backend Data Flow - Visual Guide

## 🔄 Complete Data Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                               │
└───────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ User clicks map
                                  ↓
┌───────────────────────────────────────────────────────────────────────┐
│                       REACT FRONTEND (Port 5173)                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  MapSelector.jsx                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ 1. User clicks map at coordinates (lat, lng)                   │   │
│  │ 2. LocationMarker component captures click event               │   │
│  │ 3. setPosition({ lat: X, lng: Y })                            │   │
│  │ 4. Marker appears on map                                       │   │
│  │ 5. Coordinate panel shows: Lat: X, Lng: Y                     │   │
│  │ 6. Buttons appear: [✓ Send to Backend] [✕ Clear]              │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│                                  │ User clicks "Send to Backend"       │
│                                  ↓                                     │
│  handleConfirm() function                                             │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ const payload = {                                              │   │
│  │   latitude: position.lat,    // e.g., 40.7128                │   │
│  │   longitude: position.lng    // e.g., -74.0060               │   │
│  │ }                                                              │   │
│  │                                                                │   │
│  │ axios.post(                                                    │   │
│  │   'http://localhost:8000/api/aoi-format/',                   │   │
│  │   payload                                                      │   │
│  │ )                                                              │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                  │
                                  │ HTTP POST Request
                                  │ Content-Type: application/json
                                  │ Body: { latitude: 40.7128, longitude: -74.0060 }
                                  ↓
┌───────────────────────────────────────────────────────────────────────┐
│                     DJANGO BACKEND (Port 8000)                         │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  urls.py                                                              │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Route: /api/aoi-format/                                        │   │
│  │ View:  AOIFormatView                                           │   │
│  │ Method: POST                                                   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
│                                  ↓                                     │
│  views.py - AOIFormatView                                             │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ def post(self, request):                                       │   │
│  │                                                                │   │
│  │   # 1. Extract coordinates from request                       │   │
│  │   lat = request.data.get("latitude")    # 40.7128            │   │
│  │   lon = request.data.get("longitude")   # -74.0060           │   │
│  │                                                                │   │
│  │   # 2. Validate coordinates                                    │   │
│  │   if lat is None or lon is None:                              │   │
│  │     return Response(error, status=400)                        │   │
│  │                                                                │   │
│  │   # 3. Create bounding box polygon                            │   │
│  │   offset = 0.01                                               │   │
│  │   coords = [                                                  │   │
│  │     (lon - offset, lat - offset),  # Bottom-left             │   │
│  │     (lon + offset, lat - offset),  # Bottom-right            │   │
│  │     (lon + offset, lat + offset),  # Top-right               │   │
│  │     (lon - offset, lat + offset),  # Top-left                │   │
│  │     (lon - offset, lat - offset)   # Close polygon           │   │
│  │   ]                                                            │   │
│  │                                                                │   │
│  │   # 4. Convert to WKT (Well-Known Text) format                │   │
│  │   polygon = Polygon(coords)                                    │   │
│  │   wkt_format = polygon.wkt                                     │   │
│  │   # "POLYGON((-74.016 40.7028, ...))"                         │   │
│  │                                                                │   │
│  │   # 5. Calculate date range (30 days)                         │   │
│  │   end_date = datetime.now(pytz.UTC)                           │   │
│  │   start_date = end_date - timedelta(days=30)                  │   │
│  │                                                                │   │
│  │   # 6. Prepare response                                        │   │
│  │   response_data = {                                            │   │
│  │     "aoi": wkt_format,                                         │   │
│  │     "input_date": {                                            │   │
│  │       "start": "2025-09-04T12:00:00Z",                        │   │
│  │       "end": "2025-10-04T12:00:00Z"                           │   │
│  │     }                                                           │   │
│  │   }                                                            │   │
│  │                                                                │   │
│  │   return Response(response_data, status=200)                   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                  │
                                  │ HTTP Response (JSON)
                                  │ Status: 200 OK
                                  │ {
                                  │   "aoi": "POLYGON((-74.016 40.7028, ...))",
                                  │   "input_date": {
                                  │     "start": "2025-09-04T12:00:00Z",
                                  │     "end": "2025-10-04T12:00:00Z"
                                  │   }
                                  │ }
                                  ↓
┌───────────────────────────────────────────────────────────────────────┐
│                       REACT FRONTEND (Port 5173)                       │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  MapSelector.jsx - handleConfirm() catch block                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ const response = await axios.post(...)                         │   │
│  │                                                                │   │
│  │ // Success! We got response                                    │   │
│  │ console.log('✅ Backend Response:', response.data)             │   │
│  │                                                                │   │
│  │ // Extract data from response                                  │   │
│  │ const aoi = response.data.aoi                                  │   │
│  │ const startDate = response.data.input_date.start              │   │
│  │ const endDate = response.data.input_date.end                  │   │
│  │                                                                │   │
│  │ // Show success message to user                                │   │
│  │ setMessage(                                                    │   │
│  │   `✅ Success! Data sent to backend.\n` +                      │   │
│  │   `AOI: POLYGON(...)\n` +                                      │   │
│  │   `Date Range: 2025-09-04 to 2025-10-04`                      │   │
│  │ )                                                              │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                  │                                     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                  │
                                  ↓
┌───────────────────────────────────────────────────────────────────────┐
│                           USER SEES RESULT                             │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ✅ Success! Data sent to backend.                                    │
│  AOI: POLYGON((-74.016 40.7028, ...))                                 │
│  Date Range: 2025-09-04 to 2025-10-04                                │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

## 📦 Request/Response Examples

### Request (Frontend → Backend)
```http
POST /api/aoi-format/ HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Response (Backend → Frontend)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "aoi": "POLYGON((-74.016 40.7028, -74.004 40.7028, -74.004 40.7228, -74.016 40.7228, -74.016 40.7028))",
  "input_date": {
    "start": "2025-09-04T12:34:56Z",
    "end": "2025-10-04T12:34:56Z"
  }
}
```

## 🔍 Error Handling Flow

### Scenario 1: Backend Not Running
```
Frontend → axios.post() → ECONNREFUSED
                         ↓
                   error.request exists
                         ↓
                   Show message:
                   "No response from server.
                    Is Django running?"
```

### Scenario 2: Invalid Data (400 Bad Request)
```
Frontend → axios.post() → 400 Bad Request
                         ↓
                   error.response exists
                         ↓
                   Show message:
                   "Status: 400
                    Message: Missing latitude"
```

### Scenario 3: CORS Error
```
Frontend → axios.post() → CORS policy blocked
                         ↓
                   Browser blocks request
                         ↓
                   Console shows:
                   "Access to fetch has been blocked"
                         ↓
                   Fix: Add CORS headers in Django
```

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `frontend_service/src/components/MapSelector.jsx` | Main React component |
| `backend_service/himaliyan_sentinel/mlapi/views.py` | Django view handling requests |
| `backend_service/himaliyan_sentinel/mlapi/urls.py` | URL routing |
| `backend_service/himaliyan_sentinel/himaliyan_sentinel/settings.py` | CORS configuration |

## 📊 Data Transformation

```
User Click               Frontend Capture         Backend Processing
  (Map)                    (JavaScript)              (Python)
    │                           │                         │
    │  Lat: 40.7128            │                         │
    │  Lng: -74.0060           │                         │
    │                           │                         │
    └─────────────────────────►│                         │
                                │                         │
                      { latitude: 40.7128,                │
                        longitude: -74.0060 }             │
                                │                         │
                                └────────────────────────►│
                                                          │
                                                 Create bounding box:
                                                 [(-74.016, 40.7028),
                                                  (-74.004, 40.7028),
                                                  (-74.004, 40.7228),
                                                  (-74.016, 40.7228)]
                                                          │
                                                 Convert to WKT:
                                                 "POLYGON(...)"
                                                          │
                                                 Add date range:
                                                 30 days back
                                                          │
                                ┌────────────────────────┘
                                │
                      { aoi: "POLYGON(...)",
                        input_date: { ... } }
                                │
                   Display to user
```

---

**Summary**: Frontend captures lat/lng from map clicks, sends to Django backend via axios POST, backend creates polygon and date range, returns data, frontend displays success message.
