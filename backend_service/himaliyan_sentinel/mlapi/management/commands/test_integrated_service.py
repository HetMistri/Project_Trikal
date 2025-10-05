# test_integrated_service.py - Management command to test the integrated service
from django.core.management.base import BaseCommand
from django.utils import timezone
from mlapi.models import MLRequest
from integrated_service import IntegratedAnalysisService

class Command(BaseCommand):
    help = 'Test the integrated analysis service with sample coordinates'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--lat', type=float, default=28.2380,
            help='Latitude for test coordinates (default: 28.2380)'
        )
        parser.add_argument(
            '--lon', type=float, default=83.9956,
            help='Longitude for test coordinates (default: 83.9956)'
        )
        parser.add_argument(
            '--days', type=int, default=30,
            help='Number of days back for date range (default: 30)'
        )
        parser.add_argument(
            '--mock-only', action='store_true',
            help='Skip actual data download and use only mock data'
        )
    
    def handle(self, *args, **options):
        lat = options['lat']
        lon = options['lon']
        days_back = options['days']
        mock_only = options['mock_only']
        
        self.stdout.write(
            self.style.SUCCESS(f'🧪 Testing Integrated Analysis Service')
        )
        self.stdout.write(f'Coordinates: {lat}, {lon}')
        self.stdout.write(f'Date range: {days_back} days back from today')
        
        if mock_only:
            self.stdout.write(
                self.style.WARNING('⚠️  Running in mock-only mode (no real downloads)')
            )
        
        # Create WKT polygon from coordinates
        from shapely.geometry import Polygon
        offset = 0.01
        coords = [
            (lon - offset, lat - offset),
            (lon + offset, lat - offset),
            (lon + offset, lat + offset),
            (lon - offset, lat + offset),
            (lon - offset, lat - offset)
        ]
        polygon = Polygon(coords)
        wkt_aoi = polygon.wkt
        
        # Generate date range
        from datetime import datetime, timedelta
        import pytz
        end_date = datetime.now(pytz.UTC)
        start_date = end_date - timedelta(days=days_back)
        
        start_date_str = start_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        end_date_str = end_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        self.stdout.write(f'AOI: {wkt_aoi[:50]}...')
        self.stdout.write(f'Date range: {start_date_str} to {end_date_str}')
        
        # Test service status first
        self.stdout.write('\\n' + '='*60)
        self.stdout.write('🔍 Checking Service Status...')
        self.stdout.write('='*60)
        
        try:
            service = IntegratedAnalysisService()
            status = service.get_service_status()
            
            self.stdout.write('✅ Service Status:')
            for component, state in status['components'].items():
                if isinstance(state, dict):
                    continue
                status_color = self.style.SUCCESS if state == 'ready' else self.style.WARNING
                self.stdout.write(f'  • {component}: {status_color(state)}')
            
            # Check configuration
            config = status['configuration']
            earthdata_configured = config.get('earthdata_configured', False)
            if earthdata_configured:
                self.stdout.write('  • Earthdata credentials: ' + self.style.SUCCESS('✓ Configured'))
            else:
                self.stdout.write('  • Earthdata credentials: ' + self.style.ERROR('✗ Missing'))
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Service status check failed: {e}')
            )
            return
        
        # Run analysis
        self.stdout.write('\\n' + '='*60)
        self.stdout.write('🚀 Running Analysis Pipeline...')
        self.stdout.write('='*60)
        
        try:
            if mock_only:
                # Create a minimal mock test
                self.stdout.write('📊 Running mock analysis...')
                
                result = {
                    'success': True,
                    'results': {
                        'heatmap': {
                            'center_lat': lat,
                            'center_lon': lon,
                            'max_intensity': 0.75,
                            'analysis_summary': {
                                'total_area_km2': 9.0,
                                'high_risk_area_km2': 1.5,
                                'risk_distribution': {'low': 8000, 'moderate': 1500, 'high': 500}
                            }
                        },
                        'risk_score': 0.75,
                        'hypothesis_text': 'Mock analysis completed successfully. This is test data.'
                    }
                }
            else:
                # Run full analysis
                result = service.run_complete_analysis(wkt_aoi, start_date_str, end_date_str)
            
            if result.get('success', False):
                self.stdout.write(self.style.SUCCESS('🎉 Analysis completed successfully!'))
                
                # Display results
                results = result['results']
                risk_score = results.get('risk_score', 0)
                hypothesis = results.get('hypothesis_text', 'No hypothesis generated')
                
                self.stdout.write('\\n📊 Results Summary:')
                self.stdout.write(f'  • Risk Score: {self.style.SUCCESS(f"{risk_score:.3f}")}')
                self.stdout.write(f'  • Hypothesis: {hypothesis[:100]}...')
                
                # Heatmap info
                heatmap = results.get('heatmap', {})
                if 'analysis_summary' in heatmap:
                    summary = heatmap['analysis_summary']
                    self.stdout.write('\\n🗺️  Spatial Analysis:')
                    self.stdout.write(f'  • Total Area: {summary.get("total_area_km2", 0):.1f} km²')
                    self.stdout.write(f'  • High Risk Area: {summary.get("high_risk_area_km2", 0):.1f} km²')
                    
                    risk_dist = summary.get('risk_distribution', {})
                    self.stdout.write('  • Risk Distribution:')
                    self.stdout.write(f'    - Low: {risk_dist.get("low", 0):,} pixels')
                    self.stdout.write(f'    - Moderate: {risk_dist.get("moderate", 0):,} pixels')
                    self.stdout.write(f'    - High: {risk_dist.get("high", 0):,} pixels')
                
                # Save to database
                self.stdout.write('\\n💾 Saving to database...')
                
                ml_request = MLRequest.objects.create(
                    area_coordinates=wkt_aoi,
                    start_date=start_date.date(),
                    end_date=end_date.date(),
                    heatmap=results.get('heatmap', {}),
                    risk_score=risk_score,
                    hypothesis_text=hypothesis
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Saved as MLRequest #{ml_request.id}')
                )
                
            else:
                error = result.get('error', 'Unknown error')
                step_failed = result.get('step_failed', 'unknown')
                
                self.stdout.write(
                    self.style.ERROR(f'❌ Analysis failed at step: {step_failed}')
                )
                self.stdout.write(
                    self.style.ERROR(f'Error: {error}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Analysis pipeline failed: {e}')
            )
            import traceback
            self.stdout.write(traceback.format_exc())
        
        self.stdout.write('\\n' + '='*60)
        self.stdout.write('✨ Test completed!')
        self.stdout.write('='*60)