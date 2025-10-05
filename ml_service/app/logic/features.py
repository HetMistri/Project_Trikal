import numpy as np
from skimage.registration import phase_cross_correlation
from skimage.util import view_as_windows


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


def calculate_correlation_map(before_band: np.ndarray, after_band: np.ndarray, window_size: int = 11, tile_size: int = 1024) -> np.ndarray:
    """
    Calculates a memory-efficient normalized cross-correlation map by processing in tiles.
    """
    if window_size % 2 == 0:
        window_size += 1
    pad_size = window_size // 2

    height, width = before_band.shape
    correlation_map = np.zeros_like(before_band, dtype=np.float32)

    # Pad the full images once at the beginning
    before_padded = np.pad(before_band, pad_size, mode='reflect')
    after_padded = np.pad(after_band, pad_size, mode='reflect')

    print("Calculating correlation map in tiles...")
    # Iterate through the image in tiles
    for r in range(0, height, tile_size):
        for c in range(0, width, tile_size):
            # Define the tile boundaries for the original image
            r_end = min(r + tile_size, height)
            c_end = min(c + tile_size, width)
            
            # Define the tile boundaries for the padded image (to include window borders)
            pr_start, pr_end = r, r_end + 2 * pad_size
            pc_start, pc_end = c, c_end + 2 * pad_size

            # Extract the tiles from the padded images
            before_tile_padded = before_padded[pr_start:pr_end, pc_start:pc_end]
            after_tile_padded = after_padded[pr_start:pr_end, pc_start:pc_end]

            # Create sliding windows for the current tile
            before_windows = view_as_windows(before_tile_padded, (window_size, window_size))
            after_windows = view_as_windows(after_tile_padded, (window_size, window_size))
            
            # Normalize windows for cross-correlation
            before_norm = before_windows - before_windows.mean(axis=(2, 3), keepdims=True)
            after_norm = after_windows - after_windows.mean(axis=(2, 3), keepdims=True)
            
            # Calculate correlation for the tile
            numerator = np.sum(before_norm * after_norm, axis=(2, 3))
            denominator = np.sqrt(np.sum(before_norm**2, axis=(2, 3)) * np.sum(after_norm**2, axis=(2, 3)))
            
            denominator[denominator == 0] = 1 # Avoid division by zero
            
            tile_corr = numerator / denominator
            
            # Place the result into the final output map
            correlation_map[r:r_end, c:c_end] = tile_corr

    print("...Correlation map complete.")
    return correlation_map