# Dockerfile for the Worker Service (in community_listening_engine/core/)
# This image handles the heavy lifting, event processing, and core logic.

# Use a slim Python base image for smaller size
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the global requirements.txt. This file is assumed to be in the project root 
# and contains all necessary dependencies for both services.
# Note: The path must point to the project root location relative to this Dockerfile.
COPY ../../requirements.txt /wheels/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r /wheels/requirements.txt

# Copy the local service code
COPY . /app

# Command to keep the worker service running, perhaps starting a background task or a perpetual listener.
# Assuming the worker runs a main script defined in 'core/main.py'
# This command could be replaced by specific long-running worker initialization logic.
CMD ["python", "main.py"]