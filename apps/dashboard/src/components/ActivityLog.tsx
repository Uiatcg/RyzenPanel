import { ActivityItem } from "@/src/types/dashboard";

interface ActivityLogProps {
  items: ActivityItem[];
}

export function ActivityLog({ items }: ActivityLogProps) {
  const statusStyles: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-300",
    warning: "bg-amber-500/10 text-amber-300",
    error: "bg-rose-500/10 text-rose-300",
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Activity log</h3>
          <p className="mt-1 text-sm text-slate-400">Recent panel and server events</p>
        </div>
        <span className="rounded-full bg-slate-800/80 px-3 py-1 text-sm text-slate-300">Latest</span>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
            </div>
            <div className="flex items-center gap-3 sm:text-right">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[item.status]}`}>{item.status}</span>
              <p className="text-sm text-slate-500">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
