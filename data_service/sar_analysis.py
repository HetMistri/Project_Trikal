# sar_analysis.py - Advanced SAR Analysis Functions

import os
import numpy as np
import logging
from typing import List, Tuple, Dict, Optional
from datetime import datetime
import json

try:
    import rasterio
    from rasterio.windows import from_bounds
    from rasterio.transform import from_bounds as transform_from_bounds
    RASTERIO_AVAILABLE = True
except ImportError:
    RASTERIO_AVAILABLE = False
    logging.warning("rasterio not available. Install with: pip install rasterio")

class SARAnalyzer:
    """
    Professional SAR data analysis class for landslide detection and change analysis.
    """
    
    def __init__(self, data_directory: str):
        """Initialize SAR analyzer with data directory."""
        self.data_directory = data_directory
        self.logger = logging.getLogger('SAR_Analyzer')
        self.file_inventory = self._build_file_inventory()
    
    def _build_file_inventory(self) -> List[Dict]:
        """Build inventory of available SAR files with metadata."""
        inventory = []
        
        if not os.path.exists(self.data_directory):
            self.logger.error(f"Data directory not found: {self.data_directory}")
            return inventory
        
        vv_files = [f for f in os.listdir(self.data_directory) if f.endswith('_VV.tif')]
        
        for filename in sorted(vv_files):
            filepath = os.path.join(self.data_directory, filename)
            
            # Extract metadata from filename
            metadata = self._parse_opera_filename(filename)
            
            if metadata:
                metadata.update({
                    'filepath': filepath,
                    'filename': filename,
                    'file_size': os.path.getsize(filepath),
                    'last_modified': datetime.fromtimestamp(os.path.getmtime(filepath)).isoformat()
                })
                inventory.append(metadata)
        
        self.logger.info(f"Built inventory of {len(inventory)} SAR files")
        return inventory
    
    def _parse_opera_filename(self, filename: str) -> Dict:
        """Parse OPERA-S1 filename to extract metadata."""
        try:
            # OPERA_L2_RTC-S1_T034-071821-IW3_20250823T010222Z_20250823T070234Z_S1A_30_v1.0_VV.tif
            parts = filename.replace('.tif', '').split('_')
            
            if len(parts) >= 9:
                return {
                    'mission': parts[0],
                    'processing_level': parts[1],
                    'product_type': parts[2],
                    'burst_id': parts[3],
                    'acquisition_start': datetime.strptime(parts[4], '%Y%m%dT%H%M%SZ'),
                    'acquisition_end': datetime.strptime(parts[5], '%Y%m%dT%H%M%SZ'),
                    'platform': parts[6],
                    'resolution_m': int(parts[7]),
                    'version': parts[8],
                    'polarization': parts[9] if len(parts) > 9 else 'VV'
                }
        except Exception as e:
            self.logger.warning(f"Could not parse filename {filename}: {e}")
        
        return {}
    
    def get_temporal_coverage(self) -> Dict:
        """Analyze temporal coverage of SAR data collection."""
        if not self.file_inventory:
            return {'error': 'No files in inventory'}
        
        acquisition_dates = [item['acquisition_start'] for item in self.file_inventory 
                           if 'acquisition_start' in item]
        
        if not acquisition_dates:
            return {'error': 'No valid acquisition dates found'}
        
        acquisition_dates.sort()
        
        # Calculate temporal statistics
        date_range = (acquisition_dates[-1] - acquisition_dates[0]).days
        avg_interval = date_range / (len(acquisition_dates) - 1) if len(acquisition_dates) > 1 else 0
        
        # Group by burst/track
        burst_groups = {}
        for item in self.file_inventory:
            burst_id = item.get('burst_id', 'Unknown')
            if burst_id not in burst_groups:
                burst_groups[burst_id] = []
            burst_groups[burst_id].append(item['acquisition_start'])
        
        return {
            'total_scenes': len(acquisition_dates),
            'date_range_days': date_range,
            'first_acquisition': acquisition_dates[0].isoformat(),
            'last_acquisition': acquisition_dates[-1].isoformat(),
            'average_interval_days': round(avg_interval, 1),
            'unique_bursts': len(burst_groups),
            'burst_coverage': {burst: len(dates) for burst, dates in burst_groups.items()}
        }
    
    def calculate_backscatter_statistics(self, filepath: str) -> Dict:
        """Calculate basic backscatter statistics for a SAR image."""
        if not RASTERIO_AVAILABLE:
            return {'error': 'rasterio not available'}
        
        try:
            with rasterio.open(filepath) as src:
                # Read the data
                data = src.read(1)  # Read first band
                
                # Handle nodata values
                if src.nodata is not None:
                    valid_data = data[data != src.nodata]
                else:
                    valid_data = data.flatten()
                
                # Remove zeros and negative values (common in SAR)
                valid_data = valid_data[valid_data > 0]
                
                if len(valid_data) == 0:
                    return {'error': 'No valid data found'}
                
                # Convert to dB if data appears to be in linear scale
                if np.max(valid_data) > 1:
                    db_data = 10 * np.log10(valid_data)
                else:
                    db_data = valid_data
                
                return {
                    'filename': os.path.basename(filepath),
                    'dimensions': (src.height, src.width),
                    'crs': str(src.crs),
                    'bounds': src.bounds,
                    'nodata_value': src.nodata,
                    'valid_pixels': len(valid_data),
                    'total_pixels': data.size,
                    'coverage_percent': (len(valid_data) / data.size) * 100,
                    'statistics': {
                        'min_db': float(np.min(db_data)),
                        'max_db': float(np.max(db_data)),
                        'mean_db': float(np.mean(db_data)),
                        'std_db': float(np.std(db_data)),
                        'median_db': float(np.median(db_data))
                    }
                }
                
        except Exception as e:
            self.logger.error(f"Error analyzing {filepath}: {e}")
            return {'error': str(e)}
    
    def identify_change_detection_pairs(self, max_temporal_gap_days: int = 15) -> List[Dict]:
        """Identify suitable image pairs for change detection analysis."""
        if len(self.file_inventory) < 2:
            self.logger.warning("Need at least 2 images for change detection")
            return []
        
        # Sort by acquisition date
        sorted_inventory = sorted(self.file_inventory, 
                                key=lambda x: x.get('acquisition_start', datetime.min))
        
        pairs = []
        
        # Create pairs within the same burst/track
        burst_groups = {}
        for item in sorted_inventory:
            burst_id = item.get('burst_id', 'Unknown')
            if burst_id not in burst_groups:
                burst_groups[burst_id] = []
            burst_groups[burst_id].append(item)
        
        for burst_id, items in burst_groups.items():
            if len(items) < 2:
                continue
                
            for i in range(len(items) - 1):
                for j in range(i + 1, len(items)):
                    item1, item2 = items[i], items[j]
                    
                    if 'acquisition_start' in item1 and 'acquisition_start' in item2:
                        temporal_gap = abs((item2['acquisition_start'] - 
                                          item1['acquisition_start']).days)
                        
                        if temporal_gap <= max_temporal_gap_days:
                            pairs.append({
                                'pre_event': {
                                    'filepath': item1['filepath'],
                                    'filename': item1['filename'],
                                    'acquisition_date': item1['acquisition_start'].isoformat()
                                },
                                'post_event': {
                                    'filepath': item2['filepath'],
                                    'filename': item2['filename'],
                                    'acquisition_date': item2['acquisition_start'].isoformat()
                                },
                                'temporal_gap_days': temporal_gap,
                                'burst_id': burst_id,
                                'pair_id': f"{burst_id}_{i}_{j}"
                            })
        
        self.logger.info(f"Identified {len(pairs)} suitable image pairs for change detection")
        return pairs
    
    def generate_analysis_report(self, output_file: str = None) -> Dict:
        """Generate comprehensive analysis report of the SAR data collection."""
        report = {
            'generation_timestamp': datetime.now().isoformat(),
            'data_directory': os.path.abspath(self.data_directory),
            'file_inventory_summary': {
                'total_files': len(self.file_inventory),
                'total_size_mb': sum(item.get('file_size', 0) for item in self.file_inventory) / (1024*1024)
            }
        }
        
        # Add temporal coverage analysis
        temporal_analysis = self.get_temporal_coverage()
        report['temporal_analysis'] = temporal_analysis
        
        # Add change detection opportunities
        change_pairs = self.identify_change_detection_pairs()
        report['change_detection'] = {
            'suitable_pairs': len(change_pairs),
            'pairs': change_pairs[:5]  # Include first 5 pairs as examples
        }
        
        # Add file-level statistics for first few files
        file_statistics = []
        for item in self.file_inventory[:3]:  # Analyze first 3 files as examples
            stats = self.calculate_backscatter_statistics(item['filepath'])
            if 'error' not in stats:
                file_statistics.append(stats)
        
        report['backscatter_analysis'] = {
            'analyzed_files': len(file_statistics),
            'sample_statistics': file_statistics
        }
        
        # Analysis recommendations
        recommendations = []
        
        if temporal_analysis.get('total_scenes', 0) >= 5:
            recommendations.append("✅ Sufficient data for time-series analysis")
        else:
            recommendations.append("⚠️  Limited temporal coverage - consider acquiring more data")
        
        if len(change_pairs) > 0:
            recommendations.append(f"✅ {len(change_pairs)} image pairs suitable for change detection")
        else:
            recommendations.append("❌ No suitable pairs for change detection found")
        
        if temporal_analysis.get('unique_bursts', 0) > 1:
            recommendations.append("✅ Multiple burst coverage enables spatial analysis")
        
        report['recommendations'] = recommendations
        
        # Save report if output file specified
        if output_file:
            try:
                with open(output_file, 'w') as f:
                    json.dump(report, f, indent=2, default=str)
                self.logger.info(f"Analysis report saved to: {output_file}")
            except Exception as e:
                self.logger.error(f"Could not save report: {e}")
        
        return report


