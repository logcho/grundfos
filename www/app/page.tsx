"use client";

import { useState } from "react";
import { MapPlaceholder } from "@/components/map-placeholder";
import { Sidebar } from "@/components/sidebar";
import buildingsData from "../data/buildings.json";

export type Building = {
  id: string;
  latitude: number;
  longitude: number;
  area_sqm: number;
  status: "Pending" | "Scanning" | "Viable" | "Rejected";
  spatial_data?: {
    area_sqft: number;
    annual_yield_gallons: number;
    meets_100k_threshold: boolean;
  } | null;
  cv_data?: {
    cooling_tower_present: boolean;
    confidence_score: number;
  } | null;
};

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>(buildingsData as Building[]);
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);

  // We expose a unified handler: click map or click sidebar card triggers this.
  async function handleBuildingScan(id: string) {
    const building = buildings.find((b) => b.id === id);
    if (!building) return;

    setActiveBuildingId(id);
    
    // Prevent re-scanning if already viable/rejected, unless forced
    if (building.status !== "Pending" && building.status !== "Rejected") return;

    // Mark as scanning
    setBuildings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Scanning" } : b)));
    
    try {
      const response = await fetch(`http://localhost:8000/api/analyze?lat=${building.latitude}&lng=${building.longitude}`);
      const data = await response.json();

      if (data.status === "success") {
        const isViable = data.spatial_data.meets_100k_threshold && data.cv_data.cooling_tower_present;
        setBuildings((prev) => prev.map((b) => (b.id === id ? { 
          ...b, 
          status: isViable ? "Viable" : "Rejected",
          spatial_data: data.spatial_data,
          cv_data: data.cv_data,
        } : b)));
      } else {
        setBuildings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Pending" } : b)));
      }
    } catch (error) {
      console.error("Engine fetch failed:", error);
      setBuildings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Pending" } : b)));
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(155deg,#f8fafc_0%,#e2e8f0_100%)]">
      <div className="flex h-screen flex-col lg:flex-row">
        <Sidebar 
          buildings={buildings}
          activeBuildingId={activeBuildingId}
          onScanBuilding={handleBuildingScan}
        />

        <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col pt-safe">
          <div className="mb-4 flex shrink-0 items-center justify-between rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Grundfos Intelligence</p>
              <h2 className="text-xl font-semibold text-slate-900">Rainwater Yield Tracker</h2>
            </div>
            <span className="hidden sm:inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-900 border border-cyan-200/50 shadow-inner">
              Viability Validation Map
            </span>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <MapPlaceholder 
              buildings={buildings}
              activeBuildingId={activeBuildingId}
              onScanBuilding={handleBuildingScan}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
