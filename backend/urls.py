"""
Rutas de la API para Django
"""
from django.urls import path
from .views import GenerateAttendanceAPIView

app_name = "asistencia"

urlpatterns = [
    path("asistencia/generar/", GenerateAttendanceAPIView.as_view(), name="generar_asistencia"),
]
