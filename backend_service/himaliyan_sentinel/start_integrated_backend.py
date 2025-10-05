# start_integrated_backend.py - Script to start the integrated backend service

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🚀 Starting Himalayan Sentinel Integrated Backend Service")
    print("=" * 60)
    
    # Check if we're in the right directory
    current_dir = Path.cwd()
    expected_files = ['manage.py', 'integrated_service.py', 'mlapi']
    
    missing_files = [f for f in expected_files if not (current_dir / f).exists()]
    if missing_files:
        print(f"❌ Missing required files: {missing_files}")
        print(f"Please run this script from the himaliyan_sentinel directory")
        return 1
    
    print("✅ Directory structure verified")
    
    # Check for environment file
    env_file = current_dir / '.env'
    if not env_file.exists():
        print("⚠️  .env file not found. Creating from template...")
        template_file = current_dir / '.env.template'
        if template_file.exists():
            with open(template_file, 'r') as src, open(env_file, 'w') as dst:
                dst.write(src.read())
            print("📝 Created .env from template. Please update with your credentials.")
        else:
            print("❌ No .env.template found. Please create .env manually.")
    
    # Check Python dependencies
    print("\n🔍 Checking dependencies...")
    try:
        import django
        import shapely
        import rasterio
        import numpy
        import pandas
        print("✅ Core dependencies available")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return 1
    
    # Check database
    print("\n🗄️  Setting up database...")
    try:
        result = subprocess.run([
            sys.executable, 'manage.py', 'migrate'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Database migrations completed")
        else:
            print(f"⚠️  Migration warnings: {result.stderr}")
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
    
    # Test the integrated service
    print("\n🧪 Testing integrated service...")
    try:
        result = subprocess.run([
            sys.executable, 'manage.py', 'test_integrated_service', '--mock-only'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Service test passed")
        else:
            print(f"⚠️  Service test had issues: {result.stderr}")
            print("Continuing with server startup...")
    except subprocess.TimeoutExpired:
        print("⚠️  Service test timed out, but continuing...")
    except Exception as e:
        print(f"⚠️  Service test failed: {e}")
        print("Continuing with server startup...")
    
    # Start the server
    print("\n🌐 Starting Django development server...")
    print("=" * 60)
    print("API Endpoints available at:")
    print("  • http://127.0.0.1:8000/api/aoi-format/")
    print("  • http://127.0.0.1:8000/api/ml-request/") 
    print("  • http://127.0.0.1:8000/api/service-status/")
    print("")
    print("Frontend Integration:")
    print("  • Send coordinates to /api/aoi-format/ with run_analysis=true")
    print("  • Check service health at /api/service-status/")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        subprocess.run([
            sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000'
        ])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
        return 0

if __name__ == '__main__':
    sys.exit(main())