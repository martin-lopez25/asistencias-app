# Integración Backend Django - Generador de Hojas de Asistencia

Esta carpeta contiene la arquitectura y el script de Python para la generación de hojas de asistencia laboral y su exposición a través de una API REST con **Django REST Framework**.

## Estructura de archivos

- `attendance_generator.py`: Script existente en Python que genera la matriz de asistencia, los días del mes y el contenido del documento.
- `serializers.py`: Serializador DRF para validación estricta de parámetros (`full_name`, `job_title`, `month`, `year`, `format_type`).
- `views.py`: `GenerateAttendanceAPIView` que procesa la solicitud y devuelve el archivo como stream con encabezados de descarga.
- `urls.py`: Configuración de enrutamiento del endpoint `/api/asistencia/generar/`.

## Requisitos de Python

```bash
pip install django djangorestframework django-cors-headers
```

## Configuración de CORS en `settings.py`

Para permitir la comunicación entre React (puerto 3000 o producción) y Django (puerto 8000):

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'backend',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    ...
]

# Permitir orígenes del frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Exponer el encabezado Content-Disposition para que React lea el nombre del archivo
CORS_EXPOSE_HEADERS = ['Content-Disposition']
```

## Uso desde el Frontend React

El frontend realiza una petición HTTP POST:

```typescript
const response = await fetch("http://localhost:8000/api/asistencia/generar/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    full_name: "Ana Morales",
    job_title: "Coordinadora de Proyectos",
    month: 10,
    year: 2026,
    format_type: "pdf"
  })
});
```
