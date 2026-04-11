import overturemaps
import geopandas as gpd

def get_large_commercial_buildings(bbox, min_sq_meters=9290):
    """
    Downloads building footprints from Overture Maps within a bounding box,
    filtering for those larger than the minimum square meter threshold (9290 sqm = ~100k sqft).
    """
    print(f"1. Querying Overture Maps database for bounding box: {bbox}...")
    
    # Pull the building data as a GeoDataFrame
    # This downloads the geometry directly from their AWS/GCP buckets
    gdf = overturemaps.core.geodataframe("building", bbox=bbox)
    
    print(f"2. Downloaded {len(gdf)} total buildings in this area.")
    
    # ---> ADD THIS LINE: Tell Python the raw data is in Lat/Long (EPSG:4326)
    if gdf.crs is None:
        gdf = gdf.set_crs("EPSG:4326")
    
    # Calculate the area of each building polygon in square meters
    # We project to a local CRS (EPSG:3857) to get accurate meter measurements
    gdf_projected = gdf.to_crs(epsg=3857)
    gdf['area_sqm'] = gdf_projected.geometry.area
    
    # Filter for the massive roofs
    target_buildings = gdf[gdf['area_sqm'] >= min_sq_meters].copy()
    
    # Extract the center point (centroid) lat/long for our Gemini CV script
    target_buildings['longitude'] = target_buildings.geometry.centroid.x
    target_buildings['latitude'] = target_buildings.geometry.centroid.y
    
    print(f"3. Found {len(target_buildings)} buildings over {min_sq_meters} sq meters.")
    return target_buildings

if __name__ == "__main__":
    # Bounding box for an industrial area in Dallas (West Dallas/Irving)
    # Format: (west, south, east, north)
    DFW_INDUSTRIAL_BBOX = (-96.95, 32.75, -96.85, 32.85)
    
    try:
        targets = get_large_commercial_buildings(DFW_INDUSTRIAL_BBOX)
        
        # Save the targets to a CSV so your CV script can loop through them
        output_file = "dallas_target_buildings.csv"
        
        # Keep only the columns we need for the next step
        export_df = targets[['id', 'latitude', 'longitude', 'area_sqm']]
        export_df.to_csv(output_file, index=False)
        
        print(f"\nSuccess! Target list saved to {output_file}")
        print(export_df.head())
        
    except Exception as e:
        print(f"\nError pulling Overture data: {e}")