def main():
    """Demonstration of SAR analysis capabilities."""
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Initialize analyzer - check both possible locations
    data_dirs = ['./SAR_DATA_VV', '../SAR_DATA_VV']
    analyzer = None
    
    for data_dir in data_dirs:
        if os.path.exists(data_dir):
            test_analyzer = SARAnalyzer(data_dir)
            if test_analyzer.file_inventory:
                analyzer = test_analyzer
                break
    
    if not analyzer:
        # Try the original location from workspace structure
        data_dir = './SAR_DATA_VV'  # This should be the correct one
        analyzer = SARAnalyzer(data_dir)
    
    if not analyzer.file_inventory:
        print(f"No SAR data found in {data_dir}")
        print("Run main_enhanced.py first to download SAR data")
        return
    
    print("🔬 SAR Data Analysis Report")
    print("=" * 50)
    
    # Generate and display report
    report = analyzer.generate_analysis_report('sar_analysis_report.json')
    
    print(f"📁 Data Directory: {report['data_directory']}")
    print(f"📊 Total Files: {report['file_inventory_summary']['total_files']}")
    print(f"💾 Total Size: {report['file_inventory_summary']['total_size_mb']:.1f} MB")
    
    if 'temporal_analysis' in report:
        temp = report['temporal_analysis']
        print(f"\n📅 Temporal Coverage:")
        print(f"   • Date Range: {temp.get('date_range_days', 0)} days")
        print(f"   • Average Interval: {temp.get('average_interval_days', 0)} days")
        print(f"   • Unique Bursts: {temp.get('unique_bursts', 0)}")
    
    print(f"\n🔍 Change Detection Opportunities: {report['change_detection']['suitable_pairs']}")
    
    print(f"\n💡 Recommendations:")
    for rec in report.get('recommendations', []):
        print(f"   {rec}")


if __name__ == "__main__":
    main()