"use client";

import { useEffect, useRef, useState } from "react";
import Map, { NavigationControl, Marker, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Building } from "@/app/page";

type MapViewProps = {
  buildings: Building[];
  activeBuildingId: string | null;
  onScanBuilding: (id: string) => void;
  className?: string;
};

function EngineResultsCard({ data, onClose }: { data: Building; onClose: () => void }) {
  if (!data.spatial_data || !data.cv_data) return null;

  const isViable = data.status === "Viable";

  return (
    <div className="absolute right-4 top-4 z-10 w-80 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/85 text-slate-100 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3">
          <h3 className="font-semibold tracking-wide text-white">Viability Engine</h3>
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

export function MapView({ buildings, activeBuildingId, onScanBuilding, className }: MapViewProps) {
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapRef = useRef<MapRef>(null);

  // Auto-fly to the active building when it changes
  useEffect(() => {
    if (activeBuildingId && mapRef.current) {
      const activeBuilding = buildings.find(b => b.id === activeBuildingId);
      if (activeBuilding) {
        mapRef.current.flyTo({
          center: [activeBuilding.longitude, activeBuilding.latitude],
          zoom: 18, // Zoom in tight to see the target roof precisely
          duration: 1500,
          essential: true
        });
      }
    }
  }, [activeBuildingId, buildings]);

  if (!mapboxToken) {
    return (
      <div className={["flex h-full w-full items-center justify-center rounded-[inherit] border border-amber-300 bg-amber-50 p-6", className].join(" ")}>
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
    <div className={["relative h-full w-full rounded-[inherit]", className].join(" ")}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: 32.756,
          longitude: -96.864,
          zoom: 12,
        }}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {(() => {
          const activeBuilding = buildings.find(b => b.id === activeBuildingId);
          const showCard = activeBuilding && activeBuilding.spatial_data && activeBuilding.cv_data && hiddenCardId !== activeBuilding.id;
          
          return showCard ? (
            <EngineResultsCard 
              data={activeBuilding} 
              onClose={() => setHiddenCardId(activeBuilding.id)} 
            />
          ) : null;
        })()}

        {buildings.map(b => {
          const isActive = b.id === activeBuildingId;
          
          let color = "#94a3b8"; // Base slate-400
          if (b.status === "Scanning") color = "#fbbf24"; // amber-400
          else if (b.status === "Viable") color = "#10b981"; // emerald-500
          else if (b.status === "Rejected") color = "#94a3b8"; // stay slate 

          // Highlighting overrides
          if (isActive && b.status === "Pending") color = "#06b6d4"; // cyan-500

          return (
            <Marker 
              key={b.id} 
              latitude={b.latitude} 
              longitude={b.longitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onScanBuilding(b.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className={`relative flex h-8 w-8 items-center justify-center -translate-y-1/2`}>
                <div className={`absolute h-4 w-4 rounded-full border-[3px] border-white shadow-lg transition-all duration-300 ${isActive ? 'scale-150 ring-[6px] ring-black/20' : 'hover:scale-125 hover:ring-4 hover:ring-black/10'}`} style={{ backgroundColor: color }} />
                {b.status === "Scanning" && (
                  <div className="absolute h-8 w-8 animate-ping rounded-full opacity-75" style={{ backgroundColor: color }} />
                )}
              </div>
            </Marker>
          )
        })}
      </Map>
    </div>
  );
}