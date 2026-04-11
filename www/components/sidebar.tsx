import { Building } from "@/app/page";
import { Building2, Compass, MapPinned, Zap, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useEffect, useRef } from "react";

type SidebarProps = {
  buildings: Building[];
  activeBuildingId: string | null;
  onScanBuilding: (id: string) => void;
};

export function Sidebar({ buildings, activeBuildingId, onScanBuilding }: SidebarProps) {
  // Simple auto-scroll ref so the active card scrolls into view
  const activeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeBuildingId]);

  return (
    <aside className="flex h-[50dvh] lg:h-full w-full flex-col border-t lg:border-t-0 lg:border-r border-slate-200 bg-white/95 p-0 backdrop-blur lg:w-[420px] shrink-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-xl order-2 lg:order-1">
      <div className="p-6 pb-4 flex items-center gap-3 shrink-0 border-b border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-10 bg-white">
        <div className="rounded-xl bg-cyan-900 p-2.5 text-cyan-100 shadow-inner">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700">RainUSE Nexus Tracker</p>
          <h1 className="text-xl font-bold text-slate-900">Target Prospects</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-3 relative">
        {/* Draw a subtle dashed track line similar to the delivery tracking inspiration */}
        <div className="absolute left-8 top-8 bottom-8 w-px border-l-2 border-dashed border-slate-200 z-0" />

        {buildings.map((b) => {
          const isActive = b.id === activeBuildingId;
          const isScanning = b.status === "Scanning";
          const isViable = b.status === "Viable";
          const isRejected = b.status === "Rejected";

          return (
            <div
              key={b.id}
              ref={isActive ? activeCardRef : null}
              onClick={() => onScanBuilding(b.id)}
              className={`relative z-10 group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ml-8 ${isActive ? 'border-cyan-400 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-cyan-400 bg-white scale-[1.02]'
                : 'border-slate-200 bg-white/80 hover:bg-white hover:border-cyan-300 hover:shadow-sm'
                }`}
            >
              {/* Connector Dot */}
              <div className={`absolute -left-10 top-6 h-3 w-3 rounded-full border-2 border-white ring-4 transition-colors ${
                isActive && b.status === "Pending" ? 'bg-cyan-500 ring-cyan-100' : 
                isViable ? 'bg-emerald-500 ring-emerald-100' :
                isRejected ? 'bg-rose-400 ring-rose-100' :
                isScanning ? 'bg-amber-400 ring-amber-100' :
                'bg-slate-300 ring-slate-100 group-hover:bg-cyan-300'
              }`} />

              {/* Card Header & Status */}
              <div className="flex items-center justify-between border-b border-slate-50/80 p-4 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight">Dallas, TX 75001 Target</h3>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5 opacity-70">UUID: {b.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${isScanning ? 'bg-amber-100 text-amber-700 animate-pulse ring-1 ring-amber-200' :
                  isViable ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' :
                    isRejected ? 'bg-slate-100 text-slate-500' :
                      'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  }`}>
                  {isScanning && <Zap className="h-3 w-3" />}
                  {isViable && <CheckCircle2 className="h-3 w-3" />}
                  {isRejected && <XCircle className="h-3 w-3" />}
                  {b.status === "Pending" && <Clock className="h-3 w-3" />}
                  {b.status === "Scanning" ? "Assessing" : b.status}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 pt-3 flex flex-wrap gap-4 items-center bg-white relative">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400 font-bold mb-1">Overture Footprint</p>
                  <p className="text-sm font-bold text-slate-700">
                    {Math.round(b.area_sqm * 10.7639).toLocaleString()} <span className="text-[10px] font-medium text-slate-400">sqft</span>
                  </p>
                </div>

                {b.spatial_data && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-slate-500 font-bold mb-1">Usable Roof Space</p>
                    <p className="text-sm font-bold text-slate-800">
                      {b.spatial_data.area_sqft.toLocaleString()} <span className="text-[10px] font-medium text-slate-400">sqft</span>
                    </p>
                  </div>
                )}

                <div className="text-right ml-auto">
                  <p className={`text-[9px] uppercase tracking-[0.1em] font-bold mb-1 ${b.spatial_data ? 'text-cyan-600' : 'text-slate-400'}`}>
                    Est. Yield
                  </p>
                  <p className={`text-sm font-bold ${b.spatial_data ? 'text-slate-800' : 'text-slate-300'}`}>
                    {b.spatial_data ? `${b.spatial_data.annual_yield_gallons.toLocaleString()}` : "---"} <span className="text-[10px] font-medium text-slate-400">gal/yr</span>
                  </p>
                </div>
              </div>

              {/* Cooling Tower Presence (only if scanned) */}
              {b.cv_data && (
                <div className={`px-4 py-2 text-[10px] font-bold tracking-wide uppercase flex justify-between items-center ${b.cv_data.cooling_tower_present ? 'bg-emerald-50 text-emerald-700 border-t border-emerald-100' : 'bg-slate-50 text-slate-500 border-t border-slate-100'
                  }`}>
                  <span>Cooling Towers required for Make-Up?</span>
                  <span>{b.cv_data.cooling_tower_present ? "Yes Detected" : "None Detected"}</span>
                </div>
              )}

              {/* Progress Bar visual */}
              <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${b.status === "Pending" ? "w-0" :
                  b.status === "Scanning" ? "w-1/2 bg-amber-400" :
                    isViable ? "w-full inset-0 bg-emerald-500" : "w-[98%] bg-slate-400 rounded-r-full"
                  }`} />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}