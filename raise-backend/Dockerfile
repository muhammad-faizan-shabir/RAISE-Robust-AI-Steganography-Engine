# Use Python 3.7 slim image
FROM python:3.7-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y default-jre

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies with progress display
RUN pip install --upgrade pip setuptools wheel && \
    pip install --progress-bar on -r requirements.txt

# Copy application code (includes alembic.ini and alembic/)
COPY ./app /app

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Default command (will be overridden by docker-compose)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

