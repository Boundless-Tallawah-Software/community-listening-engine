# Dockerfile for the API Service (in community_listening_engine/api/)
# This image serves the primary API exposed on port 8000 to clients.

# Use a slim Python base image for smaller size
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the global requirements.txt. This file is assumed to be in the project root 
# and contains all necessary dependencies for both services.
COPY ../../requirements.txt /wheels/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r /wheels/requirements.txt

# Copy the local service code
COPY . /app

# Command to run the application using Uvicorn/FastAPI
# We assume the entry point structure matches the dependencies. 
# The specific command needs to be tailored to the actual API's structure, 
# but for now, we define a generic entry point based on common practice.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]