"use client";

import { Building2, MapPin } from "lucide-react";
import { useState } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export interface BuildingMarker {
  id: string;
  lat: number;
  long: number;
  label: string;
}

const mockDallasBuildings: BuildingMarker[] = [
  {
    id: "DAL-001",
    lat: 32.7845,
    long: -96.8068,
    label: "North Stemmons Distribution Campus",
  },
  {
    id: "DAL-002",
    lat: 32.7487,
    long: -96.8321,
    label: "Trinity Corridor Data Facility",
  },
  {
    id: "DAL-003",
    lat: 32.8124,
    long: -96.7642,
    label: "Mockingbird Industrial Plaza",
  },
];

type MapViewProps = {
  className?: string;
};

export function MapView({ className }: MapViewProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [selectedMarker, setSelectedMarker] = useState<BuildingMarker | null>(null);

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
    <div className={["h-full w-full", className].join(" ")}>
      <Map
        initialViewState={{
          latitude: 32.7767,
          longitude: -96.797,
          zoom: 10,
        }}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {mockDallasBuildings.map((building) => (
          <Marker key={building.id} latitude={building.lat} longitude={building.long} anchor="bottom">
            <button
              type="button"
              onClick={() => {
                console.log("Selected building:", building.id);
                setSelectedMarker(building);
              }}
              className="group rounded-full bg-cyan-700 p-2 text-white shadow-lg transition hover:bg-cyan-600"
              aria-label={building.label}
            >
              <MapPin className="h-4 w-4" />
            </button>
          </Marker>
        ))}

        {selectedMarker ? (
          <Popup
            latitude={selectedMarker.lat}
            longitude={selectedMarker.long}
            anchor="top"
            closeOnClick={false}
            onClose={() => setSelectedMarker(null)}
          >
            <div className="space-y-1 p-1">
              <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                <Building2 className="h-3.5 w-3.5" /> {selectedMarker.id}
              </p>
              <p className="text-xs text-slate-600">{selectedMarker.label}</p>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}