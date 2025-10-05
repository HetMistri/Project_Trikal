# Integrated Himalayan Sentinel Backend Service

This integrated backend service combines SAR data processing, DEM analysis, and ML-based landslide prediction into a single Django application.

## Architecture Overview

The system has been restructured to eliminate the need for separate FastAPI services:

```
backend_service/
├── himaliyan_sentinel/           # Main Django project
│   ├── data_processing/          # SAR and DEM data acquisition
│   │   ├── sar_downloader.py     # SAR data from ASF
│   │   ├── dem_downloader.py     # DEM data from Copernicus
│   │   └── config.py             # Configuration management
│   ├── ml_analysis/              # Machine learning components
│   │   ├── data_processing.py    # Data processing for ML
│   │   ├── predictor.py          # ML prediction pipeline
│   │   └── mock_data.py          # Mock data for testing
│   ├── integrated_service.py     # Main orchestration service
│   └── mlapi/                    # Django REST API views
│       ├── views.py              # Updated with integrated pipeline
│       └── models.py             # Database models
```

## Key Features

### 1. Unified Data Processing Pipeline
- **SAR Data**: Automatic download from Alaska Satellite Facility (ASF)
- **DEM Data**: Automatic download from Copernicus DEM on AWS
- **Integrated Processing**: Single service handles both data types

### 2. Enhanced AOI Processing
The `AOIFormatView` now supports two modes:
- **Format Only**: Convert lat/lon to WKT polygon and date range
- **Full Analysis**: Run complete data processing + ML prediction pipeline

### 3. ML Analysis Integration
- Feature extraction from SAR and DEM data
- XGBoost-based landslide prediction (with fallback to rule-based mock predictions)
- Comprehensive risk assessment and hypothesis generation

### 4. Robust Error Handling
- Graceful fallbacks when data is unavailable
- Detailed logging at each processing step
- Partial analysis capability (e.g., DEM-only if SAR fails)

## API Endpoints

### 1. AOI Format and Analysis
```
POST /api/aoi-format/
```

**Input Options:**
```json
{
  "latitude": 28.2380,
  "longitude": 83.9956,
  "run_analysis": true
}
```

**Response (with analysis):**
```json
{
  "aoi": "POLYGON((...coordinates...))",
  "input_date": {
    "start": "2024-09-05T00:00:00Z",
    "end": "2024-10-05T23:59:59Z"
  },
  "coordinates": {
    "center_lat": 28.2380,
    "center_lon": 83.9956,
    "bounds": [...]
  },
  "analysis_completed": true,
  "analysis_results": {
    "heatmap": {
      "center_lat": 28.2381,
      "center_lon": 83.9957,
      "max_intensity": 0.823,
      "analysis_summary": {
        "total_area_km2": 8.1,
        "high_risk_area_km2": 1.2,
        "risk_distribution": {
          "low": 7234,
          "moderate": 1456,
          "high": 310
        }
      }
    },
    "risk_score": 0.823,
    "hypothesis_text": "Analysis complete. Maximum detected risk score is 0.82..."
  }
}
```

### 2. Service Status
```
GET /api/service-status/
```

**Response:**
```json
{
  "timestamp": "2024-10-05T12:00:00Z",
  "components": {
    "sar_downloader": "ready",
    "dem_downloader": "ready",
    "ml_predictor": "ready",
    "data_directories": {
      "base_dir": "/path/to/data",
      "sar_dir": "/path/to/sar",
      "dem_dir": "/path/to/dem"
    }
  },
  "configuration": {
    "default_polarizations": ["VV", "VH"],
    "earthdata_configured": true
  }
}
```

### 3. Traditional ML Request
```
POST /api/ml-request/
```

**Input:**
```json
{
  "area_coordinates": "POLYGON((...coordinates...))",
  "start_date": "2024-09-05",
  "end_date": "2024-10-05"
}
```

## Setup and Configuration

### 1. Environment Setup
Copy `.env.template` to `.env` and configure:

```bash
# Required for SAR data download
EARTHDATA_USERNAME=your_earthdata_username
EARTHDATA_PASSWORD=your_earthdata_password

# Django configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 2. Install Dependencies
```bash
cd backend_service/himaliyan_sentinel
pip install -r requirements.txt
```

### 3. Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Run the Server
```bash
python manage.py runserver
```

## Data Flow

1. **Frontend Request**: User clicks on map → sends lat/lon coordinates
2. **AOI Processing**: Backend converts to WKT polygon + generates date range
3. **Data Acquisition**: 
   - Downloads DEM data from Copernicus
   - Downloads SAR data from ASF (if available)
4. **Feature Processing**:
   - Calculates slope from DEM
   - Calculates backscatter changes from SAR
   - Generates coherence and ratio features
5. **ML Prediction**:
   - Processes features through trained model
   - Generates risk scores and hypothesis
6. **Response**: Returns comprehensive analysis results to frontend

## Directory Structure After Integration

```
data_processing/
├── data/
│   ├── SAR_DATA/
│   │   ├── SAR_VV/
│   │   └── SAR_VH/
│   └── DEM_DATA/
└── logs/
```

## Error Handling and Fallbacks

- **Missing SAR data**: Uses mock SAR data for testing
- **Missing DEM data**: Analysis fails gracefully with error message
- **Network issues**: Detailed error reporting for each download step
- **ML model unavailable**: Falls back to rule-based predictions

## Logging

All operations are logged with timestamps and detailed information:
- Data download progress
- Processing steps and duration
- Error conditions and recovery attempts
- ML prediction results

Log files are stored in `data_processing/logs/` with timestamps.

## Testing

The system includes comprehensive mock data generation for testing without real satellite data downloads:
- Mock SAR data with realistic characteristics
- Mock DEM data with terrain features
- Rule-based predictions when ML model is unavailable

## Migration Notes

**Removed Services:**
- `data_service/` (FastAPI) → Integrated into Django
- `ml_service/` (FastAPI) → Integrated into Django  

**Benefits:**
- Single deployment unit
- Shared configuration and logging
- Direct data sharing (no HTTP overhead)
- Unified error handling
- Simplified development and debugging