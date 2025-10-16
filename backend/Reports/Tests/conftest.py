import sys
import os
from pathlib import Path

# Add the Reports directory to Python path
current_dir = Path(__file__).parent
reports_dir = current_dir.parent
sys.path.insert(0, str(reports_dir))

# Set test environment variables
os.environ['FLASK_ENV'] = 'test'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['TESTING'] = 'True'
