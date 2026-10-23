"""
Vistas de Django REST Framework para la generación de hojas de asistencia
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from .serializers import AttendanceRequestSerializer
from .attendance_generator import generate_attendance_document


class GenerateAttendanceAPIView(APIView):
    """
    Endpoint: POST /api/asistencia/generar/
    Recibe el nombre completo y cargo del empleado, ejecuta el generador
    y devuelve el archivo correspondiente para su descarga.
    """

    def post(self, request, *args, **kwargs):
        serializer = AttendanceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors, "message": "Datos de formulario inválidos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        full_name = validated_data["full_name"]
        job_title = validated_data["job_title"]
        year = validated_data.get("year")
        month = validated_data.get("month")
        format_type = validated_data.get("format_type", "pdf")

        try:
            # Ejecuta la lógica existente del generador sin alterarla
            doc_result = generate_attendance_document(
                full_name=full_name,
                job_title=job_title,
                year=year,
                month=month,
                format_type=format_type
            )

            # Construye la respuesta HTTP para descarga de archivo
            response = HttpResponse(
                doc_result["content"],
                content_type=doc_result["content_type"]
            )
            response['Content-Disposition'] = f'attachment; filename="{doc_result["filename"]}"'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            return response

        except Exception as e:
            # Mensaje comprensible sin exponer trazas internas
            return Response(
                {"message": "Ocurrió un error al procesar el documento. Inténtelo más tarde."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
