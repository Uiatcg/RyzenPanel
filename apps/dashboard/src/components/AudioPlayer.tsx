"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

export function AudioPlayer() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (d.audioEnabled && d.audioUrl) {
          setEnabled(true);
          setAudioUrl(d.audioUrl);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!enabled || !audioRef.current) return;
    audioRef.current.volume = 0.3;
    audioRef.current.play().catch(() => {});
  }, [enabled, audioUrl]);

  if (!enabled || !audioUrl) return null;

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop preload="auto" muted={muted} />
      <div className="fixed bottom-8 right-4 z-40">
        {showControls ? (
          <div className="flex items-center gap-1 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/30 px-3 py-2 ryzen-glow-sm">
            <Music size={14} className="text-ryzen-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 mr-1">Now Playing</span>
            <button onClick={() => setMuted(!muted)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800/50 hover:text-ryzen-400 transition-colors"
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button onClick={() => setShowControls(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          </div>
        ) : (
          <button onClick={() => setShowControls(true)}
            className="h-10 w-10 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/30 flex items-center justify-center text-ryzen-400 hover:bg-slate-800/50 transition-colors ryzen-glow-sm"
          >
            <Music size={16} className="animate-pulse" />
          </button>
        )}
      </div>
    </>
  );
}
