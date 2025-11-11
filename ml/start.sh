#!/bin/bash
# Startup script for Railway deployment

# Set default port if not provided
if [ -z "$PORT" ]; then
    export PORT=5000
fi

echo "Starting gunicorn on port $PORT"

# Start gunicorn with the correct port
exec gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 --preload api:app
