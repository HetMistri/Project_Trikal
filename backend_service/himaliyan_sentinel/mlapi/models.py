from django.db import models

class MLRequest(models.Model):
    area_coordinates = models.TextField()   
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    heatmap = models.JSONField(null=True, blank=True)   
    risk_score = models.FloatField(null=True, blank=True)
    hypothesis_text = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"ML Request {self.id} - Risk: {self.risk_score}"
