"use client";

import { MapPlaceholder } from "@/components/map-placeholder";
import { Sidebar } from "@/components/sidebar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(155deg,#f8fafc_0%,#e2e8f0_100%)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white/90 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Grundfos Sales Intelligence</p>
              <h2 className="text-xl font-semibold text-slate-900">The RainUSE Nexus Map View</h2>
            </div>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-900">
              Map-First Mode
            </span>
          </div>

          <div className="h-[calc(100vh-7.5rem)] min-h-[520px]">
            <MapPlaceholder />
          </div>
        </main>
      </div>
    </div>
  );
}
