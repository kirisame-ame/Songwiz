FROM python:3.11

# Set the working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Nginx
RUN apt-get update && apt-get install -y \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy application source and Gunicorn configuration
COPY src /app/src
COPY gunicorn /app/gunicorn

# Create volume for persistent data
VOLUME /var/www/html

# Expose necessary ports
EXPOSE 80 5000

# Start Nginx and Gunicorn together
CMD service nginx start && gunicorn --config gunicorn/gunicorn_config.py src.app:app
