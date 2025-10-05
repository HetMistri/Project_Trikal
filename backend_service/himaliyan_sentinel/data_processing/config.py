# config.py - Configuration for data processing
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DataProcessingConfig:
    """Configuration for data processing operations."""
    
    # Base directories
    BASE_DIR = Path(__file__).parent.parent
    DATA_DIR = BASE_DIR / "data_processing" / "data"
    LOGS_DIR = BASE_DIR / "data_processing" / "logs"
    
    # SAR and DEM data directories
    SAR_DATA_DIR = DATA_DIR / "SAR_DATA"
    DEM_DATA_DIR = DATA_DIR / "DEM_DATA"
    
    # Earthdata credentials
    EARTHDATA_USERNAME = os.getenv('EARTHDATA_USERNAME')
    EARTHDATA_PASSWORD = os.getenv('EARTHDATA_PASSWORD')
    
    # Default polarizations
    DEFAULT_POLARIZATIONS = ['VV', 'VH']
    
    # DEM settings
    DEM_SOURCE = "https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/"
    
    @classmethod
    def ensure_directories(cls):
        """Ensure all required directories exist."""
        cls.DATA_DIR.mkdir(parents=True, exist_ok=True)
        cls.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        cls.SAR_DATA_DIR.mkdir(parents=True, exist_ok=True)
        cls.DEM_DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories for each polarization
        for pol in cls.DEFAULT_POLARIZATIONS:
            (cls.SAR_DATA_DIR / f"SAR_{pol}").mkdir(parents=True, exist_ok=True)