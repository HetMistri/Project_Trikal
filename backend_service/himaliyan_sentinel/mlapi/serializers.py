from rest_framework import serializers
from .models import MLRequest

class MLRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLRequest
        fields = [
            'id', 'area_coordinates', 'start_date', 'end_date', 'created_at',
            'heatmap', 'risk_score', 'hypothesis_text'
        ]
