#!/usr/bin/env python3
"""
Main entry point for the TaskAttachments service.
This file handles both Docker execution and test compatibility.
"""

import sys
import os

# Add the current directory to Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Now we can use absolute imports
from app import create_app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=8005, host='0.0.0.0')


