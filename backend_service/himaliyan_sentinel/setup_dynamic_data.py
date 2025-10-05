#!/usr/bin/env python3
"""
Setup script for Project Trikal - Dynamic Data Service Configuration
This script helps configure the backend for dynamic SAR and DEM data downloading.
"""

import os
import sys
from pathlib import Path

def setup_earthdata_credentials():
    """Interactive setup for Earthdata credentials."""
    print("\n" + "="*60)
    print("🛰️  EARTHDATA LOGIN SETUP")
    print("="*60)
    print()
    print("For SAR data downloading, you need an Earthdata Login account.")
    print("👉 Register at: https://urs.earthdata.nasa.gov/")
    print()
    
    env_path = Path(".env")
    
    # Check if .env already exists
    if env_path.exists():
        print("⚠️  .env file already exists!")
        choice = input("Do you want to update it? (y/n): ").lower().strip()
        if choice != 'y':
            print("Skipping credentials setup.")
            return False
    
    username = "nakshi31"
    password = "Nakshishah@31"
    
    if not username or not password:
        print("❌ Invalid credentials provided!")
        return False
    
    # Create/update .env file
    env_content = f"""# Earthdata Login Credentials for SAR Data Access
EARTHDATA_USERNAME={username}
EARTHDATA_PASSWORD={password}

# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("✅ Credentials saved to .env file!")
    return True

def test_data_downloading():
    """Test the data downloading functionality."""
    print("\n" + "="*60)
    print("🧪 TESTING DATA DOWNLOADING")
    print("="*60)
    
    try:
        from data_processing.sar_downloader import SARDownloader
        from data_processing.dem_downloader import DEMDownloader
        
        # Test SAR downloader
        print("\n1. Testing SAR Downloader Configuration...")
        sar_downloader = SARDownloader()
        
        if not sar_downloader.config.EARTHDATA_USERNAME:
            print("❌ SAR downloader: Earthdata credentials not configured")
            return False
        else:
            print("✅ SAR downloader: Credentials configured")
        
        # Test DEM downloader
        print("\n2. Testing DEM Downloader...")
        dem_downloader = DEMDownloader()
        print("✅ DEM downloader: Ready")
        
        # Test search functionality (no download)
        print("\n3. Testing SAR search (no download)...")
        test_aoi = 'POLYGON((85.3 27.7, 85.4 27.7, 85.4 27.8, 85.3 27.8, 85.3 27.7))'
        
        import asf_search as asf
        results = asf.search(
            platform=asf.PLATFORM.SENTINEL1,
            dataset='OPERA-S1',
            intersectsWith=test_aoi,
            start='2024-07-20T00:00:00Z',
            end='2024-08-01T23:59:59Z',
            maxResults=5
        )
        
        print(f"✅ SAR search successful: Found {len(results)} scenes")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def create_directory_structure():
    """Create required directory structure."""
    print("\n" + "="*60)
    print("📁 CREATING DIRECTORY STRUCTURE")
    print("="*60)
    
    from data_processing.config import DataProcessingConfig
    
    try:
        config = DataProcessingConfig()
        config.ensure_directories()
        
        print("✅ Created data processing directories:")
        print(f"   📂 {config.DATA_DIR}")
        print(f"   📂 {config.SAR_DATA_DIR}")
        print(f"   📂 {config.DEM_DATA_DIR}")
        print(f"   📂 {config.LOGS_DIR}")
        
        return True
    except Exception as e:
        print(f"❌ Failed to create directories: {e}")
        return False

def show_usage_examples():
    """Show usage examples for the dynamic data service."""
    print("\n" + "="*60)
    print("📖 USAGE EXAMPLES")
    print("="*60)
    
    examples = """
🔥 API Usage (Dynamic Data Downloading):

1. Format AOI Only:
   POST /api/format-aoi/
   {
       "coordinates": "85.3,27.7,85.4,27.8",
       "mode": "format_only"
   }

2. Complete Analysis with Dynamic Data:
   POST /api/format-aoi/
   {
       "coordinates": "85.3,27.7,85.4,27.8", 
       "start_date": "2024-07-20T00:00:00Z",
       "end_date": "2024-08-01T23:59:59Z",
       "mode": "complete_analysis"
   }

🔧 Direct Python Usage:

   from integrated_service import IntegratedAnalysisService
   
   service = IntegratedAnalysisService()
   results = service.run_complete_analysis(
       wkt_aoi='POLYGON((85.3 27.7, 85.4 27.7, 85.4 27.8, 85.3 27.8, 85.3 27.7))',
       start_date='2024-07-20T00:00:00Z',
       end_date='2024-08-01T23:59:59Z'
   )

📊 The service will:
   ✅ Download DEM data dynamically
   ✅ Download SAR data dynamically (if credentials configured)
   ✅ Process data for ML analysis
   ✅ Generate predictions and risk assessments
"""
    
    print(examples)

def main():
    """Main setup function."""
    print("🚀 Project Trikal - Dynamic Data Service Setup")
    print("=" * 60)
    
    steps_completed = 0
    
    # Step 1: Create directories
    if create_directory_structure():
        steps_completed += 1
    
    # Step 2: Setup credentials
    credentials_ok = False
    while not credentials_ok:
        choice = input("\nDo you want to configure Earthdata credentials now? (y/n): ").lower().strip()
        if choice == 'y':
            credentials_ok = setup_earthdata_credentials()
            if credentials_ok:
                steps_completed += 1
        elif choice == 'n':
            print("⚠️  Skipping credentials setup. SAR downloading will not work.")
            print("   You can configure later by creating a .env file with:")
            print("   EARTHDATA_USERNAME=your_username")
            print("   EARTHDATA_PASSWORD=your_password")
            break
        else:
            print("Please enter 'y' or 'n'")
    
    # Step 3: Test configuration
    if credentials_ok:
        if test_data_downloading():
            steps_completed += 1
    
    # Show usage examples
    show_usage_examples()
    
    # Summary
    print("\n" + "="*60)
    print("✨ SETUP SUMMARY")
    print("="*60)
    print(f"Steps completed: {steps_completed}/3")
    
    if steps_completed >= 2:
        print("🎉 Setup successful! Your dynamic data service is ready.")
        print("\nNext steps:")
        print("1. Start the Django server: python manage.py runserver")
        print("2. Test the API endpoints")
        print("3. Monitor logs in data_processing/logs/")
    else:
        print("⚠️  Setup incomplete. Please review the errors above.")
    
    print("\n📚 Documentation: Check INTEGRATION_PLAN.md for more details")

if __name__ == "__main__":
    main()