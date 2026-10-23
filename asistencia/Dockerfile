FROM python:3.13-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice-writer fonts-liberation fonts-crosextra-carlito \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY asistencia/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY asistencia/ /app/asistencia/

EXPOSE 10000
CMD ["sh", "-c", "python asistencia/servidor.py --host 0.0.0.0 --port ${PORT:-10000}"]
