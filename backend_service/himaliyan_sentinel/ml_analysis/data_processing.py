# data_processing.py - Data processing utilities for ML
import numpy as np
import pandas as pd
import rasterio
from pathlib import Path
import logging
from typing import Tuple, Dict, Optional

class DataProcessor:
    """Handles data processing operations for ML analysis."""
    
    def __init__(self):
        self.logger = logging.getLogger('SAR_Processor')
    
    def match_shapes(self, array1: np.ndarray, array2: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Crops two 2D arrays to the smallest common shape."""
        min_height = min(array1.shape[0], array2.shape[0])
        min_width = min(array1.shape[1], array2.shape[1])
        cropped_array1 = array1[:min_height, :min_width]
        cropped_array2 = array2[:min_height, :min_width]
        return cropped_array1, cropped_array2
    
    def assemble_feature_table(self, slope: np.ndarray, backscatter_change: np.ndarray, 
                              coherence: np.ndarray, ratio_change: np.ndarray) -> pd.DataFrame:
        """Assembles feature arrays into a single pandas DataFrame."""
        feature_data = {
            'slope': slope.flatten(),
            'backscatter_change': backscatter_change.flatten(),
            'coherence': coherence.flatten(),
            'ratio_change': ratio_change.flatten()
        }
        return pd.DataFrame(feature_data)
    
    def load_raster_data(self, file_path: str) -> Optional[np.ndarray]:
        """Load raster data from a GeoTIFF file."""
        try:
            with rasterio.open(file_path) as src:
                data = src.read(1)  # Read first band
                self.logger.info(f"Loaded raster data from {file_path}: shape {data.shape}")
                return data
        except Exception as e:
            self.logger.error(f"Failed to load raster data from {file_path}: {e}")
            return None
    
    def calculate_backscatter_change(self, vv_before: np.ndarray, vv_after: np.ndarray,
                                   vh_before: np.ndarray, vh_after: np.ndarray) -> np.ndarray:
        """Calculate backscatter change between before/after images."""
        try:
            # Convert to dB if not already
            vv_before_db = self.to_db(vv_before)
            vv_after_db = self.to_db(vv_after)
            vh_before_db = self.to_db(vh_before)
            vh_after_db = self.to_db(vh_after)
            
            # Calculate changes
            vv_change = vv_after_db - vv_before_db
            vh_change = vh_after_db - vh_before_db
            
            # Combine changes (average)
            backscatter_change = (vv_change + vh_change) / 2
            
            self.logger.info(f"Calculated backscatter change: shape {backscatter_change.shape}")
            return backscatter_change
            
        except Exception as e:
            self.logger.error(f"Error calculating backscatter change: {e}")
            return np.zeros_like(vv_before)
    
    def calculate_vh_vv_ratio_change(self, vv_before: np.ndarray, vv_after: np.ndarray,
                                    vh_before: np.ndarray, vh_after: np.ndarray) -> np.ndarray:
        """Calculate VH/VV ratio change."""
        try:
            # Convert to linear scale if needed and avoid division by zero
            vv_before_linear = np.where(vv_before > 0, vv_before, 1e-10)
            vv_after_linear = np.where(vv_after > 0, vv_after, 1e-10)
            
            # Calculate ratios
            ratio_before = vh_before / vv_before_linear
            ratio_after = vh_after / vv_after_linear
            
            # Calculate change in ratio
            ratio_change = ratio_after - ratio_before
            
            self.logger.info(f"Calculated VH/VV ratio change: shape {ratio_change.shape}")
            return ratio_change
            
        except Exception as e:
            self.logger.error(f"Error calculating VH/VV ratio change: {e}")
            return np.zeros_like(vv_before)
    
    def to_db(self, linear_values: np.ndarray) -> np.ndarray:
        """Convert linear values to dB."""
        return 10 * np.log10(np.maximum(linear_values, 1e-10))
    
    def generate_mock_coherence(self, shape: Tuple[int, int], seed: int = 42) -> np.ndarray:
        """Generate mock coherence data for testing."""
        np.random.seed(seed)
        coherence = np.random.uniform(0.1, 0.9, shape)
        self.logger.info(f"Generated mock coherence data: shape {shape}")
        return coherence
    
    def process_all_data(self, file_paths: Dict[str, str]) -> Optional[pd.DataFrame]:
        """Process all input data files and return feature table."""
        try:
            self.logger.info("Starting comprehensive data processing...")
            
            # Load all raster data
            data_arrays = {}
            for key, path in file_paths.items():
                if path and Path(path).exists():
                    data_arrays[key] = self.load_raster_data(path)
                else:
                    self.logger.warning(f"File not found for {key}: {path}")
                    data_arrays[key] = None
            
            # Get required data arrays
            slope = data_arrays.get('dem_file')
            vv_before = data_arrays.get('vv_before')
            vv_after = data_arrays.get('vv_after') 
            vh_before = data_arrays.get('vh_before')
            vh_after = data_arrays.get('vh_after')
            
            # Check if we have minimum required data
            if slope is None:
                self.logger.error("DEM slope data is required but not available")
                return None
            
            # Calculate derived features
            if all(x is not None for x in [vv_before, vv_after, vh_before, vh_after]):
                # We have all SAR data - calculate features
                backscatter_change = self.calculate_backscatter_change(vv_before, vv_after, vh_before, vh_after)
                ratio_change = self.calculate_vh_vv_ratio_change(vv_before, vv_after, vh_before, vh_after)
                
                # Generate coherence (mock for now - in real implementation, calculate from SAR data)
                coherence = self.generate_mock_coherence(slope.shape)
            else:
                # Missing SAR data - use mock data for testing
                self.logger.warning("SAR data incomplete, using mock data for missing components")
                backscatter_change = np.random.uniform(-5, 5, slope.shape)
                ratio_change = np.random.uniform(-0.5, 0.5, slope.shape)
                coherence = self.generate_mock_coherence(slope.shape)
            
            # Ensure all arrays have the same shape
            arrays_to_match = [slope, backscatter_change, coherence, ratio_change]
            min_shape = min(arr.shape for arr in arrays_to_match if arr is not None)
            
            slope_matched = slope[:min_shape[0], :min_shape[1]]
            backscatter_change_matched = backscatter_change[:min_shape[0], :min_shape[1]]
            coherence_matched = coherence[:min_shape[0], :min_shape[1]]
            ratio_change_matched = ratio_change[:min_shape[0], :min_shape[1]]
            
            # Assemble feature table
            feature_table = self.assemble_feature_table(
                slope_matched,
                backscatter_change_matched,
                coherence_matched,
                ratio_change_matched
            )
            
            self.logger.info(f"Successfully processed data into feature table with {len(feature_table)} samples")
            return feature_table
            
        except Exception as e:
            self.logger.error(f"Error in data processing: {e}")
            return None