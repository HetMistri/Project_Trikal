# main.py - Integrated Pipeline that Always Replaces Existing Files

import asf_search as asf
import os
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from shapely.wkt import loads as wkt_loads
from shapely.errors import ShapelyError
import json
# DEM processing imports
import requests
import rasterio
import rasterio.merge
import math
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

def setup_logging(log_dir: str = './logs') -> logging.Logger:
    """Setup professional logging."""
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

def extract_metadata_from_filename(filename: str) -> Dict[str, str]:
    """Extract SAR metadata from OPERA-S1 filename."""
    try:
        parts = os.path.basename(filename).split('_')
        if len(parts) >= 8:
            return {
                'original_filename': os.path.basename(filename), 'product_type': parts[1], 
                'processing_level': parts[2], 'burst_id': parts[3], 'acquisition_start': parts[4], 
                'acquisition_end': parts[5], 'platform': parts[6], 'resolution': parts[7], 
                'version': parts[8], 'polarization': parts[9].replace('.tif', '') if len(parts) > 9 else 'VV'
            }
    except Exception as e:
        logging.getLogger('SAR_Processor').warning(f"Could not parse filename {filename}: {e}")
    return {}

def download_sar_geotiffs(wkt_aoi: str, start_date: str, end_date: str,
                         polarizations: List[str] = ['VV'], 
                         download_dir: str = './SAR_DATA') -> Dict[str, any]:
    """
    Finds the first (pre) and last (post) scenes, downloads them, and replaces
    any existing files.
    """
    logger = logging.getLogger('SAR_Processor')
    
    valid_pols = ['VV', 'VH', 'HH', 'HV']
    if any(pol not in valid_pols for pol in polarizations):
        invalid = [pol for pol in polarizations if pol not in valid_pols]
        logger.error(f"Invalid polarizations: {invalid}. Valid: {valid_pols}")
        return {'success': False, 'error': f"Invalid polarizations: {invalid}", 'downloaded_files': []}
    
    wkt_valid, wkt_error = is_valid_wkt(wkt_aoi)
    dates_valid, date_error = are_valid_dates(start_date, end_date)
    if not wkt_valid or not dates_valid:
        error = wkt_error or date_error
        logger.error(f"Input validation failed: {error}")
        return {'success': False, 'error': error, 'downloaded_files': []}

    pol_dirs = {}
    for pol in polarizations:
        pol_dir = Path(download_dir) / f'SAR_{pol}'
        pol_dir.mkdir(parents=True, exist_ok=True)
        pol_dirs[pol] = str(pol_dir)
    
    search_options = {'platform': asf.PLATFORM.SENTINEL1, 'dataset': 'OPERA-S1',
                      'intersectsWith': wkt_aoi, 'start': start_date, 'end': end_date}
    
    try:
        logger.info(f"Searching ASF for OPERA-S1 data: {polarizations}")
        results = asf.search(**search_options)
        logger.info(f"Found {len(results)} total scenes matching criteria")
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return {'success': False, 'error': f"Search failed: {e}", 'downloaded_files': []}

    valid_oldest_scene = None
    for product in results:
        urls = product.properties.get("additionalUrls", [])
        if all(any(url.endswith(f"_{pol}.tif") for url in urls) for pol in polarizations):
            valid_oldest_scene = product
            logger.info(f"Found valid oldest (pre) scene: {product.properties['sceneName']}")
            break

    valid_newest_scene = None
    for product in reversed(results):
        urls = product.properties.get("additionalUrls", [])
        if all(any(url.endswith(f"_{pol}.tif") for url in urls) for pol in polarizations):
            valid_newest_scene = product
            logger.info(f"Found valid newest (post) scene: {product.properties['sceneName']}")
            break

    products_to_download = []
    if valid_oldest_scene: products_to_download.append(valid_oldest_scene)
    if valid_newest_scene: products_to_download.append(valid_newest_scene)
    
    unique_products = list({p.properties['sceneName']: p for p in products_to_download}.values())
    products_to_download = unique_products
    
    if not products_to_download:
        logger.warning(f"No scenes found containing all requested polarizations: {polarizations}")
        return {'success': True, 'downloaded_files': [], 'scene_count': len(results)}

    session = asf.ASFSession()
    downloaded_files = {pol: [] for pol in polarizations}
    failed_downloads = []
    
    logger.info(f"Starting download for {len(products_to_download)} selected scene(s) with complete polarizations...")
    
    for i, product in enumerate(products_to_download, 1):
        scene_name = product.properties.get('sceneName', f'Scene_{i}')
        logger.info(f"Processing selected scene {i}/{len(products_to_download)}: {scene_name}")
        
        time_tag = None
        if valid_oldest_scene and scene_name == valid_oldest_scene.properties['sceneName']:
            time_tag = 'pre'
        elif valid_newest_scene and scene_name == valid_newest_scene.properties['sceneName']:
            time_tag = 'post'

        if not time_tag:
            logger.warning(f"Could not determine if scene {scene_name} is pre or post. Skipping.")
            continue

        try:
            urls = product.properties.get("additionalUrls", [])
            for pol in polarizations:
                for url in (u for u in urls if u.endswith(f"_{pol}.tif")):
                    original_filename = os.path.basename(url)
                    simple_filename = f"{pol.lower()}_{time_tag}.tif"
                    final_filepath = os.path.join(pol_dirs[pol], simple_filename)

                    local_path_original = os.path.join(pol_dirs[pol], original_filename)
                    logger.info(f"Downloading ({pol}): {original_filename}")
                    try:
                        asf.download_url(url, path=pol_dirs[pol], filename=original_filename, session=session)
                        if os.path.exists(local_path_original):
                            # --- NEW LOGIC: Remove existing file before renaming ---
                            if os.path.exists(final_filepath):
                                logger.info(f"Replacing existing file: {simple_filename}")
                                os.remove(final_filepath)

                            os.rename(local_path_original, final_filepath)
                            logger.info(f"Renamed {original_filename} to {simple_filename}")
                            logger.info(f"✅ Successfully processed ({pol}): {simple_filename}")
                            downloaded_files[pol].append(final_filepath)
                        else: 
                            raise FileNotFoundError("Download completed but temporary file not found.")
                    except Exception as download_error:
                        logger.error(f"Download failed for ({pol}) {original_filename}: {download_error}")
                        failed_downloads.append({'url': url, 'error': str(download_error)})
        except Exception as scene_error:
            logger.error(f"Error processing scene {i}: {scene_error}")
            failed_downloads.append({'scene': i, 'error': str(scene_error)})
    
    return {'success': True, 'downloaded_files': downloaded_files, 'failed_downloads': failed_downloads, 'scene_count': len(results)}

