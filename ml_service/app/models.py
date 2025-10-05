from pydantic import BaseModel

class AnalysisRequest(BaseModel):
    coherence_map_path: str
    vv_before_path: str
    vv_after_path: str
    vh_before_path: str
    vh_after_path: str
    slope_map_path: str

class AnalysisResponse(BaseModel):
    heatmap: dict
    risk_score: float
    hypothesis_text: str