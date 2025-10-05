# sar_downloader.py - SAR data downloading functionality
import asf_search as asf
import os
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from shapely.wkt import loads as wkt_loads
from shapely.errors import ShapelyError
from .config import DataProcessingConfig

class SARDownloader:
    """Handles SAR data downloading from ASF."""
    
    def __init__(self):
        self.config = DataProcessingConfig()
        self.logger = self._setup_logger()
        
    def _setup_logger(self) -> logging.Logger:
        """Set up logging for SAR processing."""
        self.config.ensure_directories()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_file = self.config.LOGS_DIR / f'sar_processing_{timestamp}.log'
        
        logger = logging.getLogger(f'SAR_Processor_{timestamp}')
        logger.setLevel(logging.INFO)
        logger.handlers.clear()
        
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        # File handler
        fh = logging.FileHandler(log_file, encoding='utf-8')
        fh.setFormatter(formatter)
        
        # Console handler
        ch = logging.StreamHandler()
        ch.setFormatter(formatter)
        
        logger.addHandler(fh)
        logger.addHandler(ch)
        
        return logger
    
    def _create_netrc_file(self) -> bool:
        """Create .netrc file with Earthdata credentials."""
        if not self.config.EARTHDATA_USERNAME or not self.config.EARTHDATA_PASSWORD:
            self.logger.error("Earthdata credentials not found. Please set EARTHDATA_USERNAME and EARTHDATA_PASSWORD.")
            return False

        try:
            home_dir = Path.home()
            netrc_path = home_dir / ".netrc"
            
            with open(netrc_path, 'w') as f:
                f.write(f"machine urs.earthdata.nasa.gov\n")
                f.write(f"    login {self.config.EARTHDATA_USERNAME}\n")
                f.write(f"    password {self.config.EARTHDATA_PASSWORD}\n")
            
            self.logger.info(f"Successfully created .netrc file at: {netrc_path}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to create .netrc file: {e}")
            return False
    
    def validate_inputs(self, wkt_aoi: str, start_date: str, end_date: str) -> Tuple[bool, Optional[str]]:
        """Validate WKT and date inputs."""
        # Validate WKT
        try:
            geom = wkt_loads(wkt_aoi)
            if not geom.is_valid:
                return False, f"Invalid geometry: {geom.explain_validity()}"
        except ShapelyError as e:
            return False, f"WKT parsing error: {str(e)}"
        
        # Validate dates
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            if start >= end:
                return False, f"Start date ({start}) must be before end date ({end})"
        except ValueError as e:
            return False, f"Date parsing error: {str(e)}"
        
        return True, None
    
    def download_sar_data(self, wkt_aoi: str, start_date: str, end_date: str, 
                         polarizations: List[str] = None) -> Dict[str, any]:
        """Download SAR GeoTIFF files for the specified area and time range."""
        if polarizations is None:
            polarizations = self.config.DEFAULT_POLARIZATIONS
        
        self.logger.info(f"🛰️ Starting SAR data download")
        self.logger.info(f"AOI: {wkt_aoi}")
        self.logger.info(f"Date range: {start_date} to {end_date}")
        self.logger.info(f"Polarizations: {polarizations}")
        
        # Validate inputs
        is_valid, error_msg = self.validate_inputs(wkt_aoi, start_date, end_date)
        if not is_valid:
            return {'success': False, 'error': error_msg}
        
        # Check for credentials first
        if not self.config.EARTHDATA_USERNAME or not self.config.EARTHDATA_PASSWORD:
            self.logger.warning("⚠️ Earthdata credentials not configured")
            return {
                'success': False, 
                'error': 'Earthdata credentials not found. Please set EARTHDATA_USERNAME and EARTHDATA_PASSWORD in .env file',
                'setup_required': True,
                'instructions': 'Register at https://urs.earthdata.nasa.gov/ and create .env file with credentials'
            }
        
        # Create .netrc file
        if not self._create_netrc_file():
            return {'success': False, 'error': 'Failed to create authentication file'}
        
        # Prepare directories
        self.config.ensure_directories()
        pol_dirs = {}
        for pol in polarizations:
            pol_dir = self.config.SAR_DATA_DIR / f'SAR_{pol}'
            pol_dirs[pol] = str(pol_dir)
        
        # Search for SAR data
        search_options = {
            'platform': asf.PLATFORM.SENTINEL1,
            'dataset': 'OPERA-S1',
            'intersectsWith': wkt_aoi,
            'start': start_date,
            'end': end_date
        }
        
        try:
            results = asf.search(**search_options)
            self.logger.info(f"Found {len(results)} potential scenes")
        except Exception as e:
            error_msg = f"Search failed: {e}"
            self.logger.error(error_msg)
            return {'success': False, 'error': error_msg}
        
        if not results:
            self.logger.warning("No SAR data found for the specified criteria")
            return {
                'success': False, 
                'error': 'No SAR data found for the specified criteria',
                'searched_criteria': {
                    'platform': 'Sentinel-1',
                    'dataset': 'OPERA-S1',
                    'aoi': wkt_aoi,
                    'date_range': f'{start_date} to {end_date}',
                    'polarizations': polarizations
                },
                'suggestions': [
                    'Try expanding the date range',
                    'Check if the AOI covers areas with SAR coverage',
                    'Verify the AOI coordinates are correct'
                ]
            }
        
        # Find valid oldest and newest scenes
        valid_oldest_scene, valid_newest_scene = None, None
        
        for product in results:
            urls = product.properties.get("additionalUrls", [])
            if all(any(url.endswith(f"_{pol}.tif") for url in urls) for pol in polarizations):
                valid_oldest_scene = product
                self.logger.info(f"Found valid oldest (pre) scene: {product.properties['sceneName']}")
                break
        
        for product in reversed(results):
            urls = product.properties.get("additionalUrls", [])
            if all(any(url.endswith(f"_{pol}.tif") for url in urls) for pol in polarizations):
                valid_newest_scene = product
                self.logger.info(f"Found valid newest (post) scene: {product.properties['sceneName']}")
                break
        
        products_to_download = list({
            p.properties['sceneName']: p for p in [valid_oldest_scene, valid_newest_scene] if p
        }.values())
        
        if not products_to_download:
            return {'success': False, 'error': f'No scenes found containing all requested polarizations: {polarizations}'}
        
        # Download files
        session = asf.ASFSession()
        downloaded_files = {pol: [] for pol in polarizations}
        
        self.logger.info(f"Starting download for {len(products_to_download)} selected scene(s)...")
        
        for product in products_to_download:
            scene_name = product.properties['sceneName']
            time_tag = 'pre' if product == valid_oldest_scene else 'post'
            self.logger.info(f"Processing {time_tag} scene: {scene_name}")
            
            try:
                urls = product.properties.get("additionalUrls", [])
                for pol in polarizations:
                    for url in (u for u in urls if u.endswith(f"_{pol}.tif")):
                        original_filename = os.path.basename(url)
                        simple_filename = f"{pol.lower()}_{time_tag}.tif"
                        final_filepath = os.path.join(pol_dirs[pol], simple_filename)
                        
                        # Download file
                        asf.download_url(url, path=pol_dirs[pol], filename=original_filename, session=session)
                        
                        # Rename to simple format
                        if os.path.exists(final_filepath):
                            os.remove(final_filepath)
                        os.rename(os.path.join(pol_dirs[pol], original_filename), final_filepath)
                        
                        self.logger.info(f"✅ Successfully created: {simple_filename}")
                        downloaded_files[pol].append(final_filepath)
            
            except Exception as e:
                self.logger.error(f"Download failed for {scene_name}: {e}")
        
        self.logger.info("🎉 SAR data download complete")
        return {
            'success': True, 
            'downloaded_files': downloaded_files,
            'log_file': str(self.logger.handlers[0].baseFilename)
        }