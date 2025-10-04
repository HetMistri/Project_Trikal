# config.py - Configuration Management for SAR Processing

import os
from typing import Dict, Any
from datetime import datetime, timedelta

class SARProcessingConfig:
    """Configuration class for SAR data processing parameters."""
    
    # Default processing parameters
    DEFAULT_CONFIG = {
        # Data acquisition
        'PLATFORM': 'SENTINEL1',
        'DATASET': 'OPERA-S1',
        'POLARIZATIONS': ['VV'],  # Could expand to ['VV', 'VH'] 
        'MAX_CLOUD_COVER': 100,  # SAR is weather-independent
        
        # Download settings
        'DOWNLOAD_TIMEOUT': 300,
        'CHUNK_SIZE': 8192,
        'MAX_RETRIES': 3,
        'VERIFY_DOWNLOADS': True,
        
        # Processing parameters
        'SPECKLE_FILTER': 'lee',  # Options: lee, frost, gamma_map
        'FILTER_WINDOW_SIZE': 5,
        'CALIBRATION_TYPE': 'sigma0',  # sigma0, gamma0, beta0
        
        # Analysis parameters
        'COHERENCE_THRESHOLD': 0.3,
        'CHANGE_DETECTION_METHOD': 'log_ratio',
        'MINIMUM_AREA_SQKM': 0.01,
        
        # File management
        'ORGANIZE_BY_DATE': True,
        'CREATE_THUMBNAILS': True,
        'COMPRESS_OUTPUTS': False,
        
        # Logging
        'LOG_LEVEL': 'INFO',
        'SAVE_PROCESSING_LOG': True,
        'MAX_LOG_FILES': 10
    }
    
    # Region-specific configurations
    REGIONAL_CONFIGS = {
        'himalaya': {
            'DEM_SOURCE': 'SRTM_30M',
            'TERRAIN_CORRECTION': True,
            'SLOPE_THRESHOLD_DEGREES': 15,
            'PREFERRED_ORBIT': 'ascending'
        },
        'kerala_wayanad': {
            'COORDINATES': (11.4667, 76.1333),  # Wayanad center
            'MONSOON_SEASON': ('06-01', '09-30'),
            'LANDSLIDE_SEASON': ('07-15', '08-31'),
            'RAINFALL_CORRELATION': True
        },
        'gujarat': {
            'COORDINATES': (23.0225, 72.5714),  # Gujarat center
            'ARID_REGION': True,
            'DUST_STORM_SEASON': ('04-01', '07-31'),
            'FLOOD_MONITORING': False
        }
    }

    @classmethod
    def get_config(cls, region: str = None) -> Dict[str, Any]:
        """Get configuration for specific region or default."""
        config = cls.DEFAULT_CONFIG.copy()
        
        if region and region in cls.REGIONAL_CONFIGS:
            config.update(cls.REGIONAL_CONFIGS[region])
            
        return config

    @classmethod
    def get_date_range_for_analysis(cls, event_date: str, 
                                  pre_event_days: int = 30, 
                                  post_event_days: int = 30) -> tuple:
        """Generate date ranges for change detection analysis."""
        try:
            event_dt = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
            
            pre_start = event_dt - timedelta(days=pre_event_days + 10)
            pre_end = event_dt - timedelta(days=5)
            
            post_start = event_dt + timedelta(days=1)
            post_end = event_dt + timedelta(days=post_event_days)
            
            return (
                pre_start.strftime('%Y-%m-%dT%H:%M:%SZ'),
                pre_end.strftime('%Y-%m-%dT%H:%M:%SZ'),
                post_start.strftime('%Y-%m-%dT%H:%M:%SZ'),
                post_end.strftime('%Y-%m-%dT%H:%M:%SZ')
            )
        except Exception as e:
            raise ValueError(f"Invalid event date format: {e}")

# Predefined AOIs for common study areas
STUDY_AREAS = {
    'wayanad_landslide_2024': {
        'wkt': "POLYGON((75.8 11.6, 76.2 11.6, 76.2 11.3, 75.8 11.3, 75.8 11.6))",
        'name': 'Wayanad Landslide Area 2024',
        'event_date': '2024-07-30T00:00:00Z',
        'region': 'kerala_wayanad'
    },
    'chamoli_uttarakhand': {
        'wkt': "POLYGON((79.4 30.3, 79.8 30.3, 79.8 30.0, 79.4 30.0, 79.4 30.3))",
        'name': 'Chamoli District Landslide Zone',
        'event_date': '2021-02-07T00:00:00Z',
        'region': 'himalaya'
    },
    'gujarat_test_site': {
        'wkt': "POLYGON((72.521 23.042, 72.535 23.042, 72.535 23.032, 72.521 23.032, 72.521 23.042))",
        'name': 'Gujarat Test Site',
        'region': 'gujarat'
    }
}

# Processing quality checks
QUALITY_THRESHOLDS = {
    'min_file_size_mb': 10,  # Minimum expected file size
    'max_file_size_mb': 500,  # Maximum reasonable file size
    'min_scenes_for_analysis': 3,
    'max_temporal_gap_days': 15,
    'coherence_quality_threshold': 0.7
}

def validate_processing_environment() -> Dict[str, bool]:
    """Validate that required libraries and resources are available."""
    checks = {}
    
    try:
        import asf_search
        checks['asf_search'] = True
    except ImportError:
        checks['asf_search'] = False
    
    try:
        import shapely
        checks['shapely'] = True
    except ImportError:
        checks['shapely'] = False
    
    try:
        import rasterio
        checks['rasterio'] = True
    except ImportError:
        checks['rasterio'] = False
    
    try:
        import numpy
        checks['numpy'] = True
    except ImportError:
        checks['numpy'] = False
    
    # Check disk space (rough estimate)
    try:
        import shutil
        total, used, free = shutil.disk_usage(".")
        checks['sufficient_disk_space'] = free > 5 * 1024**3  # 5GB free
        checks['free_space_gb'] = free / (1024**3)
    except:
        checks['sufficient_disk_space'] = None
        checks['free_space_gb'] = None
    
    return checks