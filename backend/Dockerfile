FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install gunicorn uvicorn-worker

COPY backend/ .

EXPOSE 8000

# Use sh -c to allow environment variable expansion for PORT
CMD ["sh", "-c", "gunicorn main:app --workers 2 --worker-class uvicorn_worker.UvicornWorker --bind 0.0.0.0:${PORT:-8000}"]