# --- DEM and other functions remain unchanged ---
def find_existing_dem(dem_dir: str) -> Optional[str]:
    logger = logging.getLogger('SAR_Processor')
    if not os.path.isdir(dem_dir): return None
    expected_dem_file = os.path.join(dem_dir, 'dem_slope.tif')
    logger.info(f"Scanning for existing DEM: '{expected_dem_file}'...")
    if os.path.exists(expected_dem_file):
        logger.info(f"Found existing DEM file. Using: {expected_dem_file}")
        return expected_dem_file
    logger.info("No existing DEM file found.")
    return None

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

def main():
    logger = setup_logging()
    logger.info("🛰️🗻 Starting Integrated SAR & DEM Data Processing Pipeline")
    logger.info("=" * 60)
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
        results = {}
        if config['DOWNLOAD_SAR']:
            logger.info("\n📡 Starting SAR data acquisition...")
            sar_result = download_sar_geotiffs(
                wkt_aoi=config['WKT'], start_date=config['START_DATE'], end_date=config['END_DATE'],
                polarizations=config['POLARIZATIONS'], download_dir=config['SAR_DOWNLOAD_DIR']
            )
            if not sar_result['success']: return 1
            results['sar'] = sar_result
        if config['DOWNLOAD_DEM']:
            logger.info("\n🗻 Starting DEM data acquisition...")
            logger.info("Proceeding with DEM download. Any existing 'dem_slope.tif' will be replaced.")
            dem_filepath = download_dem_from_aws(wkt_aoi=config['WKT'], output_dir=config['DEM_DOWNLOAD_DIR'])
            if dem_filepath:
                results['dem'] = {'success': True, 'filepath': dem_filepath, 'size_bytes': os.path.getsize(dem_filepath)}
                logger.info(f"✅ DEM is ready: {os.path.basename(dem_filepath)}")
            else:
                logger.error("DEM acquisition failed")
                results['dem'] = {'success': False}
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