#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Creating cache table..."
python manage.py createcachetable --noinput

# Render provides the PORT environment variable
PORT="${PORT:-8000}"

echo "Starting Gunicorn on port $PORT..."
exec gunicorn fintracker.wsgi:application \
    --bind "0.0.0.0:$PORT" \
    --workers 3 \
    --access-logfile - \
    --error-logfile -
