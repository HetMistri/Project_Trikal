# predictor.py - ML prediction functionality
import os
import numpy as np
import pandas as pd
import logging
from pathlib import Path
from typing import Dict, Optional
from .data_processing import DataProcessor

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

class LandslidePredictor:
    """Handles ML prediction for landslide risk assessment."""
    
    def __init__(self):
        self.logger = logging.getLogger('SAR_Processor')
        self.data_processor = DataProcessor()
        self.model = None
        self.model_loaded = False
        
        # Try to load the model
        self._load_model()
    
    def _load_model(self):
        """Load the trained XGBoost model."""
        if not XGBOOST_AVAILABLE:
            self.logger.warning("XGBoost not available. Predictions will use mock data.")
            return
        
        model_path = Path(__file__).parent / "himalayan_sentinel_model.json"
        
        if model_path.exists():
            try:
                self.model = xgb.XGBClassifier()
                self.model.load_model(str(model_path))
                self.model_loaded = True
                self.logger.info("ML model loaded successfully")
            except Exception as e:
                self.logger.error(f"Failed to load ML model: {e}")
                self.model_loaded = False
        else:
            self.logger.warning(f"Model file not found at {model_path}. Using mock predictions.")
            self.model_loaded = False
    
    def generate_hypothesis(self, risk_scores: np.ndarray, features: pd.DataFrame) -> dict:
        """Generate hypothesis based on risk scores and feature analysis."""
        try:
            # Calculate statistics
            max_risk = float(np.max(risk_scores))
            mean_risk = float(np.mean(risk_scores))
            high_risk_count = int(np.sum(risk_scores > 0.7))
            total_pixels = len(risk_scores)
            
            # Analyze features for insights
            mean_slope = float(features['slope'].mean()) if 'slope' in features else 0
            mean_coherence = float(features['coherence'].mean()) if 'coherence' in features else 0
            mean_backscatter_change = float(features['backscatter_change'].mean()) if 'backscatter_change' in features else 0
            
            # Generate hypothesis text
            risk_level = "HIGH" if max_risk > 0.8 else "MODERATE" if max_risk > 0.5 else "LOW"
            
            hypothesis_parts = [
                f"Landslide risk assessment completed with {risk_level} maximum risk (score: {max_risk:.3f}).",
                f"Analysis of {total_pixels:,} pixels shows {high_risk_count:,} high-risk areas (>{0.7:.1f} threshold).",
                f"Average terrain slope: {mean_slope:.1f}°, coherence: {mean_coherence:.3f}."
            ]
            
            # Add specific insights based on data
            if mean_slope > 30:
                hypothesis_parts.append("Steep terrain significantly increases landslide susceptibility.")
            
            if mean_coherence < 0.4:
                hypothesis_parts.append("Low coherence suggests surface changes or vegetation loss.")
                
            if abs(mean_backscatter_change) > 2:
                hypothesis_parts.append("Significant backscatter changes indicate surface modifications.")
            
            hypothesis_text = " ".join(hypothesis_parts)
            
            # Create heatmap data structure
            # For now, create a simple grid representation
            risk_2d = risk_scores.reshape(int(np.sqrt(len(risk_scores))), -1) if len(risk_scores) > 0 else np.array([[0]])
            
            # Find coordinates of highest risk area (mock coordinates)
            max_risk_idx = np.unravel_index(np.argmax(risk_2d), risk_2d.shape)
            
            heatmap_data = {
                "center_lat": 28.2380 + (max_risk_idx[0] / risk_2d.shape[0]) * 0.1,  # Mock coordinates
                "center_lon": 83.9956 + (max_risk_idx[1] / risk_2d.shape[1]) * 0.1,
                "max_intensity": max_risk,
                "grid_size": risk_2d.shape,
                "high_risk_pixels": high_risk_count,
                "analysis_summary": {
                    "total_area_km2": total_pixels * 0.0009,  # Rough estimate (30m pixels)
                    "high_risk_area_km2": high_risk_count * 0.0009,
                    "risk_distribution": {
                        "low": int(np.sum(risk_scores < 0.3)),
                        "moderate": int(np.sum((risk_scores >= 0.3) & (risk_scores < 0.7))),
                        "high": high_risk_count
                    }
                }
            }
            
            return {
                "heatmap": heatmap_data,
                "risk_score": max_risk,
                "hypothesis_text": hypothesis_text
            }
            
        except Exception as e:
            self.logger.error(f"Error generating hypothesis: {e}")
            return {
                "heatmap": {"error": "Failed to generate heatmap"},
                "risk_score": 0.0,
                "hypothesis_text": f"Analysis failed: {str(e)}"
            }
    
    def make_prediction(self, file_paths: Dict[str, str]) -> Dict[str, any]:
        """Make landslide risk prediction based on processed data."""
        try:
            self.logger.info("Starting ML prediction pipeline...")
            
            # Process all data into features
            features_df = self.data_processor.process_all_data(file_paths)
            
            if features_df is None:
                return {
                    "heatmap": {"error": "Data processing failed"},
                    "risk_score": 0.0,
                    "hypothesis_text": "Unable to process input data for prediction."
                }
            
            # Make predictions
            if self.model_loaded and self.model is not None:
                # Use trained model
                try:
                    predictions = self.model.predict_proba(features_df)
                    risk_scores = predictions[:, 1]  # Get probability of landslide class
                    self.logger.info("Predictions made using trained ML model")
                except Exception as e:
                    self.logger.error(f"Error using trained model: {e}")
                    risk_scores = self._generate_mock_predictions(features_df)
            else:
                # Use mock predictions
                risk_scores = self._generate_mock_predictions(features_df)
            
            # Generate final hypothesis
            results = self.generate_hypothesis(risk_scores, features_df)
            
            self.logger.info(f"Prediction complete. Max risk score: {results['risk_score']:.3f}")
            return results
            
        except Exception as e:
            error_msg = f"Prediction pipeline failed: {e}"
            self.logger.error(error_msg)
            return {
                "heatmap": {"error": "Prediction failed"},
                "risk_score": 0.0,
                "hypothesis_text": error_msg
            }
    
    def _generate_mock_predictions(self, features_df: pd.DataFrame) -> np.ndarray:
        """Generate mock predictions based on simple rules."""
        self.logger.info("Generating mock predictions based on feature rules")
        
        # Simple rule-based approach for testing
        slope = features_df['slope'].values
        coherence = features_df['coherence'].values if 'coherence' in features_df else np.ones(len(slope))
        backscatter_change = features_df['backscatter_change'].values if 'backscatter_change' in features_df else np.zeros(len(slope))
        
        # Risk increases with:
        # - Higher slope
        # - Lower coherence  
        # - Larger backscatter changes
        risk_from_slope = np.clip(slope / 60.0, 0, 1)  # Normalize slope (max 60°)
        risk_from_coherence = 1 - coherence  # Lower coherence = higher risk
        risk_from_backscatter = np.clip(np.abs(backscatter_change) / 10.0, 0, 1)  # Normalize change
        
        # Combine factors
        combined_risk = (risk_from_slope * 0.5 + 
                        risk_from_coherence * 0.3 + 
                        risk_from_backscatter * 0.2)
        
        # Add some randomness but keep it realistic
        np.random.seed(42)  # For reproducible results
        noise = np.random.normal(0, 0.1, len(combined_risk))
        final_risk = np.clip(combined_risk + noise, 0, 1)
        
        return final_risk