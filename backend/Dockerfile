# ============================================================
# Dockerfile — MedAI Backend for Hugging Face Spaces
# ============================================================
# Hugging Face Spaces requirements:
#   - Must listen on port 7860
#   - User is non-root (UID 1000) — no sudo
#   - Set title/emoji/colorFrom/colorTo in README.md YAML header

FROM python:3.11-slim

# ── System dependencies ──────────────────────────────────────
# OpenCV needs these to work inside a container
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Create non-root user (required by HF Spaces) ─────────────
RUN useradd -m -u 1000 appuser

# ── Working directory ─────────────────────────────────────────
WORKDIR /app

# ── Install Python dependencies ───────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy application code ─────────────────────────────────────
COPY --chown=appuser:appuser . .

# ── Create model directory ────────────────────────────────────
# Upload your federated_model.keras to the Space's Files tab
# and it will appear at /app/model/federated_model.keras
RUN mkdir -p model && chown appuser:appuser model

# ── Switch to non-root user ───────────────────────────────────
USER appuser

# ── Expose port 7860 (required by Hugging Face Spaces) ───────
EXPOSE 7860

# ── Health check ──────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# ── Start server on port 7860 ─────────────────────────────────
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
