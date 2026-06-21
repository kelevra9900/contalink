FROM python:3.11-slim

# Evitar la escritura de archivos .pyc y asegurar que los logs se emitan directamente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias de sistema necesarias para healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Copiar e instalar requerimientos primero para aprovechar la caché de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente de la aplicación
COPY app/ ./app/

# Crear un usuario no-root por seguridad
RUN useradd -u 10001 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Exponer el puerto del Backend FastAPI
EXPOSE 8000

# Comando para ejecutar la aplicación con Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
