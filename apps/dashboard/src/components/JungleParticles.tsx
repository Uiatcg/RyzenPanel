"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: "leaf" | "firefly" | "bird";
}

export function JungleParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      p.push({
        id: i,
        x: Math.random() * 100,
        y: -5 - Math.random() * 10,
        size: 8 + Math.random() * 8,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 15,
        type: "leaf",
      });
    }
    for (let i = 0; i < 12; i++) {
      p.push({
        id: 100 + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 8,
        type: "firefly",
      });
    }
    for (let i = 0; i < 3; i++) {
      p.push({
        id: 200 + i,
        x: -10,
        y: 5 + Math.random() * 25,
        size: 16,
        duration: 20 + Math.random() * 15,
        delay: i * 12 + Math.random() * 10,
        type: "bird",
      });
    }
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {particles.map(p => {
        if (p.type === "leaf") {
          return (
            <div
              key={p.id}
              className="jungle-leaf"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          );
        }
        if (p.type === "firefly") {
          return (
            <div
              key={p.id}
              className="firefly-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                animation: `firefly${p.id % 2 === 0 ? "" : "-2"} ${p.duration}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          );
        }
        return (
          <div
            key={p.id}
            className="bird"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            🐦
          </div>
        );
      })}
    </div>
  );
}
