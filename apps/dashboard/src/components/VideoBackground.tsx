"use client";

import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  videoUrl?: string;
  posterUrl?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function VideoBackground({
  videoUrl,
  posterUrl,
  overlayOpacity = 0.6,
  children,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {videoUrl ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 video-fallback-bg" />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90"
        style={{ opacity: overlayOpacity }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
