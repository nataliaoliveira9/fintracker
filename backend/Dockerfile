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

# Standard Django port
EXPOSE 8000

CMD ["gunicorn", "fintracker.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]