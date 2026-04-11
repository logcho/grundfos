import { Globe } from "lucide-react";
import { Building } from "@/app/page";
import { MapView } from "@/components/map-view";

type MapPlaceholderProps = {
  buildings: Building[];
  activeBuildingId: string | null;
  onScanBuilding: (id: string) => void;
};

export function MapPlaceholder({ buildings, activeBuildingId, onScanBuilding }: MapPlaceholderProps) {
  return (
    <div className="relative h-full w-full bg-slate-100 overflow-hidden rounded-[inherit]">
      {/* We removed the white paddings to let the map bleed to the edges, creating a vastly superior UX! */}
      <MapView 
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        onScanBuilding={onScanBuilding}
      />
      
      {/* Subtle overlay HUD element */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center justify-between gap-4">
        <div className="rounded-xl border border-white/40 bg-white/70 px-4 py-3 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 drop-shadow-sm">Macro View</p>
          <h2 className="text-sm font-bold text-slate-900 drop-shadow-sm">Dallas Regional Intelligence Layer</h2>
        </div>
      </div>
    </div>
  );
}