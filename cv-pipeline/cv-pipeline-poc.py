import os
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()

def get_building_insights(lat, lng):
    """
    Pings the Google Solar API to find the closest building footprint.
    """
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise ValueError("Missing GOOGLE_MAPS_API_KEY environment variable.")

    url = f"https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude={lat}&location.longitude={lng}&requiredQuality=HIGH&key={api_key}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        return None # Return None if Google hasn't mapped this specific roof yet
    else:
        raise Exception(f"API Error {response.status_code}: {response.text}")

def calculate_rainwater_yield(area_sqft, annual_rainfall_inches):
    """
    Calculates yield based on industry standard: 1 sqft * 1 inch = 0.623 gallons.
    Includes a 0.95 efficiency factor.
    """
    efficiency_factor = 0.95 
    gallons = area_sqft * annual_rainfall_inches * 0.623 * efficiency_factor
    return round(gallons)

if __name__ == "__main__":
    csv_filename = "dallas_target_buildings.csv"
    DALLAS_RAINFALL = 34.0 
    
    print(f"Loading target list from {csv_filename}...")
    try:
        # Load the CSV and grab the top 5 largest buildings
        df = pd.read_csv(csv_filename)
        df = df.sort_values(by='area_sqm', ascending=False).head(5)
        
        print(f"Validating the top {len(df)} largest buildings against Google Solar API...\n")
        print("-" * 60)
        
        for index, row in df.iterrows():
            b_id = row['id']
            lat = row['latitude']
            lng = row['longitude']
            overture_area_sqm = row['area_sqm']
            
            print(f"Target Lat/Lng: {lat:.5f}, {lng:.5f}")
            print(f"Overture Est. Area: {overture_area_sqm:,.0f} sqm")
            
            try:
                insights = get_building_insights(lat, lng)
                
                if insights:
                    # Extract Google's highly accurate measurement
                    google_area_sqm = insights.get('solarPotential', {}).get('wholeRoofStats', {}).get('areaMeters2', 0)
                    
                    if google_area_sqm > 0:
                        # Convert to SqFt and calculate yield
                        google_area_sqft = round(google_area_sqm * 10.7639)
                        annual_yield = calculate_rainwater_yield(google_area_sqft, DALLAS_RAINFALL)
                        
                        # Calculate the difference between Overture and Google
                        diff_percent = ((google_area_sqm - overture_area_sqm) / overture_area_sqm) * 100
                        
                        print(f"Google Solar Area:  {google_area_sqm:,.0f} sqm ({diff_percent:+.1f}% vs Overture)")
                        print(f"Usable Roof Space:  {google_area_sqft:,.0f} sq ft")
                        print(f"Est. Annual Yield:  {annual_yield:,.0f} gallons/year")
                    else:
                        print("Google Solar Area:  Data returned, but roof size is 0.")
                else:
                    print("Google Solar Area:  [No high-res 3D data available for this specific coordinate]")
                    
            except Exception as e:
                print(f"Error fetching Solar data: {e}")
                
            print("-" * 60)
            
    except Exception as e:
        print(f"Pipeline error: {e}")