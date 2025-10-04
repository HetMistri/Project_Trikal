import numpy as np

def to_db(intensity_array: np.ndarray) -> np.ndarray:
    """Converts a linear intensity SAR array to the decibel (dB) scale."""
    intensity_safe = intensity_array.copy().astype(np.float32)
    intensity_safe[intensity_safe <= 0] = 1e-10
    db_array = 10 * np.log10(intensity_safe)
    return db_array

def calculate_backscatter_change(before_band: np.ndarray, after_band: np.ndarray) -> np.ndarray:
    """Calculates the temporal change in backscatter in the decibel (dB) scale."""
    before_db = to_db(before_band)
    after_db = to_db(after_band)
    change_array = after_db - before_db
    return change_array

def calculate_vh_vv_ratio(vh_band: np.ndarray, vv_band: np.ndarray) -> np.ndarray:
    """Calculates the VH/VV ratio from SAR backscatter data, with robust error handling."""
    if vh_band.shape != vv_band.shape:
        raise ValueError("Input vh_band and vv_band arrays must have the same shape.")
    vh_float = vh_band.astype(np.float32)
    vv_float = vv_band.astype(np.float32)
    vv_safe = vv_float.copy()
    vv_safe[vv_safe == 0] = np.nan
    with np.errstate(divide='ignore', invalid='ignore'):
        ratio = vh_float / vv_safe
    return ratio