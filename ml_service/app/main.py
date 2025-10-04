from fastapi import FastAPI
from app.models import AnalysisRequest, AnalysisResponse
from app.logic.predictor import make_prediction

app = FastAPI(title="Himalayan Sentinel ML Service")

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_data(request: AnalysisRequest):
    """
    Accepts a request with file paths, runs the full ML pipeline,
    and returns the final hypothesis package.
    """
    print("Live request received. Running full prediction pipeline...")
    
    # Convert the Pydantic request model to a dictionary
    file_paths_dict = request.model_dump()
    
    # Call the main prediction function with the file paths
    prediction_results = make_prediction(file_paths_dict)
    
    # Return the results using the AnalysisResponse model.
    # The ** unpacks the dictionary into keyword arguments.
    return AnalysisResponse(**prediction_results)