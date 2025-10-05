# mock_data.py - Mock data generation for testing
import numpy as np

def generate_mock_raster(height: int, width: int, seed: int = None) -> np.ndarray:
    """
    Generates a mock raster array with synthetic features.
    """
    if seed:
        np.random.seed(seed)

    mock_array = np.random.rand(height, width).astype(np.float32) * 50
    # Add a high-value area to simulate interesting features
    mock_array[20:40, 20:40] += 100
    return mock_array

def generate_mock_sar_data(shape: tuple, polarization: str = 'VV', time_type: str = 'before') -> np.ndarray:
    """Generate mock SAR data for testing."""
    np.random.seed(42 if time_type == 'before' else 43)
    
    if polarization == 'VV':
        # VV typically has higher values
        base_data = np.random.uniform(0.01, 0.5, shape)
    else:  # VH
        # VH typically has lower values
        base_data = np.random.uniform(0.001, 0.1, shape)
    
    # Add some spatial correlation
    for i in range(5):  # Smooth the data a bit
        base_data = 0.7 * base_data + 0.3 * np.roll(base_data, 1, axis=0)
        base_data = 0.7 * base_data + 0.3 * np.roll(base_data, 1, axis=1)
    
    return base_data.astype(np.float32)