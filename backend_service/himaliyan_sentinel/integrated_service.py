# integrated_service.py - Main service that coordinates data processing and ML analysis
import logging
from datetime import datetime
from typing import Dict, Tuple, Optional
from pathlib import Path

from data_processing.sar_downloader import SARDownloader
from data_processing.dem_downloader import DEMDownloader
from data_processing.config import DataProcessingConfig
from ml_analysis.predictor import LandslidePredictor

class IntegratedAnalysisService:
    """
    Main service that coordinates the complete pipeline:
    1. Download SAR and DEM data
    2. Process data for ML analysis
    3. Run ML prediction
    4. Return results
    """
    
    def __init__(self):
        self.config = DataProcessingConfig()
        self.sar_downloader = SARDownloader()
        self.dem_downloader = DEMDownloader()
        self.predictor = LandslidePredictor()
        self.logger = logging.getLogger('SAR_Processor')
        
    def run_complete_analysis(self, wkt_aoi: str, start_date: str, end_date: str) -> Dict[str, any]:
        """
        Run the complete analysis pipeline from AOI coordinates to ML results.
        
        Args:
            wkt_aoi: Well-Known Text representation of the Area of Interest
            start_date: Start date in ISO format (e.g., '2024-07-20T00:00:00Z')
            end_date: End date in ISO format (e.g., '2024-08-01T23:59:59Z')
            
        Returns:
            Dictionary with analysis results including heatmap, risk_score, and hypothesis
        """
        try:
            self.logger.info("🚀 Starting integrated analysis pipeline")
            self.logger.info(f"AOI: {wkt_aoi}")
            self.logger.info(f"Date range: {start_date} to {end_date}")
            
            # Step 1: Download DEM data
            self.logger.info("\n" + "="*50)
            self.logger.info("STEP 1: DEM Data Acquisition")
            self.logger.info("="*50)
            
            dem_result = self.dem_downloader.download_dem_data(wkt_aoi)
            
            if not dem_result['success']:
                return {
                    'success': False,
                    'error': f"DEM download failed: {dem_result['error']}",
                    'step_failed': 'dem_download'
                }
            
            # Step 2: Download SAR data
            self.logger.info("\n" + "="*50)
            self.logger.info("STEP 2: SAR Data Acquisition")
            self.logger.info("="*50)
            
            sar_result = self.sar_downloader.download_sar_data(wkt_aoi, start_date, end_date)
            
            if not sar_result['success']:
                # Continue with DEM-only analysis if SAR fails
                self.logger.warning(f"SAR download failed: {sar_result['error']}")
                self.logger.warning("Continuing with DEM-only analysis using mock SAR data")
                sar_files = {}
            else:
                sar_files = sar_result['downloaded_files']
            
            # Step 3: Prepare file paths for ML analysis
            self.logger.info("\n" + "="*50)
            self.logger.info("STEP 3: Preparing Data for ML Analysis")
            self.logger.info("="*50)
            
            file_paths = self._prepare_file_paths(dem_result, sar_files)
            self.logger.info(f"Prepared file paths: {file_paths}")
            
            # Step 4: Run ML prediction
            self.logger.info("\n" + "="*50)
            self.logger.info("STEP 4: Running ML Prediction")
            self.logger.info("="*50)
            
            ml_results = self.predictor.make_prediction(file_paths)
            
            # Step 5: Compile final results
            self.logger.info("\n" + "="*50)
            self.logger.info("STEP 5: Compiling Results")
            self.logger.info("="*50)
            
            final_results = {
                'success': True,
                'analysis_timestamp': datetime.now().isoformat(),
                'input_parameters': {
                    'aoi': wkt_aoi,
                    'start_date': start_date,
                    'end_date': end_date
                },
                'data_sources': {
                    'dem_available': dem_result['success'],
                    'sar_available': sar_result.get('success', False),
                    'files_processed': file_paths
                },
                'results': ml_results
            }
            
            self.logger.info("🎉 Integrated analysis pipeline completed successfully!")
            self.logger.info(f"Final risk score: {ml_results.get('risk_score', 'N/A')}")
            
            return final_results
            
        except Exception as e:
            error_msg = f"Integrated analysis pipeline failed: {e}"
            self.logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg,
                'analysis_timestamp': datetime.now().isoformat()
            }
    
    def _prepare_file_paths(self, dem_result: Dict, sar_files: Dict) -> Dict[str, Optional[str]]:
        """Prepare file paths dictionary for ML analysis."""
        file_paths = {
            'dem_file': dem_result.get('dem_file') if dem_result['success'] else None
        }
        
        # Add SAR file paths if available
        vv_files = sar_files.get('VV', [])
        vh_files = sar_files.get('VH', [])
        
        # Look for pre/post files
        for vv_file in vv_files:
            if 'pre' in Path(vv_file).name:
                file_paths['vv_before'] = vv_file
            elif 'post' in Path(vv_file).name:
                file_paths['vv_after'] = vv_file
                
        for vh_file in vh_files:
            if 'pre' in Path(vh_file).name:
                file_paths['vh_before'] = vh_file
            elif 'post' in Path(vh_file).name:
                file_paths['vh_after'] = vh_file
        
        # Set None for missing files
        for key in ['vv_before', 'vv_after', 'vh_before', 'vh_after']:
            if key not in file_paths:
                file_paths[key] = None
                
        return file_paths
    
    def get_service_status(self) -> Dict[str, any]:
        """Get the current status of all service components."""
        return {
            'timestamp': datetime.now().isoformat(),
            'components': {
                'sar_downloader': 'ready',
                'dem_downloader': 'ready', 
                'ml_predictor': 'ready' if self.predictor.model_loaded else 'mock_mode',
                'data_directories': {
                    'base_dir': str(self.config.DATA_DIR),
                    'sar_dir': str(self.config.SAR_DATA_DIR),
                    'dem_dir': str(self.config.DEM_DATA_DIR),
                    'logs_dir': str(self.config.LOGS_DIR)
                }
            },
            'configuration': {
                'default_polarizations': self.config.DEFAULT_POLARIZATIONS,
                'earthdata_configured': bool(self.config.EARTHDATA_USERNAME and self.config.EARTHDATA_PASSWORD)
            }
        }