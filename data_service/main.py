# main.py - Enhanced SAR Data Processing Script
# Professional geospatial data acquisition and processing

import asf_search as asf
import os
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from shapely.wkt import loads as wkt_loads
from shapely.errors import ShapelyError
import json


def setup_logging(log_dir: str = './logs') -> logging.Logger:
    """Setup professional logging with file and console handlers."""
    os.makedirs(log_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = os.path.join(log_dir, f'sar_processing_{timestamp}.log')
    
    # Create logger
    logger = logging.getLogger('SAR_Processor')
    logger.setLevel(logging.INFO)
    
    # Clear existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Create formatters
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


def extract_metadata_from_filename(filename: str) -> Dict[str, str]:
    """Extract SAR metadata from OPERA-S1 filename."""
    try:
        # OPERA_L2_RTC-S1_T034-071821-IW3_20250823T010222Z_20250823T070234Z_S1A_30_v1.0_VV.tif
        parts = filename.split('_')
        if len(parts) >= 8:
            return {
                'product_type': parts[1],
                'processing_level': parts[2],
                'burst_id': parts[3],
                'acquisition_start': parts[4],
                'acquisition_end': parts[5],
                'platform': parts[6],
                'resolution': parts[7],
                'version': parts[8],
                'polarization': parts[9].replace('.tif', '') if len(parts) > 9 else 'VV'
            }
    except Exception as e:
        logging.getLogger('SAR_Processor').warning(f"Could not parse filename {filename}: {e}")
    
    return {}


def download_sar_geotiffs(wkt_aoi: str, start_date: str, end_date: str,
                         polarizations: List[str] = ['VV'], 
                         download_dir: str = './SAR_DATA') -> Dict[str, any]:
    """
    Enhanced SAR data acquisition supporting multiple polarizations (VV, VH, HH, HV).
    
    Args:
        wkt_aoi: WKT polygon string defining area of interest
        start_date: ISO 8601 formatted start date
        end_date: ISO 8601 formatted end date
        polarizations: List of polarizations to download ['VV', 'VH', 'HH', 'HV']
        download_dir: Base directory for downloaded files
    
    Returns:
        Dictionary containing download results, metadata, and statistics
    """
    logger = logging.getLogger('SAR_Processor')
    
    # Validate polarizations
    valid_pols = ['VV', 'VH', 'HH', 'HV']
    invalid_pols = [pol for pol in polarizations if pol not in valid_pols]
    if invalid_pols:
        error_msg = f"Invalid polarizations: {invalid_pols}. Valid options: {valid_pols}"
        logger.error(error_msg)
        return {'success': False, 'error': error_msg, 'downloaded_files': []}
    
    # Enhanced input validation
    wkt_valid, wkt_error = is_valid_wkt(wkt_aoi)
    dates_valid, date_error = are_valid_dates(start_date, end_date)
    
    if not wkt_valid:
        logger.error(f"WKT validation failed: {wkt_error}")
        return {'success': False, 'error': wkt_error, 'downloaded_files': []}
    
    if not dates_valid:
        logger.error(f"Date validation failed: {date_error}")
        return {'success': False, 'error': date_error, 'downloaded_files': []}

    # Create download directory structure
    Path(download_dir).mkdir(parents=True, exist_ok=True)
    
    # Create polarization-specific subdirectories
    pol_dirs = {}
    for pol in polarizations:
        pol_dir = os.path.join(download_dir, f'SAR_{pol}')
        Path(pol_dir).mkdir(parents=True, exist_ok=True)
        pol_dirs[pol] = pol_dir
        logger.info(f"Created directory for {pol}: {os.path.abspath(pol_dir)}")
    
    # Search configuration
    search_options = {
        'platform': asf.PLATFORM.SENTINEL1,
        'dataset': 'OPERA-S1',
        'intersectsWith': wkt_aoi,
        'start': start_date,
        'end': end_date,
    }
    
    try:
        logger.info(f"Searching ASF catalog for OPERA-S1 data with polarizations: {polarizations}")
        results = asf.search(**search_options)
        logger.info(f"Found {len(results)} scenes matching criteria")
        
        if not results:
            logger.warning("No scenes found for the given criteria")
            return {'success': True, 'downloaded_files': [], 'scene_count': 0}

    except Exception as e:
        error_msg = f"Search failed: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'error': error_msg, 'downloaded_files': []}
    
    # Initialize session and tracking variables
    session = asf.ASFSession()
    downloaded_files = {pol: [] for pol in polarizations}
    failed_downloads = []
    skipped_files = {pol: [] for pol in polarizations}
    metadata_list = {pol: [] for pol in polarizations}
    
    logger.info(f"Starting download of {polarizations} polarization GeoTIFFs...")
    
    for i, product in enumerate(results, 1):
        scene_name = product.properties.get('sceneName', f'Scene_{i}')
        logger.info(f"Processing scene {i}/{len(results)}: {scene_name}")
        
        try:
            urls = product.properties.get("additionalUrls", [])
            
            # Process each requested polarization
            for pol in polarizations:
                pol_urls = [url for url in urls if url.endswith(f"_{pol}.tif")]
                
                if not pol_urls:
                    logger.warning(f"No {pol} polarization URLs found for scene {i}")
                    continue
                    
                for url in pol_urls:
                    filename = os.path.basename(url)
                    local_path = os.path.join(pol_dirs[pol], filename)
                    
                    # Check if file already exists
                    if os.path.exists(local_path):
                        file_size = os.path.getsize(local_path)
                        if file_size > 0:
                            logger.info(f"File already exists ({pol}): {filename} ({file_size:,} bytes)")
                            downloaded_files[pol].append(local_path)
                            skipped_files[pol].append(filename)
                            
                            # Extract and store metadata
                            metadata = extract_metadata_from_filename(filename)
                            metadata.update({
                                'file_path': local_path,
                                'file_size': file_size,
                                'polarization': pol
                            })
                            metadata_list[pol].append(metadata)
                            continue
                    
                    # Download the file
                    logger.info(f"Downloading ({pol}): {filename}")
                    try:
                        asf.download_url(url, path=pol_dirs[pol], session=session)
                        
                        # Verify download
                        if os.path.exists(local_path):
                            file_size = os.path.getsize(local_path)
                            logger.info(f"✅ Successfully downloaded ({pol}): {filename} ({file_size:,} bytes)")
                            downloaded_files[pol].append(local_path)
                            
                            # Extract and store metadata
                            metadata = extract_metadata_from_filename(filename)
                            metadata.update({
                                'file_path': local_path,
                                'file_size': file_size,
                                'polarization': pol,
                                'download_timestamp': datetime.now().isoformat()
                            })
                            metadata_list[pol].append(metadata)
                        else:
                            error_msg = f"Download completed but file not found ({pol}): {filename}"
                            logger.error(error_msg)
                            failed_downloads.append({'url': url, 'polarization': pol, 'error': error_msg})
                            
                    except Exception as download_error:
                        error_msg = f"Download failed for ({pol}) {filename}: {str(download_error)}"
                        logger.error(error_msg)
                        failed_downloads.append({'url': url, 'polarization': pol, 'error': error_msg})
                        
        except Exception as scene_error:
            error_msg = f"Error processing scene {i}: {str(scene_error)}"
            logger.error(error_msg)
            failed_downloads.append({'scene': i, 'error': error_msg})
    
    # Save metadata to JSON files for each polarization
    all_metadata = {}
    for pol in polarizations:
        if metadata_list[pol]:
            pol_metadata_file = os.path.join(pol_dirs[pol], f'download_metadata_{pol}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
            try:
                pol_metadata = {
                    'search_parameters': search_options,
                    'polarization': pol,
                    'download_timestamp': datetime.now().isoformat(),
                    'total_scenes_found': len(results),
                    'files_downloaded': len(downloaded_files[pol]),
                    'files_skipped': len(skipped_files[pol]),
                    'metadata': metadata_list[pol]
                }
                
                with open(pol_metadata_file, 'w') as f:
                    json.dump(pol_metadata, f, indent=2)
                logger.info(f"Metadata for {pol} saved to: {pol_metadata_file}")
                all_metadata[pol] = pol_metadata
                
            except Exception as e:
                logger.warning(f"Could not save metadata file for {pol}: {e}")
    
    # Calculate summary statistics
    total_files = sum(len(files) for files in downloaded_files.values())
    total_size = 0
    
    for pol_files in downloaded_files.values():
        for filepath in pol_files:
            if os.path.exists(filepath):
                total_size += os.path.getsize(filepath)
    
    logger.info(f"Download summary: {total_files} files across {len(polarizations)} polarizations, {total_size:,} bytes total")
    
    # Log polarization-specific statistics
    for pol in polarizations:
        pol_count = len(downloaded_files[pol])
        pol_size = sum(os.path.getsize(f) for f in downloaded_files[pol] if os.path.exists(f))
        logger.info(f"  {pol}: {pol_count} files, {pol_size:,} bytes ({pol_size/1024/1024:.1f} MB)")
    
    if failed_downloads:
        logger.warning(f"Failed downloads: {len(failed_downloads)}")
        for failure in failed_downloads[:5]:  # Show first 5 failures
            logger.warning(f"  - {failure}")
    
    return {
        'success': True,
        'downloaded_files': downloaded_files,
        'failed_downloads': failed_downloads,
        'skipped_files': skipped_files,
        'metadata': all_metadata,
        'scene_count': len(results),
        'total_size_bytes': total_size,
        'polarizations': polarizations
    }


def download_vh_geotiffs(wkt_aoi: str, start_date: str, end_date: str, 
                         download_dir: str = './SAR_DATA_VH') -> Dict[str, any]:
    """
    Convenience function to download only VH polarization files.
    """
    return download_sar_geotiffs(wkt_aoi, start_date, end_date, ['VH'], download_dir)


def is_valid_wkt(wkt_string: str) -> Tuple[bool, Optional[str]]:
    """Validates WKT polygon string and returns validation status with error message."""
    logger = logging.getLogger('SAR_Processor')
    try:
        geom = wkt_loads(wkt_string)
        if geom.is_valid:
            logger.info(f"Valid WKT polygon with area: {geom.area:.6f} sq degrees")
            return True, None
        else:
            error_msg = f"Invalid geometry: {geom.explain_validity()}"
            logger.error(error_msg)
            return False, error_msg
    except ShapelyError as e:
        error_msg = f"WKT parsing error: {str(e)}"
        logger.error(error_msg)
        return False, error_msg


def are_valid_dates(start_str: str, end_str: str) -> Tuple[bool, Optional[str]]:
    """Validates date formats and ensures temporal logic."""
    logger = logging.getLogger('SAR_Processor')
    try:
        start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
        
        if start >= end:
            error_msg = f"Start date ({start}) must be before end date ({end})"
            logger.error(error_msg)
            return False, error_msg
        
        # Check if date range is reasonable (not too far in future/past)
        now = datetime.now()
        if start.replace(tzinfo=None) > now:
            logger.warning(f"Start date is in the future: {start}")
        
        duration = (end - start).days
        logger.info(f"Date range validation successful: {duration} days from {start.date()} to {end.date()}")
        return True, None
        
    except ValueError as e:
        error_msg = f"Date parsing error: {str(e)}. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)"
        logger.error(error_msg)
        return False, error_msg


def download_vv_geotiffs(wkt_aoi: str, start_date: str, end_date: str, 
                         download_dir: str = './SAR_DATA_VV') -> Dict[str, any]:
    """
    Enhanced SAR data acquisition with comprehensive error handling and metadata tracking.
    
    Args:
        wkt_aoi: WKT polygon string defining area of interest
        start_date: ISO 8601 formatted start date
        end_date: ISO 8601 formatted end date
        download_dir: Directory for downloaded files
    
    Returns:
        Dictionary containing download results, metadata, and statistics
    """
    logger = logging.getLogger('SAR_Processor')
    
    # Enhanced input validation
    wkt_valid, wkt_error = is_valid_wkt(wkt_aoi)
    dates_valid, date_error = are_valid_dates(start_date, end_date)
    
    if not wkt_valid:
        logger.error(f"WKT validation failed: {wkt_error}")
        return {'success': False, 'error': wkt_error, 'downloaded_files': []}
    
    if not dates_valid:
        logger.error(f"Date validation failed: {date_error}")
        return {'success': False, 'error': date_error, 'downloaded_files': []}

    # Create download directory
    Path(download_dir).mkdir(parents=True, exist_ok=True)
    logger.info(f"Download directory: {os.path.abspath(download_dir)}")
    
    # Search configuration
    search_options = {
        'platform': asf.PLATFORM.SENTINEL1,
        'dataset': 'OPERA-S1',
        'intersectsWith': wkt_aoi,
        'start': start_date,
        'end': end_date,
    }
    
    try:
        logger.info("Searching ASF catalog for OPERA-S1 data...")
        results = asf.search(**search_options)
        logger.info(f"Found {len(results)} scenes matching criteria")
        
        if not results:
            logger.warning("No scenes found for the given criteria")
            return {'success': True, 'downloaded_files': [], 'scene_count': 0}

    except Exception as e:
        error_msg = f"Search failed: {str(e)}"
        logger.error(error_msg)
        return {'success': False, 'error': error_msg, 'downloaded_files': []}
    
    # Initialize session and tracking variables
    session = asf.ASFSession()
    downloaded_files = []
    failed_downloads = []
    skipped_files = []
    metadata_list = []
    
    logger.info(f"Starting download of VV polarization GeoTIFFs...")
    
    for i, product in enumerate(results, 1):
        logger.info(f"Processing scene {i}/{len(results)}: {product.properties.get('sceneName', 'Unknown')}")
        
        try:
            urls = product.properties.get("additionalUrls", [])
            vv_urls = [url for url in urls if url.endswith("_VV.tif")]
            
            if not vv_urls:
                logger.warning(f"No VV polarization URLs found for scene {i}")
                continue
                
            for url in vv_urls:
                filename = os.path.basename(url)
                local_path = os.path.join(download_dir, filename)
                
                # Check if file already exists
                if os.path.exists(local_path):
                    file_size = os.path.getsize(local_path)
                    if file_size > 0:
                        logger.info(f"File already exists: {filename} ({file_size:,} bytes)")
                        downloaded_files.append(local_path)
                        skipped_files.append(filename)
                        
                        # Extract and store metadata
                        metadata = extract_metadata_from_filename(filename)
                        metadata['file_path'] = local_path
                        metadata['file_size'] = file_size
                        metadata_list.append(metadata)
                        continue
                
                # Download the file
                logger.info(f"Downloading: {filename}")
                try:
                    asf.download_url(url, path=download_dir, session=session)
                    
                    # Verify download
                    if os.path.exists(local_path):
                        file_size = os.path.getsize(local_path)
                        logger.info(f"✅ Successfully downloaded: {filename} ({file_size:,} bytes)")
                        downloaded_files.append(local_path)
                        
                        # Extract and store metadata
                        metadata = extract_metadata_from_filename(filename)
                        metadata['file_path'] = local_path
                        metadata['file_size'] = file_size
                        metadata['download_timestamp'] = datetime.now().isoformat()
                        metadata_list.append(metadata)
                    else:
                        error_msg = f"Download completed but file not found: {filename}"
                        logger.error(error_msg)
                        failed_downloads.append({'url': url, 'error': error_msg})
                        
                except Exception as download_error:
                    error_msg = f"Download failed for {filename}: {str(download_error)}"
                    logger.error(error_msg)
                    failed_downloads.append({'url': url, 'error': error_msg})
                    
        except Exception as scene_error:
            error_msg = f"Error processing scene {i}: {str(scene_error)}"
            logger.error(error_msg)
            failed_downloads.append({'scene': i, 'error': error_msg})
    
    # Save metadata to JSON file
    if metadata_list:
        metadata_file = os.path.join(download_dir, f'download_metadata_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        try:
            with open(metadata_file, 'w') as f:
                json.dump({
                    'search_parameters': search_options,
                    'download_timestamp': datetime.now().isoformat(),
                    'total_scenes_found': len(results),
                    'files_downloaded': len(downloaded_files),
                    'files_skipped': len(skipped_files),
                    'failed_downloads': len(failed_downloads),
                    'metadata': metadata_list
                }, f, indent=2)
            logger.info(f"Metadata saved to: {metadata_file}")
        except Exception as e:
            logger.warning(f"Could not save metadata file: {e}")
    
    # Summary statistics
    total_size = sum(os.path.getsize(f) for f in downloaded_files if os.path.exists(f))
    logger.info(f"Download summary: {len(downloaded_files)} files, {total_size:,} bytes total")
    
    if failed_downloads:
        logger.warning(f"Failed downloads: {len(failed_downloads)}")
        for failure in failed_downloads:
            logger.warning(f"  - {failure}")
    
    return {
        'success': True,
        'downloaded_files': downloaded_files,
        'failed_downloads': failed_downloads,
        'skipped_files': skipped_files,
        'metadata': metadata_list,
        'scene_count': len(results),
        'total_size_bytes': total_size
    }


def main():
    """Main execution function with comprehensive error handling."""
    # Initialize logging
    logger = setup_logging()
    logger.info("🛰️ Starting SAR Data Processing Pipeline")
    logger.info("=" * 60)
    
    # Configuration
    config = {
        'WKT': "POLYGON((72.521 23.042, 72.535 23.042, 72.535 23.032, 72.521 23.032, 72.521 23.042))",
        'START_DATE': '2025-08-01T00:00:00Z',
        'END_DATE': '2025-09-30T23:59:59Z',
        'DOWNLOAD_DIR': './SAR_DATA',
        'POLARIZATIONS': ['VV', 'VH']  # Download both VV and VH
    }
    
    # Log configuration
    logger.info(f"Area of Interest: {config['WKT']}")
    logger.info(f"Date Range: {config['START_DATE']} to {config['END_DATE']}")
    logger.info(f"Download Directory: {os.path.abspath(config['DOWNLOAD_DIR'])}")
    logger.info(f"Polarizations: {config['POLARIZATIONS']}")
    
    try:
        # Execute download for multiple polarizations
        result = download_sar_geotiffs(
            wkt_aoi=config['WKT'],
            start_date=config['START_DATE'],
            end_date=config['END_DATE'],
            polarizations=config['POLARIZATIONS'],
            download_dir=config['DOWNLOAD_DIR']
        )
        
        if not result['success']:
            logger.error(f"Processing failed: {result.get('error', 'Unknown error')}")
            return 1
        
        # Process results
        downloaded_files = result['downloaded_files']
        polarizations = result.get('polarizations', [])
        
        # Check if any files were downloaded
        total_downloaded = sum(len(files) for files in downloaded_files.values()) if isinstance(downloaded_files, dict) else len(downloaded_files)
        
        if total_downloaded > 0:
            logger.info("\n" + "=" * 60)
            logger.info("🎉 PROCESSING COMPLETE")
            logger.info("=" * 60)
            logger.info(f"Successfully processed {result['scene_count']} scenes")
            logger.info(f"Downloaded {total_downloaded} GeoTIFF files across {len(polarizations)} polarizations")
            logger.info(f"Total data size: {result['total_size_bytes']:,} bytes ({result['total_size_bytes']/1024/1024:.1f} MB)")
            
            # Report skipped files
            if result.get('skipped_files'):
                if isinstance(result['skipped_files'], dict):
                    total_skipped = sum(len(files) for files in result['skipped_files'].values())
                else:
                    total_skipped = len(result['skipped_files'])
                logger.info(f"Skipped {total_skipped} existing files")
            
            if result.get('failed_downloads'):
                logger.warning(f"Failed to download {len(result['failed_downloads'])} files")
            
            logger.info("\n📁 Downloaded files ready for analysis:")
            
            # Display files by polarization
            if isinstance(downloaded_files, dict):
                file_counter = 1
                for pol in polarizations:
                    if downloaded_files[pol]:
                        logger.info(f"\n  {pol} Polarization:")
                        for path in downloaded_files[pol]:
                            file_size = os.path.getsize(path) if os.path.exists(path) else 0
                            logger.info(f"    {file_counter:2d}. {os.path.basename(path)} ({file_size:,} bytes)")
                            file_counter += 1
            else:
                # Fallback for single polarization
                for i, path in enumerate(downloaded_files, 1):
                    file_size = os.path.getsize(path) if os.path.exists(path) else 0
                    logger.info(f"  {i:2d}. {os.path.basename(path)} ({file_size:,} bytes)")
            
            # Suggest next steps based on available polarizations
            logger.info("\n🔬 Suggested next steps:")
            logger.info("  1. Perform radiometric calibration (DN to σ⁰)")
            logger.info("  2. Apply speckle filtering (Lee, Frost, or Gamma MAP)")
            
            if 'VV' in polarizations and 'VH' in polarizations:
                logger.info("  3. Calculate dual-polarization ratios (VV/VH)")
                logger.info("  4. Implement polarimetric change detection")
                logger.info("  5. Generate RGB composites (VV, VH, VV/VH)")
                logger.info("  6. Analyze surface scattering mechanisms")
            else:
                logger.info("  3. Implement change detection analysis")
                logger.info("  4. Calculate temporal coherence")
            
            logger.info("  7. Generate landslide susceptibility maps")
            logger.info("  8. Validate results with ground truth data")
            
        else:
            logger.warning("\n⚠️  No new data was downloaded")
            logger.info("This could indicate:")
            logger.info("  - All files already exist locally")
            logger.info("  - No data available for the specified criteria")
            logger.info("  - Network or authentication issues")
        
        return 0
        
    except KeyboardInterrupt:
        logger.info("\n⏹️  Processing interrupted by user")
        return 1
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {str(e)}")
        logger.exception("Full traceback:")
        return 1
    finally:
        logger.info("\n📋 Processing session ended")
        logger.info("=" * 60)


if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)