# main.py - Final Version with Automatic .netrc Creation

import asf_search as asf
import os
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from shapely.wkt import loads as wkt_loads
from shapely.errors import ShapelyError
import json
import requests
import rasterio
import rasterio.merge
import math
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def setup_logging(log_dir: str = './logs') -> logging.Logger:
    # ... (logging setup code is unchanged)
    os.makedirs(log_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = os.path.join(log_dir, f'sar_processing_{timestamp}.log')
    logger = logging.getLogger('SAR_Processor')
    logger.setLevel(logging.INFO)
    logger.handlers.clear()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh = logging.FileHandler(log_file, encoding='utf-8')
    fh.setFormatter(formatter)
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    logger.addHandler(fh)
    logger.addHandler(ch)
    return logger

def create_netrc_file() -> bool:
    """
    Reads credentials from .env and creates a .netrc file in the user's home directory.
    Returns True on success, False on failure.
    """
    logger = logging.getLogger('SAR_Processor')
    username = os.getenv('EARTHDATA_USERNAME')
    password = os.getenv('EARTHDATA_PASSWORD')

    if not username or not password:
        logger.error("Earthdata credentials not found in .env file. Please set EARTHDATA_USERNAME and EARTHDATA_PASSWORD.")
        return False

    try:
        home_dir = Path.home()
        netrc_path = home_dir / ".netrc"
        
        # Write the .netrc file, overwriting if it exists
        with open(netrc_path, 'w') as f:
            f.write(f"machine urs.earthdata.nasa.gov\n")
            f.write(f"    login {username}\n")
            f.write(f"    password {password}\n")
        
        logger.info(f"Successfully created .netrc file at: {netrc_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to create .netrc file: {e}")
        return False

def download_sar_geotiffs(wkt_aoi: str, start_date: str, end_date: str,
                         polarizations: List[str] = ['VV'], 
                         download_dir: str = './SAR_DATA') -> Dict[str, any]:
    """
    Finds scenes, downloads pre/post files, and replaces any existing ones.
    """
    logger = logging.getLogger('SAR_Processor')

    # --- (Input validation and other setup is unchanged) ---
    pol_dirs = {}
    for pol in polarizations:
        pol_dir = Path(download_dir) / f'SAR_{pol}'
        pol_dir.mkdir(parents=True, exist_ok=True)
        pol_dirs[pol] = str(pol_dir)
    
    search_options = {'platform': asf.PLATFORM.SENTINEL1, 'dataset': 'OPERA-S1',
                      'intersectsWith': wkt_aoi, 'start': start_date, 'end': end_date}
    
    try:
        results = asf.search(**search_options)
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return {'success': False, 'error': f"Search failed: {e}"}

    valid_oldest_scene, valid_newest_scene = None, None
    for product in results:
        urls = product.properties.get("additionalUrls", [])
        if all(any(url.endswith(f"_{pol}.tif") for url in urls) for pol in polarizations):
            valid_oldest_scene = product
            logger.info(f"Found valid oldest (pre) scene: {product.properties['sceneName']}")
            break
    for product in reversed(results):
        urls = product.properties.get("additionalUrls", [])
        if all(any(url.endswith(f"_{pol}.tif") for url in urls) for pol in polarizations):
            valid_newest_scene = product
            logger.info(f"Found valid newest (post) scene: {product.properties['sceneName']}")
            break

    products_to_download = list({p.properties['sceneName']: p for p in [valid_oldest_scene, valid_newest_scene] if p}.values())
    
    if not products_to_download:
        logger.warning(f"No scenes found containing all requested polarizations: {polarizations}")
        return {'success': True, 'downloaded_files': {}}

    # --- MODIFIED: The session is now created without arguments ---
    # It will automatically find the .netrc file we created.
    session = asf.ASFSession()
    downloaded_files = {pol: [] for pol in polarizations}
    
    logger.info(f"Starting download for {len(products_to_download)} selected scene(s)...")
    
    for product in products_to_download:
        scene_name = product.properties['sceneName']
        time_tag = 'pre' if product == valid_oldest_scene else 'post'
        logger.info(f"Processing {time_tag} scene: {scene_name}")

        try:
            urls = product.properties.get("additionalUrls", [])
            for pol in polarizations:
                for url in (u for u in urls if u.endswith(f"_{pol}.tif")):
                    original_filename = os.path.basename(url)
                    simple_filename = f"{pol.lower()}_{time_tag}.tif"
                    final_filepath = os.path.join(pol_dirs[pol], simple_filename)
                    
                    asf.download_url(url, path=pol_dirs[pol], filename=original_filename, session=session)
                    
                    if os.path.exists(final_filepath): os.remove(final_filepath)
                    os.rename(os.path.join(pol_dirs[pol], original_filename), final_filepath)
                    logger.info(f"✅ Successfully created: {simple_filename}")
                    downloaded_files[pol].append(final_filepath)
        except Exception as e:
            logger.error(f"Download failed for {scene_name}: {e}")

    return {'success': True, 'downloaded_files': downloaded_files}

# --- All other functions (DEM, validation) can remain the same ---
def is_valid_wkt(wkt_string: str) -> Tuple[bool, Optional[str]]:
    try:
        geom = wkt_loads(wkt_string)
        return (True, None) if geom.is_valid else (False, f"Invalid geometry: {geom.explain_validity()}")
    except ShapelyError as e:
        return False, f"WKT parsing error: {str(e)}"

def are_valid_dates(start_str: str, end_str: str) -> Tuple[bool, Optional[str]]:
    try:
        start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
        return (True, None) if start < end else (False, f"Start date ({start}) must be before end date ({end})")
    except ValueError as e:
        return False, f"Date parsing error: {str(e)}"

def download_dem_from_aws(wkt_aoi: str, output_dir: str = './DEM_DATA') -> Optional[str]:
    logger = logging.getLogger('SAR_Processor')
    try:
        aoi_geom = wkt_loads(wkt_aoi)
        bounds = aoi_geom.bounds
    except ShapelyError as e:
        logger.error(f"Invalid WKT string: {e}")
        return None
    west, south, east, north = bounds
    tiles = [f"{'N' if lat >= 0 else 'S'}{abs(lat):02d}_{'E' if lon >= 0 else 'W'}{abs(lon):03d}" for lon in range(math.floor(west), math.ceil(east)) for lat in range(math.floor(south), math.ceil(north))]
    s3_base_url = "https://copernicus-dem-30m.s3.eu-central-1.amazonaws.com/"
    remote_datasets = []
    for tile in tiles:
        url = f"{s3_base_url}Copernicus_DSM_COG_10_{tile.split('_')[0]}_00_{tile.split('_')[1]}_00_DEM/Copernicus_DSM_COG_10_{tile.split('_')[0]}_00_{tile.split('_')[1]}_00_DEM.tif"
        try:
            if requests.head(url).status_code == 200: remote_datasets.append(rasterio.open(url))
        except requests.exceptions.RequestException: continue
    if not remote_datasets:
        logger.error("No valid DEM tiles found on AWS S3.")
        return None
    logger.info(f"Merging and clipping {len(remote_datasets)} remote tile(s)...")
    merged_data, merged_transform = rasterio.merge.merge(remote_datasets, bounds=bounds, precision=7)
    profile = remote_datasets[0].profile
    profile.update({"height": merged_data.shape[1], "width": merged_data.shape[2], "transform": merged_transform, "driver": "GTiff", "compress": "lzw"})
    for ds in remote_datasets: ds.close()
    os.makedirs(output_dir, exist_ok=True)
    output_filepath = os.path.join(output_dir, "dem_slope.tif")
    logger.info(f"Saving final clipped DEM to: {output_filepath}")
    with rasterio.open(output_filepath, "w", **profile) as dst:
        dst.write(merged_data)
    return output_filepath if os.path.exists(output_filepath) else None

def main():
    logger = setup_logging()
    logger.info("🛰️🗻 Starting Integrated SAR & DEM Data Processing Pipeline")
    logger.info("=" * 60)
    
    # --- NEW: Automatically create the .netrc file ---
    if not create_netrc_file():
        # Stop if credentials can't be set up
        return 1

    config = {
        'WKT': "POLYGON((76.1333 11.45, 76.1667 11.45, 76.1667 11.5, 76.1333 11.5, 76.1333 11.45))",
        'START_DATE': '2024-07-20T00:00:00Z',
        'END_DATE': '2024-08-01T23:59:59Z',
        'SAR_DOWNLOAD_DIR': './SAR_DATA', 'DEM_DOWNLOAD_DIR': './DEM_DATA',
        'POLARIZATIONS': ['VV', 'VH'], 'DOWNLOAD_DEM': True, 'DOWNLOAD_SAR': True
    }
    logger.info(f"Area of Interest: {config['WKT']}")
    logger.info(f"Date Range: {config['START_DATE']} to {config['END_DATE']}")
    try:
        if config['DOWNLOAD_SAR']:
            logger.info("\n📡 Starting SAR data acquisition...")
            download_sar_geotiffs(
                wkt_aoi=config['WKT'], start_date=config['START_DATE'], end_date=config['END_DATE'],
                polarizations=config['POLARIZATIONS'], download_dir=config['SAR_DOWNLOAD_DIR']
            )
        if config['DOWNLOAD_DEM']:
            logger.info("\n🗻 Starting DEM data acquisition...")
            dem_filepath = os.path.join(config['DEM_DOWNLOAD_DIR'], "dem_slope.tif")
            if os.path.exists(dem_filepath):
                logger.info(f"Replacing existing DEM file: {dem_filepath}")
            download_dem_from_aws(wkt_aoi=config['WKT'], output_dir=config['DEM_DOWNLOAD_DIR'])
        logger.info("\n" + "=" * 60)
        logger.info("🎉 DATA ACQUISITION COMPLETE")
        return 0
    except Exception as e:
        logger.error(f"\n❌ Unexpected error in main: {e}")
        return 1
    finally:
        logger.info("\n📋 Processing session ended")

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)