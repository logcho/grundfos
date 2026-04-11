import os
import requests
import google.generativeai as genai
from PIL import Image
from io import BytesIO
import json
from dotenv import load_dotenv

load_dotenv()

def get_satellite_image(lat, lng, zoom=20, size="640x640"):
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
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    
    # We use Flash because it's incredibly fast for hackathon pipelines
    # We also enforce 'application/json' to ensure we can parse the output reliably
    model = genai.GenerativeModel(
        'gemini-1.5-flash', 
        generation_config={"response_mime_type": "application/json"}
    )
    
    system_prompt = """
    You are an expert industrial HVAC and satellite imagery inspector. 
    Analyze this satellite image of a commercial roof. Look for large industrial cooling towers 
    (often appearing as large circular fans, multi-cell rectangular units, or large heat exchangers on the roof).
    
    Return ONLY a valid JSON object with exactly these two keys:
    1. "cooling_tower_present": boolean (true if you clearly see them, false otherwise)
    2. "confidence_score": float between 0.0 and 1.0 representing your certainty.
    """
    
    # Send both the prompt and the image object to the model
    response = model.generate_content([system_prompt, image])
    
    return json.loads(response.text)

# --- Execute the Engine ---
if __name__ == "__main__":
    # Test coordinates: A large data center or industrial facility
    # Feel free to swap these out with a building in Dallas or Austin you want to test!
    TEST_LAT = 32.9602  # Example latitude (Dallas area)
    TEST_LNG = -96.8286 # Example longitude 
    
    print(f"1. Pinging Google Maps for satellite data at {TEST_LAT}, {TEST_LNG}...")
    try:
        roof_img = get_satellite_image(TEST_LAT, TEST_LNG)
        print("   Image retrieved successfully.")
        
        print("\n2. Passing image to Vision LLM for analysis...")
        result = detect_cooling_towers(roof_img)
        
        print("\n=== VIABILITY ENGINE: CV OUTPUT ===")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"\nError: {e}")