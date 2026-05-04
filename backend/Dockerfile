# Use the Python version that matches your environment
FROM python:3.12-slim

# Set environment variables to keep Python from buffering and writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files for WhiteNoise (dummy key used only at build time)
RUN DJANGO_SECRET_KEY=build-time-placeholder python manage.py collectstatic --noinput

# Copy entrypoint script and make sure it has the right permissions
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Render provides the port via $PORT
EXPOSE 8000

# Use the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]