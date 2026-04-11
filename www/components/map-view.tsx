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

export function MapView({ className, onBuildingSelect }: MapViewProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [lastSelection, setLastSelection] = useState<BuildingSelection | null>(null);

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
        onClick={(event) => {
          const selection: BuildingSelection = {
            latitude: event.lngLat.lat,
            longitude: event.lngLat.lng,
          };

          console.log("Map click coordinates:", selection);
          setLastSelection(selection);
          onBuildingSelect?.(selection);
        }}
      >
        <NavigationControl position="top-right" />
      </Map>

      {lastSelection ? (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg">
          <p>Lat: {lastSelection.latitude.toFixed(6)}</p>
          <p>Lng: {lastSelection.longitude.toFixed(6)}</p>
        </div>
      ) : null}
    </div>
  );
}