FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file and install dependencies (assuming core/requirements.txt exists)
COPY core/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY core/ .

# Expose the port the Core service runs on (adjust if necessary)
EXPOSE 8001 # Assuming a different port for the core service

# Command to run the application
CMD ["python", "main.py"]=======
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file and install dependencies (assuming core/requirements.txt exists)
COPY core/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY core/ .

# Expose the port the Core service runs on (adjust if necessary)
EXPOSE 8001 # Assuming a different port for the core service

# Command to run the application
CMD ["python", "main.py"]=======
# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file and install dependencies (using the root requirements.txt)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY core/ .

# Expose the port the Core service runs on (adjust if necessary)
EXPOSE 8001

# Command to run the application
CMD ["python", "main.py"]>>>>>>> REPLACE
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file and install dependencies (assuming core/requirements.txt exists)
COPY core/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY core/ .

# Expose the port the Core service runs on (adjust if necessary)
EXPOSE 8001

# Command to run the application
CMD ["python", "main.py"]>>>>>>> REPLACE
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file and install dependencies (assuming core/requirements.txt exists)
COPY core/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY core/ .

# Expose the port the Core service runs on (adjust if necessary)
EXPOSE 8001 # Assuming a different port for the core service

# Command to run the application
CMD ["python", "main.py"]