# Integration Plan: ML Service and Data Service with Backend

## 🎯 Overview
This document outlines the integration plan for connecting the ML service, data service, and backend service into a cohesive workflow. The goal is to create a seamless pipeline where:
1. Frontend sends area coordinates
2. Backend processes and validates the request
3. Data service downloads required satellite data
4. ML service processes the data and returns predictions
5. Results are returned to the frontend

## 📋 Phase 1: Data Service Integration
**Goal**: Enable the backend to trigger data downloads and process satellite data

### Tasks:
1. Create a new FastAPI endpoint in data_service:
```python
@app.post("/download")
async def download_data(request: DownloadRequest):
    # Validate WKT and dates
    # Download SAR data
    # Return paths to downloaded files
```

2. Update data_service/main.py to handle async operations
3. Create file storage structure:
```
/data
  /{request_id}
    /pre_event_vv.tif
    /post_event_vh.tif
    /dem_slope.tif
    ...
```

4. Add error handling and validation
5. Implement status checking endpoint

## 📋 Phase 2: ML Service Enhancement
**Goal**: Prepare ML service to handle real-time requests with downloaded data

### Tasks:
1. Update ML service models:
```python
class PredictionRequest(BaseModel):
    request_id: str
    data_paths: dict
    area_coordinates: str
```

2. Create data loading pipeline for real satellite data
3. Add preprocessing steps for SAR data
4. Implement error handling for corrupt/missing files
5. Add validation for input data formats

## 📋 Phase 3: Backend Service Updates
**Goal**: Create orchestration layer in Django backend

### Tasks:
1. Create new MLPipeline model:
```python
class MLPipeline(models.Model):
    request_id = models.UUIDField(primary_key=True)
    status = models.CharField(max_length=50)
    data_paths = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
```

2. Update MLRequestView with pipeline steps:
```python
class MLRequestView(APIView):
    async def post(self, request):
        # 1. Create request_id
        # 2. Trigger data download
        # 3. Wait for download completion
        # 4. Trigger ML processing
        # 5. Return results
```

3. Add background task handling with Celery
4. Implement status checking endpoint
5. Add cleanup procedures for temporary files

## 📋 Phase 4: API Integration
**Goal**: Connect all services with proper error handling and monitoring

### Tasks:
1. Create service communication layer:
```python
class ServiceClient:
    def __init__(self, base_url):
        self.base_url = base_url
        
    async def health_check(self):
        ...
    
    async def process_request(self, data):
        ...
```

2. Implement retry mechanisms
3. Add service health monitoring
4. Create unified error handling
5. Add request/response logging

## 📋 Phase 5: Testing and Validation
**Goal**: Ensure reliable end-to-end operation

### Tasks:
1. Create integration tests:
```python
class TestPipeline(TestCase):
    def test_end_to_end_flow(self):
        # Test complete pipeline
```

2. Implement stress testing
3. Add monitoring for processing times
4. Create rollback procedures
5. Test error scenarios

## 🔄 API Endpoints

### Data Service
- `POST /api/data/download`
- `GET /api/data/status/{request_id}`
- `GET /api/data/cleanup/{request_id}`

### ML Service
- `POST /api/ml/predict`
- `GET /api/ml/status/{request_id}`
- `GET /api/ml/health`

### Backend Service
- `POST /api/pipeline/start`
- `GET /api/pipeline/status/{request_id}`
- `GET /api/pipeline/results/{request_id}`

## ⚙️ Configuration Changes

### Data Service
```python
# data_service/config.py
STORAGE_PATH = "data/"
MAX_RETRIES = 3
CLEANUP_AFTER_HOURS = 24
```

### ML Service
```python
# ml_service/app/config.py
MODEL_PATH = "models/himalayan_sentinel_model.json"
BATCH_SIZE = 64
TIMEOUT_SECONDS = 300
```

### Backend Service
```python
# backend_service/settings.py
DATA_SERVICE_URL = "http://localhost:8001"
ML_SERVICE_URL = "http://localhost:8002"
CELERY_BROKER_URL = "redis://localhost:6379/0"
```

## 📊 Data Flow

1. Frontend → Backend
   - Area coordinates (WKT)
   - Date range
   - Request metadata

2. Backend → Data Service
   - Request ID
   - Area coordinates
   - Date range

3. Data Service → Storage
   - Downloaded SAR data
   - DEM data
   - Preprocessed files

4. Backend → ML Service
   - Request ID
   - Paths to data files
   - Processing parameters

5. ML Service → Backend
   - Prediction results
   - Confidence scores
   - Analysis metadata

6. Backend → Frontend
   - Final results
   - Visualization data
   - Status updates

## 🚀 Implementation Steps

1. Create required models and database migrations
2. Implement service clients and communication layers
3. Set up background task processing
4. Add monitoring and logging
5. Deploy services with Docker Compose
6. Run integration tests
7. Monitor performance and optimize

## ⚠️ Error Handling

1. Network failures
   - Implement retry mechanisms
   - Add circuit breakers

2. Data validation
   - Input validation at each step
   - Data format verification

3. Resource management
   - Disk space monitoring
   - Memory usage tracking

4. Service health
   - Health check endpoints
   - Automatic recovery procedures

## 🔍 Monitoring

1. Performance metrics
   - Processing times
   - Memory usage
   - Storage utilization

2. Error rates
   - Service failures
   - Validation errors
   - Timeout occurrences

3. Success metrics
   - Completed pipelines
   - Average processing time
   - Resource efficiency

## 📝 Notes

- Keep temporary files for 24 hours before cleanup
- Implement rate limiting for API endpoints
- Add authentication between services
- Monitor disk space usage
- Implement proper logging at each step
- Consider adding data compression for storage
- Plan for scalability and load balancing