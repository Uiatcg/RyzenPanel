import { ServerCardData } from "@/src/types/dashboard";

interface ServerCardProps {
  server: ServerCardData;
}

export function ServerCard({ server }: ServerCardProps) {
  const statusStyles: Record<string, string> = {
    online: "bg-emerald-400/10 text-emerald-300 border-emerald-500/30",
    offline: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    maintenance: "bg-amber-400/10 text-amber-300 border-amber-500/30",
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{server.ip}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{server.name}</h2>
          <p className="mt-2 text-slate-400">{server.node} · {server.disk} MB disk</p>
        </div>
        <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${statusStyles[server.status]}`}>
          {server.status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-950/80 p-4">
          <p className="text-sm text-slate-400">CPU</p>
          <p className="mt-2 text-xl font-semibold text-white">{server.cpu}%</p>
        </div>
        <div className="rounded-3xl bg-slate-950/80 p-4">
          <p className="text-sm text-slate-400">RAM</p>
          <p className="mt-2 text-xl font-semibold text-white">{server.ram} MB</p>
        </div>
        <div className="rounded-3xl bg-slate-950/80 p-4">
          <p className="text-sm text-slate-400">Disk</p>
          <p className="mt-2 text-xl font-semibold text-white">{server.disk} MB</p>
        </div>
      </div>
    </div>
  );
}
