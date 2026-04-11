import os
import pandas as pd
import requests
import json
from PIL import Image
from io import BytesIO
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def get_satellite_image(lat, lng, zoom=17, size="640x640"):
    """
    Fetches the image and drops a red map pin EXACTLY on the target coordinate
    to act as a visual anchor for the AI.
    """
    maps_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not maps_key:
        raise ValueError("Missing GOOGLE_MAPS_API_KEY environment variable.")

    # Added the 'markers' parameter to place the red pin
    url = f"https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom={zoom}&size={size}&maptype=satellite&markers=color:red%7C{lat},{lng}&key={maps_key}"
    
    response = requests.get(url)
    if response.status_code == 200:
        return Image.open(BytesIO(response.content))
    else:
        raise Exception(f"Failed to fetch image. Status: {response.status_code}")

def detect_cooling_towers(image):
    """
    Instructs the LLM to only evaluate the building beneath the red pin.
    """
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    system_prompt = """
    You are an expert industrial HVAC and satellite imagery inspector. 
    Analyze this satellite image. There is a red map pin dropped on a specific commercial building.
    
    1. Locate the red pin.
    2. Focus ONLY on the single building footprint directly beneath the red pin. IGNORE all other neighboring buildings in the image.
    3. Look for large industrial cooling towers on that specific roof under the pin.
    
    Return ONLY a valid JSON object with exactly these two keys:
    1. "cooling_tower_present": boolean (true if you clearly see them on the pinned roof, false otherwise)
    2. "confidence_score": float between 0.0 and 1.0 representing your certainty.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[system_prompt, image],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1 # Keep temperature low for analytical tasks
        )
    )
    
    return json.loads(response.text)

if __name__ == "__main__":
    csv_filename = "dallas_target_buildings.csv"
    
    print(f"Loading target list from {csv_filename}...")
    try:
        df = pd.read_csv(csv_filename)
        # Grab the top 5 largest buildings
        df = df.sort_values(by='area_sqm', ascending=False).head(5)
        print(f"Scanning the top {len(df)} largest roofs for cooling towers...\n")
        
        results = []
        
        for index, row in df.iterrows():
            b_id = row['id']
            lat = row['latitude']
            lng = row['longitude']
            area = row['area_sqm']
            
            print(f"Target: {lat:.5f}, {lng:.5f} (Area: {area:,.0f} sqm)")
            
            try:
                roof_img = get_satellite_image(lat, lng)
                cv_result = detect_cooling_towers(roof_img)
                
                is_present = cv_result.get('cooling_tower_present', False)
                confidence = cv_result.get('confidence_score', 0.0)
                
                print(f"  -> Cooling Towers Detected: {is_present} (Confidence: {confidence})")
                
                results.append({
                    'id': b_id,
                    'latitude': lat,
                    'longitude': lng,
                    'cooling_towers': is_present,
                })
                
            except Exception as e:
                print(f"  -> Error processing building: {e}")
                
        print("\n=== PILLAR 1 COMPLETE ===")
            
    except Exception as e:
        print(f"Pipeline error: {e}")