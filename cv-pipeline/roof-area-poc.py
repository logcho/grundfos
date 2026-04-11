import os
import requests
import json
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

def get_satellite_image(lat, lng, zoom=17, size="640x640"):
    """
    Fetches a high-res satellite image from Google Maps Static API.
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

def get_building_insights(lat, lng):
    """
    Pings the Google Solar API to find the closest building to the coordinates
    and extracts its physical dimensions.
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise ValueError("Missing GOOGLE_MAPS_API_KEY environment variable.")

    # The buildingInsights endpoint finds the nearest building footprint to the lat/lng
    url = f"https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude={lat}&location.longitude={lng}&requiredQuality=HIGH&key={api_key}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        raise Exception("No building found at these coordinates. Try adjusting the pin.")
    else:
        raise Exception(f"API Error {response.status_code}: {response.text}")

def calculate_rainwater_yield(area_sqft, annual_rainfall_inches):
    """
    Calculates the annual rainwater yield based on the industry standard formula.
    Using your benchmark: 10,000 sqft * 10 inches = ~60,000 gallons.
    This implies a runoff coefficient of roughly 0.6 to 0.623 (Standard is 0.623 gallons per inch per sqft).
    """
    # 1 sq ft of water 1 inch deep = 0.623 gallons
    # We multiply by a 0.95 efficiency factor since roofs aren't perfectly efficient
    efficiency_factor = 0.95 
    gallons = area_sqft * annual_rainfall_inches * 0.623 * efficiency_factor
    return round(gallons)

# --- Execute the Engine ---
if __name__ == "__main__":
    # Let's test the massive CyrusOne facility in Carrollton, TX
    TEST_LAT = 32.9919  
    TEST_LNG = -96.9305 
    
    # Assume Dallas average rainfall for the yield calculation
    DALLAS_RAINFALL = 34.0 
    
    print(f"1. Pinging Google Maps for satellite data at {TEST_LAT}, {TEST_LNG}...")
    try:
        roof_img = get_satellite_image(TEST_LAT, TEST_LNG)
        print("   Image retrieved successfully.")
        
        # ---> ADD THIS LINE TO VIEW THE IMAGE <---
        print("   Opening image in default viewer...")
        roof_img.show() 
        
        print(f"\n2. Pinging Google Solar API for building at {TEST_LAT}, {TEST_LNG}...")
        insights = get_building_insights(TEST_LAT, TEST_LNG)
        
        # Navigate the JSON to find the whole roof stats
        # The API returns area in square meters
        area_meters = insights.get('solarPotential', {}).get('wholeRoofStats', {}).get('areaMeters2', 0)
        
        # Convert square meters to square feet (1 sq m = 10.7639 sq ft)
        area_sqft = round(area_meters * 10.7639)
        
        print("\n=== VIABILITY ENGINE: SPATIAL OUTPUT ===")
        print(f"Roof Area (Sq Meters): {area_meters}")
        print(f"Roof Area (Sq Feet):   {area_sqft:,} sq ft")
        
        # Check against your >100,000 sq ft Hackathon constraint
        is_target = area_sqft > 100000
        print(f"Meets >100k Target?:   {is_target}")
        
        # Calculate the Yield
        annual_yield = calculate_rainwater_yield(area_sqft, DALLAS_RAINFALL)
        print(f"Est. Annual Yield:     {annual_yield:,} gallons/year")
        
    except Exception as e:
        print(f"\nError: {e}")