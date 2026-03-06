FROM python:3.13-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download model at build time so cold starts are instant
RUN python -c "from transformers import pipeline; pipeline('image-classification', model='Falconsai/nsfw_image_detection')"

COPY nsfw_server.py .

# Non-root user for security
RUN useradd -m appuser && chown -R appuser /app /root/.cache
USER appuser

CMD ["uvicorn", "nsfw_server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]