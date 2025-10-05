# management/commands/generate_assets.py
from django.core.management.base import BaseCommand
from ml_analysis.generate_final_assets import FinalAssetGenerator
import json

class Command(BaseCommand):
    help = 'Generate final ML assets and train model'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force regeneration even if model exists',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting final asset generation...')
        )
        
        try:
            generator = FinalAssetGenerator()
            results = generator.run_pipeline()
            
            self.stdout.write(
                self.style.SUCCESS('Asset generation completed successfully!')
            )
            
            # Display results
            self.stdout.write(f"Risk Score: {results['risk_score']:.3f}")
            self.stdout.write(f"Features Processed: {results['features_processed']}")
            self.stdout.write(f"Data Source: {results['data_source']}")
            self.stdout.write(f"Model Path: {results['model_path']}")
            
            return results
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Asset generation failed: {e}')
            )
            raise