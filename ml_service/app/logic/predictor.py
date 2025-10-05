import xgboost as xgb
import pandas as pd
import numpy as np

# Import your data processing and feature calculation functions
from .data_processing import assemble_feature_table, match_shapes
from .features import calculate_backscatter_change, calculate_vh_vv_ratio
# You will also need your 'to_db' and other feature helpers here

# --- 1. Load the TRAINED model from file ---
# This happens only once when the API server starts.
MODEL_PATH = "himalayan_sentinel_model.json"
model = xgb.XGBClassifier()
model.load_model(MODEL_PATH)
print("ML model loaded successfully.")


def generate_hypothesis(risk_scores: np.ndarray, features: pd.DataFrame) -> dict:
    """Analyzes model output and feature data to generate a dynamic hypothesis."""
    # (The function I gave you before goes here)
    highest_risk_score = risk_scores.max()
    # ... etc.
    response = {
        "heatmap": {"message": "Heatmap generation is the next step."},
        "risk_score": float(highest_risk_score),
        "hypothesis_text": f"Analysis complete. Maximum detected risk score is {highest_risk_score:.2f}."
    }
    return response


def make_prediction(file_paths: dict) -> dict:
    """
    Loads real data from file paths, runs the trained model, and returns a hypothesis.
    """
    # 2. Load the REAL data arrays from the file paths provided in the request
    # with rasterio.open(file_paths["slope_map_path"]) as f:
    #     slope_real = f.read(1)
    # ... Load all 6 real data files ...

    # For now, since you are still waiting on slope, we use mock data
    # THIS IS TEMPORARY
    from .mock_data import generate_mock_raster
    slope_real = generate_mock_raster(100, 100, seed=303) * 60
    backscatter_change_real = generate_mock_raster(100, 100, seed=1)
    coherence_real = generate_mock_raster(100, 100, seed=2)
    ratio_change_real = generate_mock_raster(100, 100, seed=3)
    
    # 3. Assemble the feature table
    X_live = assemble_feature_table(
        slope=slope_real,
        backscatter_change=backscatter_change_real,
        coherence=coherence_real,
        ratio_change=ratio_change_real
    )

    # 4. Use the loaded model to predict probabilities
    predictions = model.predict_proba(X_live)
    risk_scores = predictions[:, 1]  # Get the probability of the '1' class (landslide)

    # 5. Generate the final response using your other new function
    final_response = generate_hypothesis(risk_scores, X_live)
    
    return final_response