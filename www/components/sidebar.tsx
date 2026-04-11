import { Building2, Compass, MapPinned } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-full border-r border-slate-200 bg-white/95 p-5 backdrop-blur lg:w-72">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-slate-900 p-2 text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">RainUSE Nexus</p>
          <h1 className="text-lg font-semibold text-slate-900">Control Panel</h1>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <MapPinned className="h-4 w-4" />
          State / City
        </div>
        <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200">
          <option>All Regions</option>
          <option>Dallas, TX</option>
          <option>San Jose, CA</option>
          <option>Phoenix, AZ</option>
          <option>Chicago, IL</option>
        </select>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
          <Compass className="h-4 w-4" />
          Apply Region Focus
        </button>
      </section>
    </aside>
  );
}