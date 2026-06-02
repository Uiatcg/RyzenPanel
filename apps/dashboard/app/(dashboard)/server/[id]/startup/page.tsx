"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Settings, Save } from "lucide-react";

export default function StartupPage() {
  const params = useParams();
  const [server, setServer] = useState<any>(null);
  const [startup, setStartup] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/servers/${params.id}`).then(r => r.json()).then(d => {
      setServer(d);
      setStartup(d.startup || "java -Xms${RAM}M -Xmx${RAM}M -jar ${SERVER_JARFILE}");
    });
  }, [params.id]);

  async function handleSave() {
    await fetch(`/api/servers/${params.id}/startup`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startup }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!server) return <div className="skeleton h-64" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Settings size={18} className="text-ryzen-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Startup Command</h3>
            <p className="text-xs text-slate-500">Configure how your server starts</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400">Docker Image</label>
            <input value={server.dockerImage} readOnly className="input-field mt-1.5 text-xs font-mono" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400">Startup Command</label>
            <textarea value={startup} onChange={e => setStartup(e.target.value)}
              className="input-field mt-1.5 font-mono text-xs h-24" />
          </div>

          <div className="rounded-xl bg-slate-800/30 p-4">
            <p className="text-xs font-medium text-slate-400 mb-2">Available Variables</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {["${RAM}", "${CPU}", "${DISK}", "${SERVER_JARFILE}", "${SERVER_PORT}", "${SERVER_IP}"].map(v => (
                <code key={v} className="rounded bg-slate-900 px-2 py-1 text-ryzen-400">{v}</code>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary">
            <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
