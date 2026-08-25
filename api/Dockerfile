# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file and install dependencies (assuming a requirements.txt exists or needs to be created)
# Since no requirements.txt is visible, I will assume basic setup for now and instruct the user on this dependency.
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY api/ .
COPY core/ ./core

# Expose the port the API runs on (assuming 8000 or similar)
EXPOSE 8000

# Command to run the application
CMD ["python", "main.py"]