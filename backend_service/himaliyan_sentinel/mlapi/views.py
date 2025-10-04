from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MLRequest
from .serializers import MLRequestSerializer

# Dummy ML function
def run_ml_model(area_coordinates, start_date, end_date):
    return {
        "heatmap": {"lat": 12.97, "lon": 77.59, "intensity": 0.8},
        "risk_score": 0.76,
        "hypothesis_text": "The region has a moderate wildfire risk due to dry conditions."
    }

class MLRequestView(APIView):
    def post(self, request):
        serializer = MLRequestSerializer(data=request.data)
        if serializer.is_valid():
            ml_request = serializer.save()

            result = run_ml_model(
                ml_request.area_coordinates,
                ml_request.start_date,
                ml_request.end_date
            )

            ml_request.heatmap = result['heatmap']
            ml_request.risk_score = result['risk_score']
            ml_request.hypothesis_text = result['hypothesis_text']
            ml_request.save()

            return Response(MLRequestSerializer(ml_request).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
