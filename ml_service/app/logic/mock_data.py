import numpy as np

def generate_mock_raster(height: int, width: int, seed: int | None = None) -> np.ndarray:
    """
    Generates a mock raster array with synthetic features.
    """
    if seed:
        np.random.seed(seed)

    mock_array = np.random.rand(height, width).astype(np.float32) * 50
    mock_array[20:40, 20:40] += 100
    return mock_array