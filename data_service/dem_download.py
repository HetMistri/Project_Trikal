# dem_download.py - Final Script using Direct AWS S3 Access

import os
import requests
import rasterio
import rasterio.merge
from shapely.geometry import box
from shapely.wkt import loads as wkt_loads
from shapely.errors import ShapelyError
import logging
from datetime import datetime
from typing import Tuple, Optional, List
import math


def setup_logging(log_dir: str = './logs') -> logging.Logger:
    """Setup professional logging."""
    os.makedirs(log_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = os.path.join(log_dir, f'dem_download_{timestamp}.log')
    logger = logging.getLogger('DEM_Downloader')
    logger.setLevel(logging.INFO)
    if logger.hasHandlers():
        logger.handlers.clear()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    # Handlers
    fh = logging.FileHandler(log_file, encoding='utf-8')
    fh.setFormatter(formatter)
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    logger.addHandler(fh)
    logger.addHandler(ch)
    return logger


def get_required_dem_tiles(bounds: Tuple[float, float, float, float]) -> List[str]:
    """Calculate the names of Copernicus 1x1 degree tiles needed to cover the bounds."""
    logger = logging.getLogger('DEM_Downloader')
    west, south, east, north = bounds

    # Floor/ceil to get the grid of tiles
    lon_start = math.floor(west)
    lon_end = math.ceil(east)
    lat_start = math.floor(south)
    lat_end = math.ceil(north)

    tiles = []
    for lon in range(lon_start, lon_end):
        for lat in range(lat_start, lat_end):
            ns = 'N' if lat >= 0 else 'S'
            ew = 'E' if lon >= 0 else 'W'
            # Format tile name like N23_E072
            tile_name = f"{ns}{abs(lat):02d}_{ew}{abs(lon):03d}"
            tiles.append(tile_name)

    logger.info(f"Calculated required DEM tiles: {tiles}")
    return tiles


def download_dem_from_aws(wkt_aoi: str, output_dir: str = './DEM_DATA') -> Optional[str]:
    """
    Downloads and clips Copernicus GLO-30 DEM from the public AWS S3 bucket.
    """
    logger = logging.getLogger('DEM_Downloader')

    try:
        aoi_geom = wkt_loads(wkt_aoi)
        bounds = aoi_geom.bounds
    except ShapelyError as e:
        logger.error(f"Invalid WKT string: {e}")
        return None

    # 1. Determine which tiles are needed
    tile_names = get_required_dem_tiles(bounds)
    if not tile_names:
        logger.error("Could not determine required DEM tiles.")
        return None

    # 2. Construct S3 URLs and open them remotely with rasterio
    s3_base_url = "https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/"
    remote_datasets = []
    for tile in tile_names:
        # Example filename: Copernicus_DSM_COG_10_N23_00_E072_00_DEM.tif
        url = f"{s3_base_url}Copernicus_DSM_COG_10_{tile.split('_')[0]}_00_{tile.split('_')[1]}_00_DEM/Copernicus_DSM_COG_10_{tile.split('_')[0]}_00_{tile.split('_')[1]}_00_DEM.tif"
        logger.info(f"Checking for remote tile: {url}")

        # Check if URL exists before trying to open
        try:
            head_response = requests.head(url)
            if head_response.status_code == 200:
                remote_datasets.append(rasterio.open(url))
            else:
                logger.warning(f"Tile not found at {url} (Status: {head_response.status_code}). Skipping.")
        except requests.exceptions.RequestException as e:
            logger.warning(f"Could not connect to {url}. Skipping. Reason: {e}")

    if not remote_datasets:
        logger.error("No valid DEM tiles found for the AOI on AWS S3.")
        return None

    # 3. Merge and clip the remote datasets
    logger.info(f"Merging and clipping {len(remote_datasets)} remote tile(s)...")
    try:
        # rasterio.merge.merge is powerful: it reads, merges, and clips in one step
        merged_data, merged_transform = rasterio.merge.merge(remote_datasets, bounds=bounds, precision=7)

        # Update metadata for the new clipped raster
        profile = remote_datasets[0].profile
        profile.update({
            "height": merged_data.shape[1],
            "width": merged_data.shape[2],
            "transform": merged_transform,
            "driver": "GTiff",
            "compress": "lzw"
        })

        # Close remote connections
        for ds in remote_datasets:
            ds.close()

    except Exception as e:
        logger.error(f"Failed during merge and clip process: {e}")
        return None

    # 4. Save the final clipped GeoTIFF
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_filepath = os.path.join(output_dir, f"DEM_COP30_AWS_{timestamp}.tif")

    logger.info(f"Saving final clipped DEM to: {output_filepath}")
    with rasterio.open(output_filepath, "w", **profile) as dst:
        dst.write(merged_data)

    if os.path.exists(output_filepath):
        logger.info("Successfully created final DEM file.")
        return output_filepath
    else:
        logger.error("Failed to save final DEM file.")
        return None


def main():
    """Main execution function."""
    logger = setup_logging()
    logger.info("Starting DEM Data Acquisition (Direct AWS S3 Access)")
    logger.info("=" * 60)

    config = {
        'WKT': "POLYGON((72.521 23.042, 72.535 23.042, 72.535 23.032, 72.521 23.032, 72.521 23.042))",
        'DOWNLOAD_DIR': './DEM_DATA',
    }

    logger.info(f"Area of Interest: {config['WKT']}")

    dem_filepath = download_dem_from_aws(
        wkt_aoi=config['WKT'],
        output_dir=config['DOWNLOAD_DIR']
    )

    logger.info("\n" + "=" * 60)
    if dem_filepath:
        file_size = os.path.getsize(dem_filepath)
        logger.info("DEM DOWNLOAD COMPLETE")
        logger.info(f"  File: {dem_filepath}")
        logger.info(f"  Size: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")
        return 0
    else:
        logger.error("DEM DOWNLOAD FAILED")
        return 1


if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)