from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MLRequest
from .serializers import MLRequestSerializer
from shapely.geometry import Polygon
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import pytz

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

class AOIFormatView(APIView):
    def post(self, request):
        # Expected input:
        # {
        #   "coordinates": [[72.521, 23.042], [72.535, 23.042], [72.535, 23.032], [72.521, 23.032], [72.521, 23.042]]
        # }

        coords = request.data.get("coordinates")

        if not coords:
            return Response({"error": "Missing coordinates"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            polygon = Polygon(coords)
            wkt_format = polygon.wkt
        except Exception as e:
            return Response({"error": f"Invalid coordinates: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        end_date = datetime.now(pytz.UTC)
        start_date = end_date - timedelta(days=30)

        response_data = {
            "aoi": wkt_format,
            "input_date": {
                "start": start_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "end": end_date.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)
