# Stage de build
FROM python:3.11-slim as builder

WORKDIR /app

COPY requirements.txt .

# Instala dependências em virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage final
FROM python:3.11-slim

# Instala curl para healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copia apenas o virtual environment do stage de build
COPY --from=builder /opt/venv /opt/venv

# Copia código
COPY . .

ENV PATH="/opt/venv/bin:$PATH"

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

CMD ["python", "app.py"]