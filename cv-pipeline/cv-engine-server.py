from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import json
from PIL import Image
from io import BytesIO
from google import genai
from google.genai import types
from dotenv import load_dotenv

import importlib

# Dynamically import due to hyphens in filenames
cv_engine = importlib.import_module("cv-engine")
get_satellite_image = cv_engine.get_satellite_image
detect_cooling_towers = cv_engine.detect_cooling_towers

cv_pipeline_poc = importlib.import_module("cv-pipeline-poc")
get_building_insights = cv_pipeline_poc.get_building_insights
calculate_rainwater_yield = cv_pipeline_poc.calculate_rainwater_yield

load_dotenv()

app = FastAPI(title="Grundfos Viability Engine")

# This allows your Next.js frontend to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analyze")
async def analyze_location(lat: float, lng: float):
    """
    The main endpoint Next.js will call when a user clicks the map.
    """
    print(f"Incoming request for: {lat}, {lng}")
    
    try:
        # --- 1. RUN SPATIAL/YIELD PIPELINE ---
        # (Assuming you imported get_building_insights and calculate_rainwater_yield)
        insights = get_building_insights(lat, lng)
        if insights:
            area_sqm = insights.get('solarPotential', {}).get('wholeRoofStats', {}).get('areaMeters2', 0)
            area_sqft = round(area_sqm * 10.7639)
            annual_yield = calculate_rainwater_yield(area_sqft, 34.0) # Using Dallas rain as default for now
        else:
            area_sqft = 0
            annual_yield = 0
        
        # --- 2. RUN CV PIPELINE ---
        roof_img = get_satellite_image(lat, lng)
        cv_result = detect_cooling_towers(roof_img)
        
        # --- 3. RETURN COMPILED JSON TO NEXT.JS ---
        return {
            "status": "success",
            "coordinates": {"lat": lat, "lng": lng},
            "spatial_data": {
                "area_sqft": area_sqft,
                "annual_yield_gallons": annual_yield,
                "meets_100k_threshold": area_sqft > 100000
            },
            "cv_data": {
                "cooling_tower_present": cv_result.get('cooling_tower_present', False),
                "confidence_score": cv_result.get('confidence_score', 0.0)
            }
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Starts the server on http://localhost:8000
    uvicorn.run(app, host="0.0.0.0", port=8000)