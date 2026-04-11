import { Globe } from "lucide-react";
import { MapView, type BuildingSelection } from "@/components/map-view";

type MapPlaceholderProps = {
  onBuildingSelect?: (selection: BuildingSelection) => void;
};

export function MapPlaceholder({ onBuildingSelect }: MapPlaceholderProps) {
  return (
    <section className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),transparent_45%),linear-gradient(160deg,#f8fafc_20%,#e2e8f0_90%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Macro View</p>
            <h2 className="text-lg font-semibold text-slate-900">Target Region Intelligence Map</h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white/80 p-2 text-slate-700">
            <Globe className="h-5 w-5" />
          </div>
        </div>

        <div className="relative flex flex-1 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white/70">
          <MapView onBuildingSelect={onBuildingSelect} />
        </div>
      </div>
    </section>
  );
}