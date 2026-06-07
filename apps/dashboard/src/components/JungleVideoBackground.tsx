"use client";

import { useEffect, useRef, useState } from "react";

interface JungleVideoBackgroundProps {
  videoUrl?: string;
  imageUrl?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function JungleVideoBackground({
  videoUrl,
  imageUrl,
  overlayOpacity = 0.6,
  children,
}: JungleVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      videoRef.current.oncanplay = () => setReady(true);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {!ready && imageUrl && (
            <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </>
      ) : imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 jungle-bg" />
      )}

      {/* Multi-layer overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(11,15,12,0.7)] via-[rgba(11,15,12,0.4)] to-[rgba(11,15,12,0.85)]" style={{ opacity: overlayOpacity }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(19,32,24,0.5)] via-transparent to-[rgba(11,15,12,0.3)]" />

      {/* Atmospheric fog effect */}
      <div className="absolute inset-0 fog-layer opacity-30" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
