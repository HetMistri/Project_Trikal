import sys
import os
import numpy as np
import rasterio

# This is the critical part that adds the project root to Python's path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now we can use absolute imports starting from 'ml_service'
from ml_service.app.logic.features import calculate_vh_vv_ratio, calculate_backscatter_change
from ml_service.app.logic.mock_data import generate_mock_raster
from ml_service.app.logic.data_processing import match_shapes


def run_integration_test():
    """
    Tests the feature calculation pipeline using available real data
    and mock data for missing files.
    """
    print("--- Starting Feature Integration Test ---")

    # --- 1. Load Real Data ---
    print("Loading real data files...")
    vv_before_path = 'data/pre_event_vv.tif'
    vv_after_path = 'data/post_event_vv.tif'
    vh_before_path = 'data/pre_event_vh.tif'
    vh_after_path = 'data/post_event_vh.tif'
    
    with rasterio.open(vv_before_path) as f:
        vv_before_real = f.read(1)
    # ... (add loading for other real files: vv_after, vh_before, vh_after)
    vv_after_real = rasterio.open(vv_after_path).read(1)
    vh_before_real = rasterio.open(vh_before_path).read(1)
    vh_after_real = rasterio.open(vh_after_path).read(1)
    print("...Real SAR data loaded successfully.")

    # --- 2. Handle Missing Slope Data ---
    height, width = vv_before_real.shape
    print(f"...Slope file not found. Generating mock slope data with shape ({height}, {width}).")
    slope_real = generate_mock_raster(height, width, seed=303) * 60


    # --- Match Array Shapes ---
    print("Matching array shapes to prevent errors...")
    vv_before_matched, vv_after_matched = match_shapes(vv_before_real, vv_after_real)
    vh_before_matched, vh_after_matched = match_shapes(vh_before_real, vh_after_real)
    print(f"...Shapes matched. New shape for calculation is {vv_before_matched.shape}")


    # --- 3. Calculate Features ---
    print("Calculating all features...")
    backscatter_change = calculate_backscatter_change(vv_before_matched, vv_after_matched)
    ratio_before = calculate_vh_vv_ratio(vh_before_matched, vv_before_matched)
    ratio_after = calculate_vh_vv_ratio(vh_after_matched, vv_after_matched)
    ratio_change = ratio_after - ratio_before
    print("...Calculations successful.")

    # --- 4. Verify the output ---
    print("\n--- Verification Summary ---")
    print(f"Backscatter Change array shape: {backscatter_change.shape}")
    print(f"  Min: {np.nanmin(backscatter_change):.2f}, Max: {np.nanmax(backscatter_change):.2f}, Mean: {np.nanmean(backscatter_change):.2f}")
    print("--- Test Complete ---")


if __name__ == "__main__":
    run_integration_test()