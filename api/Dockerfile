# Dockerfile for the API Service
# Uses the full project context (project root) for building.

# Use a slim Python base image for smaller size
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# 1. Copy the global requirements.txt from the root context
# This is the single source of truth for dependencies.
COPY requirements.txt requirements.txt

# 2. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy all source code for the API service from the local directory
# This copies the contents of the 'api' and 'core' folders into /app.
COPY api/ .
COPY core/ .

# 4. Define the command to run the API service
# Assuming the main entry point is api/main.py and uses FastAPI.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]