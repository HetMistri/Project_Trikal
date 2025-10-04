import sys
import os
import xgboost as xgb
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml_service.app.logic.mock_data import generate_mock_raster
from ml_service.app.logic.data_processing import assemble_feature_table, create_rule_based_labels

def main():
    """Main function to run the model training pipeline on mock data."""
    print("--- Starting Mock Model Training Pipeline ---")

    # 1. Generate mock feature data
    mock_slope = generate_mock_raster(100, 100, seed=1) * 60
    mock_bs_change = generate_mock_raster(100, 100, seed=2)
    mock_coherence = generate_mock_raster(100, 100, seed=3) / 50
    mock_ratio_change = generate_mock_raster(100, 100, seed=4)

    # 2. Assemble the feature table (X)
    X = assemble_feature_table(mock_slope, mock_bs_change, mock_coherence, mock_ratio_change)

    # 3. Create the mock labels (y)
    y = create_rule_based_labels(mock_coherence, mock_slope)

    # 4. Train the XGBoost model
    print("Training XGBoost model on mock data...")
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X, y)
    print("...Mock model training complete!")

if __name__ == "__main__":
    main()