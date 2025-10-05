# 🚀 Project Improvement Script - Environment Cleanup

# This script implements the critical fixes identified in the project analysis

import os
import shutil
import subprocess
import sys
from pathlib import Path

def print_status(message, status="INFO"):
    """Print colored status messages (Windows compatible)."""
    # Use simple text prefixes instead of Unicode emojis for Windows compatibility
    prefixes = {
        "INFO": "[INFO]",
        "SUCCESS": "[SUCCESS]", 
        "WARNING": "[WARNING]",
        "ERROR": "[ERROR]"
    }
    
    # Try to use colors if available, fallback to plain text
    try:
        colors = {
            "INFO": "\033[94m",      # Blue
            "SUCCESS": "\033[92m",   # Green  
            "WARNING": "\033[93m",   # Yellow
            "ERROR": "\033[91m",     # Red
            "END": "\033[0m"         # Reset
        }
        print(f"{colors.get(status, '')}{prefixes.get(status, status)}: {message}{colors['END']}")
    except UnicodeEncodeError:
        # Fallback for Windows CMD that doesn't support Unicode
        print(f"{prefixes.get(status, status)}: {message}")

def run_command(command, description):
    """Run a command and return the result."""
    print_status(f"Running: {description}", "INFO")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print_status(f"SUCCESS: {description} completed", "SUCCESS")
            return True
        else:
            print_status(f"FAILED: {description} failed: {result.stderr}", "ERROR")
            return False
    except Exception as e:
        print_status(f"ERROR: {description} error: {e}", "ERROR")
        return False

