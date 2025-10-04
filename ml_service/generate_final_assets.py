import sys
import os
import json
import xgboost as xgb
import numpy as np
import pandas as pd
import rasterio

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml_service.app.logic.features import calculate_backscatter_change, calculate_vh_vv_ratio
from ml_service.app.logic.data_processing import match_shapes, assemble_feature_table, create_rule_based_labels

def main():
    """Runs the full pipeline to train a model and generate a final result JSON."""
    print("--- Starting Final Asset Generation ---")

    # 1. LOAD REAL DATA
    print("Step 1: Loading real data files...")
    vv_before_path = 'data/pre_event_vv.tif'
    vv_after_path = 'data/post_event_vv.tif'
    vh_before_path = 'data/pre_event_vh.tif'
    vh_after_path = 'data/post_event_vh.tif'
    coherence_path = 'data/coherence_map.tif'
    slope_path = 'data/dem_slope.tif'

    with rasterio.open(vv_before_path) as f: vv_before = f.read(1)
    with rasterio.open(vv_after_path) as f: vv_after = f.read(1)
    with rasterio.open(vh_before_path) as f: vh_before = f.read(1)
    with rasterio.open(vh_after_path) as f: vh_after = f.read(1)
    with rasterio.open(coherence_path) as f: coherence = f.read(1)
    with rasterio.open(slope_path) as f: slope = f.read(1)

    # 2. MATCH SHAPES
    print("Step 2: Matching data shapes...")
    vv_before, vv_after = match_shapes(vv_before, vv_after)
    vh_before, vh_after = match_shapes(vh_before, vh_after)
    # Match other arrays to the new, smaller shape
    coherence, slope = match_shapes(coherence, vv_before)

    # 3. CALCULATE FEATURES
    print("Step 3: Calculating features...")
    backscatter_change = calculate_backscatter_change(vv_before, vv_after)
    ratio_before = calculate_vh_vv_ratio(vh_before, vv_before)
    ratio_after = calculate_vh_vv_ratio(vh_after, vv_after)
    ratio_change = ratio_after - ratio_before

    # 4. ASSEMBLE DATASET (X) and LABELS (y)
    print("Step 4: Assembling dataset...")
    X = assemble_feature_table(slope, backscatter_change, coherence, ratio_change)
    y = create_rule_based_labels(coherence, slope)
    X.fillna(0, inplace=True) # Fill any remaining NaN values

    # 5. TRAIN AND SAVE MODEL
    print("Step 5: Training and saving the model...")
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X, y)
    model.save_model("himalayan_sentinel_model.json")
    print("...Model saved as himalayan_sentinel_model.json")

    # 6. GENERATE AND SAVE FINAL RESULT
    print("Step 6: Generating and saving final result...")
    predictions = model.predict_proba(X)
    risk_scores = predictions[:, 1]
    
    highest_risk_score = risk_scores.max()
    highest_risk_index = risk_scores.argmax()
    top_risk_features = X.iloc[highest_risk_index]
    slope_at_risk = top_risk_features['slope']
    coherence_at_risk = top_risk_features['coherence']

    hypothesis_text = (
        f"Analysis complete. The highest risk was found on a slope of {slope_at_risk:.1f} degrees. "
        f"This location showed a coherence value of {coherence_at_risk:.2f}, indicating significant ground disturbance. "
        f"Maximum detected risk score is {highest_risk_score:.2f}."
    )

    final_result = {
        "heatmap": {"message": "Final heatmap generation is handled by the frontend visualization."},
        "risk_score": float(highest_risk_score),
        "hypothesis_text": hypothesis_text
    }

    with open('data/case_study_1_result.json', 'w') as f:
        json.dump(final_result, f, indent=4)
    print("...Final result saved to data/case_study_1_result.json")

    print("--- Final Asset Generation Complete ---")

if __name__ == "__main__":
    main()