# Debugging POST vs GET Issue

## 🔍 Problem
Frontend is sending POST request with axios, but backend is receiving GET request.

## 🧪 How to Debug This

### Step 1: Check Browser Network Tab

1. **Open Browser** → Navigate to http://localhost:5173/
2. **Open DevTools** → Press F12
3. **Go to Network Tab** → Click "Network"
4. **Clear existing requests** → Click 🚫 (clear icon)
5. **Click on map** → Select a location
6. **Click "Send to Backend"** button
7. **Look at the request** → Find request to `/api/aoi-format/`

### What to Check:
```
Request Method: POST or GET?
Request URL: http://localhost:8000/api/aoi-format/
Status Code: 200, 404, 405?
Request Headers: Content-Type: application/json?
Request Payload: { latitude: X, longitude: Y }
```

### Step 2: Check Console Logs

In the browser console, you should see:
```javascript
📍 Sending to Backend:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Latitude: 40.7128
📌 Longitude: -74.0060
🔗 URL: http://localhost:8000/api/aoi-format/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Common Causes

#### Cause 1: CORS Preflight Request
When you see BOTH requests:
```
OPTIONS /api/aoi-format/ (status 200)  ← PREFLIGHT
POST /api/aoi-format/    (actual request)
```

This is NORMAL. The OPTIONS request is a CORS preflight check.

**Solution**: Backend must handle OPTIONS requests properly.

#### Cause 2: Redirect (301/302)
If backend redirects POST to GET:
```
POST /api/aoi-format  → 301 Redirect → GET /api/aoi-format/
                        (missing /)
```

**Solution**: Ensure URL has trailing slash `/api/aoi-format/`

#### Cause 3: Method Not Allowed (405)
```
POST /api/aoi-format/ → 405 Method Not Allowed
```

**Solution**: Backend doesn't accept POST. Check Django view.

#### Cause 4: Browser Caching
Cached GET request being replayed.

**Solution**: Hard refresh (Ctrl+Shift+R) or disable cache in DevTools.

## 🔧 Quick Fixes

### Fix 1: Add Trailing Slash (Already in code)
```javascript
// ✅ CORRECT (has trailing slash)
axios.post(`${BACKEND_URL}/api/aoi-format/`, payload)

// ❌ WRONG (missing trailing slash)
axios.post(`${BACKEND_URL}/api/aoi-format`, payload)
```

### Fix 2: Explicit Headers
```javascript
const response = await axios.post(
  `${BACKEND_URL}/api/aoi-format/`,
  payload,
  {
    headers: {
      'Content-Type': 'application/json',
    }
  }
);
```

### Fix 3: Check Axios Config
```javascript
// Add this BEFORE axios.post to see what's being sent
axios.interceptors.request.use(request => {
  console.log('🔍 Axios Request:', request);
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Data:', request.data);
  return request;
});
```

## 🧪 Test with cURL

Test backend directly to confirm it accepts POST:

```bash
# Test POST request
curl -X POST http://localhost:8000/api/aoi-format/ \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060}'

# Test GET request (should fail or behave differently)
curl -X GET http://localhost:8000/api/aoi-format/
```

## 🔍 Django Backend Check

The backend should have:

```python
# views.py
class AOIFormatView(APIView):
    def post(self, request):  # ← POST method
        lat = request.data.get("latitude")
        lon = request.data.get("longitude")
        # ...
```

**NOT**:
```python
class AOIFormatView(APIView):
    def get(self, request):  # ← Wrong! Should be POST
        lat = request.GET.get("latitude")
        # ...
```

## 📊 Expected vs Actual

### Expected Flow:
```
Frontend → POST /api/aoi-format/ → Backend receives POST → Success
```

### What Backend is Saying:
```
Frontend → ??? → Backend receives GET → ???
```

## 🎯 Action Plan

1. **Check Network Tab** → Confirm POST is sent
2. **Check Console** → See any axios errors?
3. **Check Backend Logs** → What method does Django see?
4. **Test with cURL** → Bypass frontend entirely
5. **Check CORS** → OPTIONS preflight might be confusing

## 🚨 Most Likely Issues

### Issue 1: Backend Confusion - OPTIONS vs POST
Backend developer might be seeing OPTIONS (preflight) and thinking it's GET.

```
Browser sends:
1. OPTIONS /api/aoi-format/ (CORS preflight) ← Backend might be reporting this
2. POST /api/aoi-format/    (actual request)  ← This is what we want
```

### Issue 2: URL Redirect
```
POST /api/aoi-format  →  301 Redirect  →  GET /api/aoi-format/
        ↑                                        ↑
    (no slash)                              (adds slash, changes to GET)
```

### Issue 3: Django URL Configuration
```python
# urls.py - if this is wrong:
path('api/aoi-format', AOIFormatView.as_view())  # Missing trailing slash!

# Should be:
path('api/aoi-format/', AOIFormatView.as_view())
```

## 🔧 Temporary Debug Code

Add this to MapSelector.jsx to see EXACTLY what's being sent:

```javascript
const handleConfirm = async () => {
  // ... existing code ...

  // ADD THIS DEBUG BLOCK
  console.log('🔍 DEBUG INFO:');
  console.log('Axios version:', axios.VERSION);
  console.log('Request method:', 'POST');
  console.log('Request URL:', `${BACKEND_URL}/api/aoi-format/`);
  console.log('Request data:', JSON.stringify(payload));
  console.log('Request headers:', {
    'Content-Type': 'application/json'
  });

  try {
    const response = await axios({
      method: 'POST',  // Explicitly set method
      url: `${BACKEND_URL}/api/aoi-format/`,
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // ... rest of code
  }
};
```

## 📞 What to Ask Backend Team

1. "Can you show me the EXACT Django logs when I send the request?"
2. "What HTTP method is logged? POST or GET or OPTIONS?"
3. "Are you handling CORS OPTIONS requests properly?"
4. "What does your URL configuration look like?"
5. "Can you test with cURL to confirm POST works?"

---

**Next Step**: Open browser, check Network tab, and report what you see!
