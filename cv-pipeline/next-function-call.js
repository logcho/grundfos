// Inside your Next.js Mapbox onClick handler
async function handleMapClick(e) {
    const { lng, lat } = e.lngLat;

    // Set UI to loading state...

    try {
        const response = await fetch(`http://localhost:8000/api/analyze?lat=${lat}&lng=${lng}`);
        const data = await response.json();

        if (data.status === "success") {
            console.log("Engine Results:", data);
            // Update your React state to show the dashboard!
            // setBuildingStats(data);
        }
    } catch (error) {
        console.error("Failed to reach Viability Engine:", error);
    }
}