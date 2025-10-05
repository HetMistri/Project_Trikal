# train_basic_model.py - Create placeholder ML model
import numpy as np
import pandas as pd
import pickle
from pathlib import Path

def create_placeholder_model():
    """Create a simple placeholder model for testing."""
    # Mock training data
    n_samples = 1000
    features = pd.DataFrame({
        'slope': np.random.uniform(0, 60, n_samples),
        'backscatter_change': np.random.uniform(-10, 10, n_samples),
        'coherence': np.random.uniform(0, 1, n_samples),
        'ratio_change': np.random.uniform(-1, 1, n_samples)
    })
    
    # Simple rule-based labels for training
    labels = ((features['slope'] > 30) & 
              (features['coherence'] < 0.4) & 
              (abs(features['backscatter_change']) > 5)).astype(int)
    
    try:
        import xgboost as xgb
        
        # Train XGBoost model
        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        model.fit(features, labels)
        
        # Save model
        model_path = Path(__file__).parent / "ml_analysis" / "himalayan_sentinel_model.json"
        model.save_model(str(model_path))
        
        print(f"SUCCESS: XGBoost model saved to {model_path}")
        return True
        
    except ImportError:
        print("WARNING: XGBoost not available, creating pickle fallback")
        
        # Create simple fallback
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(features, labels)
        
        model_path = Path(__file__).parent / "ml_analysis" / "fallback_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
            
        print(f"SUCCESS: Fallback model saved to {model_path}")
        return True

if __name__ == "__main__":
    create_placeholder_model()
