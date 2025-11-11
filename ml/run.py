#!/usr/bin/env python3
"""
Startup script for Railway deployment
This handles the PORT environment variable properly
"""

import os
import subprocess
import sys

def main():
    # Get port from environment or use default
    port = os.environ.get('PORT', '5000')
    
    print(f"Starting application on port {port}")
    
    # Create model if it doesn't exist
    try:
        if not os.path.exists('model.pkl'):
            print("Creating model...")
            subprocess.run([sys.executable, 'create_model.py'], check=True)
    except Exception as e:
        print(f"Warning: Could not create model: {e}")
    
    # Start gunicorn
    cmd = [
        'gunicorn',
        '--bind', f'0.0.0.0:{port}',
        '--workers', '1',
        '--timeout', '120',
        '--preload',
        'api:app'
    ]
    
    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd)

if __name__ == '__main__':
    main()
