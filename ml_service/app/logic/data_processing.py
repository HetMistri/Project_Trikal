import numpy as np
import pandas as pd

def match_shapes(array1: np.ndarray, array2: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Crops two 2D arrays to the smallest common shape."""
    min_height = min(array1.shape[0], array2.shape[0])
    min_width = min(array1.shape[1], array2.shape[1])
    cropped_array1 = array1[:min_height, :min_width]
    cropped_array2 = array2[:min_height, :min_width]
    return cropped_array1, cropped_array2

def assemble_feature_table(slope: np.ndarray, backscatter_change: np.ndarray, correlation: np.ndarray, ratio_change: np.ndarray) -> pd.DataFrame:
    """Assembles feature arrays into a single pandas DataFrame."""
    feature_data = {
        'slope': slope.flatten(),
        'backscatter_change': backscatter_change.flatten(),
        'correlation': correlation.flatten(), # <-- CORRECTED
        'ratio_change': ratio_change.flatten()
    }
    return pd.DataFrame(feature_data)

def create_rule_based_labels(correlation: np.ndarray, slope: np.ndarray) -> np.ndarray:
    """Creates a 'answer key' for training based on simple rules."""
    # Rule: a "landslide" is where correlation is low (< 0.3) AND slope is high (> 30)
    is_low_correlation = correlation < 0.3 # <-- CORRECTED
    is_high_slope = slope > 30
    labels = is_low_correlation & is_high_slope
    return labels.flatten().astype(int)