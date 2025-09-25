FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set env variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements for caching
COPY requirements.txt requirements-dev.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Optional: install dev deps when CI=true or INSTALL_DEV=true
ARG INSTALL_DEV=false
ENV INSTALL_DEV=${INSTALL_DEV}
RUN if [ "$INSTALL_DEV" = "true" ] || [ "$CI" = "true" ]; then \
      pip install --no-cache-dir -r requirements-dev.txt; \
    fi

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8001

# Run the application
CMD ["python", "app.py"]
