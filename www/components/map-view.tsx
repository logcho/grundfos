"use client";

import { useState } from "react";
import Map, { NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export interface BuildingSelection {
  latitude: number;
  longitude: number;
}

type MapViewProps = {
  className?: string;
  onBuildingSelect?: (selection: BuildingSelection) => void;
};

function EngineResultsCard({ data, onClose }: { data: any; onClose: () => void }) {
  if (!data) return null;

  const isViable =
    data.spatial_data.meets_100k_threshold && data.cv_data.cooling_tower_present;

  return (
    <div className="absolute right-4 top-4 z-10 w-80 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/85 text-slate-100 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3">
          <h3 className="font-semibold text-white tracking-wide">Viability Engine</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-1 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4 p-4">
          {/* Spatial Data */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Roof Insights (Google Solar)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <p className="text-[10px] text-slate-400">Usable Area</p>
                <p className="text-sm font-semibold text-cyan-400">
                  {data.spatial_data.area_sqft.toLocaleString()} <span className="text-[10px] font-normal">sqft</span>
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <p className="text-[10px] text-slate-400">Est. Yield</p>
                <p className="text-sm font-semibold text-blue-400">
                  {data.spatial_data.annual_yield_gallons.toLocaleString()} <span className="text-[10px] font-normal">gal</span>
                </p>
              </div>
            </div>
          </div>

          {/* CV Data */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              HVAC Vision (Gemini 2.5)
            </p>
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div>
                <p className="text-xs font-medium text-slate-200">Cooling Towers</p>
                <p className="text-[10px] text-slate-500">Confidence: {(data.cv_data.confidence_score * 100).toFixed(1)}%</p>
              </div>
              {data.cv_data.cooling_tower_present ? (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400 ring-1 ring-emerald-500/30">
                  DETECTED
                </span>
              ) : (
                <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold tracking-wider text-rose-400 ring-1 ring-rose-500/30">
                  NONE
                </span>
              )}
            </div>
          </div>

          {/* Verdict */}
          <div className={`mt-2 rounded-xl p-3 text-center transition-all ${isViable ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/50' : 'bg-white/5'}`}>
            <p className={`text-sm font-bold ${isViable ? 'text-cyan-300 drop-shadow-sm' : 'text-slate-500'}`}>
              {isViable ? "★ High Viability Target" : "Does Not Meet Criteria"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inside your Next.js Mapbox onClick handler
async function handleMapClick(e: { lngLat: { lng: any; lat: any; }; }) {
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

export function MapView({ className, onBuildingSelect }: MapViewProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [lastSelection, setLastSelection] = useState<BuildingSelection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [engineResults, setEngineResults] = useState<any>(null);

  if (!mapboxToken) {
    return (
      <div className={["flex h-full w-full items-center justify-center rounded-xl border border-amber-300 bg-amber-50 p-6", className].join(" ")}>
        <div className="max-w-sm text-center">
          <p className="text-sm font-semibold text-amber-900">Mapbox token is missing</p>
          <p className="mt-1 text-sm text-amber-800">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file to enable the interactive map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={["relative h-full w-full", className].join(" ")}>
      <Map
        initialViewState={{
          latitude: 32.7767,
          longitude: -96.797,
          zoom: 10,
        }}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
        onClick={async (event) => {
          const lat = event.lngLat.lat;
          const lng = event.lngLat.lng;

          const selection: BuildingSelection = {
            latitude: lat,
            longitude: lng,
          };

          console.log("Map click coordinates:", selection);
          setLastSelection(selection);
          onBuildingSelect?.(selection);

          setIsLoading(true);
          try {
            const response = await fetch(`http://localhost:8000/api/analyze?lat=${lat}&lng=${lng}`);
            const data = await response.json();

            if (data.status === "success") {
              console.log("Engine Results:", data);
              setEngineResults(data);
              // Update your React state to show the dashboard!
              // e.g. onEngineResult?.(data);
            }
          } catch (error) {
            console.error("Failed to reach Viability Engine:", error);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <NavigationControl position="top-right" />
      </Map>

      {engineResults && (
        <EngineResultsCard data={engineResults} onClose={() => setEngineResults(null)} />
      )}

      {lastSelection ? (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg">
          <p>Lat: {lastSelection.latitude.toFixed(6)}</p>
          <p>Lng: {lastSelection.longitude.toFixed(6)}</p>
          {isLoading && <p className="mt-1 text-amber-400 font-semibold tracking-wide">Analyzing building...</p>}
        </div>
      ) : null}
    </div>
  );
}