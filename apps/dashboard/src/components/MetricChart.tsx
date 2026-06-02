import { MetricPoint } from "@/src/types/dashboard";

interface MetricChartProps {
  title: string;
  points: MetricPoint[];
  color: string;
  unit: string;
}

export function MetricChart({ title, points, color, unit }: MetricChartProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">Live performance over the past hour</p>
        </div>
        <span className="rounded-full bg-slate-800/70 px-3 py-1 text-sm text-slate-300">{unit}</span>
      </div>
      <div className="mt-6 flex items-end gap-3 min-h-[180px]">
        {points.map((point) => {
          const height = Math.max((point.value / maxValue) * 100, 12);
          return (
            <div key={point.label} className="w-full text-center">
              <div className="mx-auto h-32 w-full max-w-[52px]">
                <div className="relative h-full w-full rounded-3xl bg-slate-950/90">
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-3xl ${color}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">{point.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
