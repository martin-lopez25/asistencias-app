"""
Serializadores para la API REST de Django
"""
from rest_framework import serializers
import datetime


class AttendanceRequestSerializer(serializers.Serializer):
    full_name = serializers.CharField(
        max_length=200,
        required=True,
        error_messages={
            'required': 'El nombre completo es obligatorio.',
            'blank': 'El nombre completo no puede estar vacío.'
        }
    )
    job_title = serializers.CharField(
        max_length=150,
        required=True,
        error_messages={
            'required': 'El cargo es obligatorio.',
            'blank': 'El cargo no puede estar vacío.'
        }
    )
    year = serializers.IntegerField(
        required=False,
        min_value=2000,
        max_value=2100,
        default=lambda: datetime.datetime.now().year
    )
    month = serializers.IntegerField(
        required=False,
        min_value=1,
        max_value=12,
        default=lambda: datetime.datetime.now().month
    )
    format_type = serializers.ChoiceField(
        choices=['pdf', 'csv', 'html'],
        default='pdf',
        required=False
    )