def main():
    print_status("Starting Project Trikal Environment Cleanup", "INFO")
    print("=" * 60)
    
    # Check if we're in the project root
    if not Path("backend_service").exists():
        print_status("Please run this script from the Project_Trikal root directory", "ERROR")
        return 1
    
    print_status("Project root directory confirmed", "SUCCESS")
    
    # 1. Clean up duplicate virtual environments
    print_status("\n1. Cleaning up duplicate virtual environments", "INFO")
    
    venv_path = Path("venv")
    if venv_path.exists():
        print_status("Removing redundant 'venv/' directory", "WARNING")
        try:
            shutil.rmtree(venv_path)
            print_status("Removed redundant venv/ directory", "SUCCESS")
        except Exception as e:
            print_status(f"Failed to remove venv/: {e}", "ERROR")
    else:
        print_status("No redundant venv/ directory found", "SUCCESS")
    
    # 2. Consolidate requirements.txt files
    print_status("\n2. Consolidating requirements.txt files", "INFO")
    
    # Create unified requirements
    unified_requirements = [
        "# Unified Project Requirements - Generated from integration analysis",
        "",
        "# Core Framework",
        "Django>=5.2.5",
        "djangorestframework>=3.16.1",
        "djangorestframework-simplejwt>=5.5.1", 
        "django-cors-headers>=4.7.0",
        "",
        "# Geospatial Data Processing", 
        "rasterio>=1.4.3",
        "shapely>=2.1.2",
        "geopandas>=1.1.1",
        "pyproj>=3.7.2",
        "fiona>=1.10.1",
        "GDAL>=3.11.1",
        "",
        "# SAR Data Processing",
        "asf-search>=10.1.0",
        "",
        "# Scientific Computing & ML",
        "numpy>=2.3.3", 
        "pandas>=2.3.2",
        "scipy>=1.16.2",
        "scikit-learn",
        "scikit-image>=0.25.2",
        "xgboost",
        "",
        "# Utilities",
        "requests>=2.32.5",
        "python-dotenv>=1.1.1",
        "tqdm>=4.67.1",
        "click>=8.3.0",
        "colorama>=0.4.6",
        "",
        "# Development & Testing",
        "pytest>=8.4.2",
        "pytest-cov>=7.0.0", 
        "black>=25.9.0",
        "flake8>=7.3.0",
        "",
        "# Geographic utilities",
        "geopy>=2.4.1",
        "",
        "# Date/Time handling",
        "pytz>=2025.2",
        "python-dateutil>=2.9.0.post0"
    ]
    
    try:
        with open("requirements-unified.txt", "w") as f:
            f.write("\n".join(unified_requirements))
        print_status("Created requirements-unified.txt", "SUCCESS")
    except Exception as e:
        print_status(f"Failed to create unified requirements: {e}", "ERROR")
    
    # 3. Git repository improvements
    print_status("\n3. Git repository improvements", "INFO")
    
    # Check git status
    run_command("git status --porcelain", "Checking git status")
    
    # Add new integration files
    integration_files = [
        "backend_service/himaliyan_sentinel/.env.template",
        "backend_service/himaliyan_sentinel/INTEGRATED_README.md", 
        "backend_service/himaliyan_sentinel/INTEGRATION_COMPLETE.md",
        "backend_service/himaliyan_sentinel/data_processing/",
        "backend_service/himaliyan_sentinel/integrated_service.py",
        "backend_service/himaliyan_sentinel/ml_analysis/",
        "backend_service/himaliyan_sentinel/mlapi/management/",
        "backend_service/himaliyan_sentinel/start_integrated_backend.py",
        "requirements-unified.txt",
        "PROJECT_ANALYSIS_COMPLETE.md"
    ]
    
    for file in integration_files:
        if Path(file).exists():
            run_command(f"git add {file}", f"Adding {file}")
    
    # 4. Update .gitignore for better practices
    print_status("\n4. Updating .gitignore", "INFO")
    
    gitignore_additions = [
        "",
        "# Analysis and documentation",
        "PROJECT_ANALYSIS_*",
        "",
        "# Virtual environment variations", 
        ".venv/",
        "venv/",
        "env/",
        "ENV/",
        "",
        "# IDE and editor files",
        ".vscode/",
        ".idea/",
        "*.swp",
        "*.swo",
        "*~",
        "",
        "# OS generated files",
        ".DS_Store",
        ".DS_Store?",
        "._*",
        ".Spotlight-V100",
        ".Trashes",
        "ehthumbs.db",
        "Thumbs.db",
        "",
        "# Data processing outputs",
        "data_processing/data/",
        "data_processing/logs/",
        "*.log",
        "",
        "# ML model files (if large)",
        "*.pkl",
        "*.joblib", 
        "models/*.json",
        "",
        "# Backup files",
        "*.bak",
        "*.backup",
        "*.orig"
    ]
    
    try:
        with open(".gitignore", "a") as f:
            f.write("\n".join(gitignore_additions))
        print_status("Updated .gitignore with additional patterns", "SUCCESS")
    except Exception as e:
        print_status(f"Failed to update .gitignore: {e}", "ERROR")
    
    # 5. Create basic ML model placeholder
    print_status("\n5. Creating ML model placeholder", "INFO")
    
    model_script = '''# train_basic_model.py - Create placeholder ML model
import numpy as np
import pandas as pd
import pickle
from pathlib import Path

def create_placeholder_model():
    """Create a simple placeholder model for testing."""
    # Mock training data
    n_samples = 1000
    features = pd.DataFrame({
        'slope': np.random.uniform(0, 60, n_samples),
        'backscatter_change': np.random.uniform(-10, 10, n_samples),
        'coherence': np.random.uniform(0, 1, n_samples),
        'ratio_change': np.random.uniform(-1, 1, n_samples)
    })
    
    # Simple rule-based labels for training
    labels = ((features['slope'] > 30) & 
              (features['coherence'] < 0.4) & 
              (abs(features['backscatter_change']) > 5)).astype(int)
    
    try:
        import xgboost as xgb
        
        # Train XGBoost model
        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        model.fit(features, labels)
        
        # Save model
        model_path = Path(__file__).parent / "ml_analysis" / "himalayan_sentinel_model.json"
        model.save_model(str(model_path))
        
        print(f"SUCCESS: XGBoost model saved to {model_path}")
        return True
        
    except ImportError:
        print("WARNING: XGBoost not available, creating pickle fallback")
        
        # Create simple fallback
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(features, labels)
        
        model_path = Path(__file__).parent / "ml_analysis" / "fallback_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
            
        print(f"SUCCESS: Fallback model saved to {model_path}")
        return True

if __name__ == "__main__":
    create_placeholder_model()
'''
    
    try:
        model_script_path = Path("backend_service/himaliyan_sentinel/train_basic_model.py")
        with open(model_script_path, "w") as f:
            f.write(model_script)
        print_status("Created ML model training script", "SUCCESS")
        
        # Try to run it
        original_dir = os.getcwd()
        os.chdir("backend_service/himaliyan_sentinel")
        run_command("python train_basic_model.py", "Creating placeholder ML model")
        os.chdir(original_dir)
        
    except Exception as e:
        print_status(f"Failed to create ML model: {e}", "ERROR")
    
    # 6. Summary and next steps
    print_status("\nEnvironment cleanup completed!", "SUCCESS")
    print("=" * 60)
    print("Next Steps:")
    print("1. Review the generated requirements-unified.txt")
    print("2. Test the integrated backend: cd backend_service/himaliyan_sentinel && python start_integrated_backend.py")
    print("3. Commit changes: git commit -m 'feat: Environment cleanup and integration fixes'")
    print("4. Push to backup: git push origin data")
    print("5. Review PROJECT_ANALYSIS_COMPLETE.md for detailed recommendations")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())