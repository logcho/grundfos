import os
import requests
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import json
from dotenv import load_dotenv

load_dotenv()

def get_satellite_image(lat, lng, zoom=17, size="640x640"):
    """
    Fetches a high-res satellite image from Google Maps Static API.
    Zoom level 20 is typically perfect for resolving roof details.
    """
    maps_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not maps_key:
        raise ValueError("Missing GOOGLE_MAPS_API_KEY environment variable.")

    url = f"https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom={zoom}&size={size}&maptype=satellite&key={maps_key}"
    
    response = requests.get(url)
    if response.status_code == 200:
        # Load the image into memory using Pillow
        return Image.open(BytesIO(response.content))
    else:
        raise Exception(f"Failed to fetch image. Status: {response.status_code}, Body: {response.text}")

def detect_cooling_towers(image):
    """
    Passes the image to the Vision LLM and forces a strict JSON response.
    """
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    system_prompt = """
    You are an expert industrial HVAC and satellite imagery inspector. 
    Analyze this satellite image of a commercial roof. Look for large industrial cooling towers 
    (often appearing as large circular fans, multi-cell rectangular units, or large heat exchangers on the roof).
    
    Return ONLY a valid JSON object with exactly these two keys:
    1. "cooling_tower_present": boolean (true if you clearly see them, false otherwise)
    2. "confidence_score": float between 0.0 and 1.0 representing your certainty.
    """
    
    # Send both the prompt and the image object to the model
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[system_prompt, image],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    return json.loads(response.text)

# --- Execute the Engine ---
if __name__ == "__main__":
    # Test coordinates: A large data center or industrial facility
    TEST_LAT = 32.9919  
    TEST_LNG = -96.9305

    print(f"1. Pinging Google Maps for satellite data at {TEST_LAT}, {TEST_LNG}...")
    try:
        roof_img = get_satellite_image(TEST_LAT, TEST_LNG)
        print("   Image retrieved successfully.")
        
        # ---> ADD THIS LINE TO VIEW THE IMAGE <---
        print("   Opening image in default viewer...")
        roof_img.show() 
        
        print("\n2. Passing image to Vision LLM for analysis...")
        result = detect_cooling_towers(roof_img)
        
        print("\n=== VIABILITY ENGINE: CV OUTPUT ===")
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(f"\nError: {e}")