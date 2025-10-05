# dem_downloader.py - DEM data downloading functionality
import os
import math
import requests
import rasterio
import rasterio.merge
import logging
from pathlib import Path
from shapely.wkt import loads as wkt_loads
from shapely.errors import ShapelyError
from .config import DataProcessingConfig

class DEMDownloader:
    """Handles DEM data downloading from AWS Copernicus."""
    
    def __init__(self):
        self.config = DataProcessingConfig()
        self.logger = logging.getLogger('SAR_Processor')  # Use existing logger
        
    def download_dem_data(self, wkt_aoi: str) -> dict:
        """Download and process DEM data for the specified area."""
        self.logger.info("🗻 Starting DEM data download")
        
        try:
            # Parse AOI geometry
            aoi_geom = wkt_loads(wkt_aoi)
            bounds = aoi_geom.bounds
            self.logger.info(f"AOI bounds: {bounds}")
        except ShapelyError as e:
            error_msg = f"Invalid WKT string: {e}"
            self.logger.error(error_msg)
            return {'success': False, 'error': error_msg}
        
        # Ensure DEM directory exists
        self.config.ensure_directories()
        
        west, south, east, north = bounds
        
        # Generate tile names
        tiles = []
        for lon in range(math.floor(west), math.ceil(east)):
            for lat in range(math.floor(south), math.ceil(north)):
                lat_prefix = 'N' if lat >= 0 else 'S'
                lon_prefix = 'E' if lon >= 0 else 'W'
                tile = f"{lat_prefix}{abs(lat):02d}_{lon_prefix}{abs(lon):03d}"
                tiles.append(tile)
        
        self.logger.info(f"Generated {len(tiles)} potential tiles: {tiles}")
        
        # Find valid tiles and open as remote datasets
        s3_base_url = self.config.DEM_SOURCE
        remote_datasets = []
        
        for tile in tiles:
            lat_part = tile.split('_')[0]
            lon_part = tile.split('_')[1]
            url = f"{s3_base_url}Copernicus_DSM_COG_10_{lat_part}_00_{lon_part}_00_DEM/Copernicus_DSM_COG_10_{lat_part}_00_{lon_part}_00_DEM.tif"
            
            try:
                response = requests.head(url)
                if response.status_code == 200:
                    remote_datasets.append(rasterio.open(url))
                    self.logger.info(f"Found valid DEM tile: {tile}")
            except requests.exceptions.RequestException as e:
                self.logger.debug(f"Tile {tile} not found: {e}")
                continue
        
        if not remote_datasets:
            error_msg = "No valid DEM tiles found on AWS S3"
            self.logger.error(error_msg)
            return {'success': False, 'error': error_msg}
        
        try:
            # Merge and clip tiles
            self.logger.info(f"Merging and clipping {len(remote_datasets)} remote tile(s)...")
            merged_data, merged_transform = rasterio.merge.merge(
                remote_datasets, bounds=bounds, precision=7
            )
            
            # Set up profile for output file
            profile = remote_datasets[0].profile
            profile.update({
                "height": merged_data.shape[1],
                "width": merged_data.shape[2],
                "transform": merged_transform,
                "driver": "GTiff",
                "compress": "lzw"
            })
            
            # Close remote datasets
            for ds in remote_datasets:
                ds.close()
            
            # Save final clipped DEM
            output_filepath = self.config.DEM_DATA_DIR / "dem_slope.tif"
            self.logger.info(f"Saving final clipped DEM to: {output_filepath}")
            
            with rasterio.open(output_filepath, "w", **profile) as dst:
                dst.write(merged_data)
            
            if output_filepath.exists():
                self.logger.info("🎉 DEM data download complete")
                return {
                    'success': True,
                    'dem_file': str(output_filepath),
                    'bounds': bounds,
                    'shape': merged_data.shape
                }
            else:
                return {'success': False, 'error': 'Failed to save DEM file'}
                
        except Exception as e:
            error_msg = f"Error processing DEM data: {e}"
            self.logger.error(error_msg)
            return {'success': False, 'error': error_msg}