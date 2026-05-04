#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Render provides the PORT environment variable
PORT="${PORT:-8000}"

echo "Starting Gunicorn on port $PORT..."
exec gunicorn fintracker.wsgi:application \
    --bind "0.0.0.0:$PORT" \
    --workers 1 \
    --access-logfile - \
    --error-logfile -
