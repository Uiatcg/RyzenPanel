import { NotificationItem } from "@/src/types/dashboard";

interface NotificationsPanelProps {
  notifications: NotificationItem[];
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const severityStyles: Record<string, string> = {
    info: "bg-slate-800 text-slate-100",
    warning: "bg-amber-500/10 text-amber-300",
    critical: "bg-rose-500/10 text-rose-300",
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <p className="mt-1 text-sm text-slate-400">System alerts and server updates</p>
        </div>
        <span className="rounded-full bg-slate-800/80 px-3 py-1 text-sm text-slate-300">{notifications.length} unread</span>
      </div>
      <div className="mt-6 space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className={`rounded-3xl border border-slate-800 p-4 ${severityStyles[notification.severity]}`}>
            <p className="text-sm font-semibold text-white">{notification.title}</p>
            <p className="mt-2 text-sm text-slate-300">{notification.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">{notification.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
