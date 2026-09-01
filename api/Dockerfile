# Dockerfile for the API Service
# Uses the full project context (project root) for building.

# Use a slim Python base image for smaller size
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements.txt from the project root context
COPY requirements.txt requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire source tree from the build context
# This ensures both api and core modules are available
COPY . .

# Set PYTHONPATH to use absolute import paths
ENV PYTHONPATH=/app

# Define the command to run the API service
# The main.py is in api/ directory
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]