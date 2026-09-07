# Dockerfile for running tests with Python 3.12
FROM python:3.12-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install requirements (will use pre-built wheels for Python 3.12)
RUN pip install --no-cache-dir -r requirements.txt

# Install test dependencies
RUN pip install pytest pytest-cov pytest-asyncio

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/data

# Create appuser and set proper permissions
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Default command
CMD ["python", "-m", "pytest", "-v"]