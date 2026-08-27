# Dockerfile for the Worker Service (in community_listening_engine/core/)
# This image handles the heavy lifting, event processing, and core logic.

# Use a slim Python base image for smaller size
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the global requirements.txt. This file is assumed to be in the project root 
# and contains all necessary dependencies for both services.
# 1. Copy the global requirements.txt from the root context
COPY requirements.txt requirements.txt

# 2. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy the core service source code
COPY core/ . /app/

# 4. Define the command to run the core service
# Assuming the main entry point is core/main.py
CMD ["python", "main.py"]