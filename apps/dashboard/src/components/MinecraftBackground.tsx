// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";

export function MinecraftBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Array<{
      x: number; y: number; vx: number; vy: number; size: number;
      life: number; maxLife: number; type: "ember" | "portal" | "dust";
      hue: number;
    }> = [];
    let stars: Array<{ x: number; y: number; size: number; twinkleSpeed: number; twinklePhase: number }> = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.6,
        size: Math.random() * 1.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    function spawnParticle() {
      const types: Array<"ember" | "portal" | "dust"> = ["ember", "portal", "dust"];
      const weights = [0.4, 0.2, 0.4];
      const r = Math.random();
      let type: "ember" | "portal" | "dust" = "dust";
      let cum = 0;
      for (let i = 0; i < types.length; i++) {
        cum += weights[i];
        if (r <= cum) { type = types[i]; break; }
      }

      const base: any = {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 0.8 + 0.3),
        life: 0,
        maxLife: Math.random() * 400 + 200,
        type,
        hue: 0,
      };

      if (type === "ember") {
        base.size = Math.random() * 3 + 1;
        base.vy = -(Math.random() * 0.4 + 0.15);
        base.vx = (Math.random() - 0.5) * 0.3;
        base.hue = 10 + Math.random() * 20;
      } else if (type === "portal") {
        base.size = Math.random() * 4 + 2;
        base.vy = -(Math.random() * 0.3 + 0.1);
        base.vx = (Math.random() - 0.5) * 0.8;
        base.hue = 270 + Math.random() * 30;
      } else {
        base.size = Math.random() * 2 + 1;
        base.vy = -(Math.random() * 0.2 + 0.05);
        base.hue = 40 + Math.random() * 20;
      }

      particles.push(base);
      if (particles.length > 150) particles.shift();
    }

    let particleSpawnTimer = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, "#070714");
      skyGrad.addColorStop(0.2, "#0a0a20");
      skyGrad.addColorStop(0.4, "#0f0f30");
      skyGrad.addColorStop(0.6, "#151525");
      skyGrad.addColorStop(0.8, "#0a0a18");
      skyGrad.addColorStop(1, "#050510");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        const alpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(Date.now() * star.twinkleSpeed + star.twinklePhase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,240,${alpha})`;
        ctx.fill();
      });

      // Draw moon
      const moonX = canvas.width * 0.85;
      const moonY = canvas.height * 0.08;
      const moonR = Math.min(canvas.width, canvas.height) * 0.035;

      // Moon glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 4);
      moonGlow.addColorStop(0, "rgba(218,165,32,0.08)");
      moonGlow.addColorStop(1, "transparent");
      ctx.fillStyle = moonGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moon body
      const moonGrad = ctx.createRadialGradient(
        moonX - moonR * 0.3, moonY - moonR * 0.3, 0,
        moonX, moonY, moonR
      );
      moonGrad.addColorStop(0, "#f5e68c");
      moonGrad.addColorStop(0.6, "#daa520");
      moonGrad.addColorStop(1, "#8b6914");
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = moonGrad;
      ctx.fill();

      // Moon craters
      ctx.beginPath();
      ctx.arc(moonX - moonR * 0.2, moonY - moonR * 0.15, moonR * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139,105,20,0.2)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(moonX + moonR * 0.15, moonY + moonR * 0.2, moonR * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139,105,20,0.15)";
      ctx.fill();

      // Draw mountains
      const mountainData = [
        { color: "#0a0a1e", points: [
          [0, 1], [0.05, 0.55], [0.1, 0.6], [0.15, 0.45], [0.22, 0.5],
          [0.28, 0.35], [0.35, 0.42], [0.4, 0.28], [0.48, 0.38],
          [0.55, 0.22], [0.62, 0.32], [0.68, 0.18], [0.75, 0.28],
          [0.82, 0.12], [0.88, 0.22], [0.95, 0.08], [1, 0.15], [1, 1],
        ]},
        { color: "#0c0c22", points: [
          [0, 1], [0.03, 0.65], [0.08, 0.7], [0.12, 0.55], [0.18, 0.6],
          [0.22, 0.48], [0.28, 0.55], [0.32, 0.4], [0.38, 0.5],
          [0.42, 0.35], [0.48, 0.45], [0.52, 0.3], [0.58, 0.4],
          [0.62, 0.25], [0.68, 0.35], [0.72, 0.2], [0.78, 0.3],
          [0.82, 0.15], [0.88, 0.25], [0.92, 0.1], [0.96, 0.2],
          [1, 0.12], [1, 1],
        ]},
        { color: "#0e0e28", points: [
          [0, 1], [0.06, 0.72], [0.1, 0.78], [0.16, 0.65],
          [0.23, 0.7], [0.3, 0.58], [0.38, 0.65], [0.45, 0.52],
          [0.53, 0.6], [0.6, 0.48], [0.68, 0.55], [0.75, 0.42],
          [0.82, 0.5], [0.88, 0.38], [0.95, 0.45], [1, 0.35], [1, 1],
        ]},
      ];

      const h = canvas.height;
      const w = canvas.width;

      mountainData.forEach((mountain) => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        mountain.points.forEach(([px, py]) => {
          ctx.lineTo(px * w, py * h);
        });
        ctx.closePath();
        ctx.fillStyle = mountain.color;
        ctx.fill();
      });

      // Draw ground
      const groundY = h * 0.88;
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
      groundGrad.addColorStop(0, "rgba(59,38,18,0.5)");
      groundGrad.addColorStop(0.3, "rgba(40,25,12,0.7)");
      groundGrad.addColorStop(1, "rgba(20,12,6,0.9)");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Grass line
      const grassY = groundY;
      for (let i = 0; i < w; i += 4) {
        const gH = 3 + Math.sin(i * 0.1 + Date.now() * 0.0003) * 1.5;
        ctx.fillStyle = `rgba(91,135,49,${0.15 + Math.sin(i * 0.2 + Date.now() * 0.0005) * 0.05})`;
        ctx.fillRect(i, grassY - gH, 2, gH);
      }

      // Draw particles
      particles.forEach((p, i) => {
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.02) * 0.1;
        p.y += p.vy;
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : 1;

        if (p.type === "ember") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.5 + 0.5 * (1 - lifeRatio * 0.5)), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${alpha * 0.6})`;
          ctx.fill();
          // Glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${alpha * 0.1})`;
          ctx.fill();
        } else if (p.type === "portal") {
          p.x += Math.sin(p.life * 0.05) * 1;
          p.y += Math.cos(p.life * 0.03) * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.8 + 0.4 * Math.sin(p.life * 0.1)), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha * 0.5})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha * 0.08})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(40, 20%, 70%, ${alpha * 0.3})`;
          ctx.fill();
        }

        if (p.life >= p.maxLife || p.y < -20) {
          particles.splice(i, 1);
        }
      });

      // Spawn new particles
      particleSpawnTimer++;
      if (particleSpawnTimer % 3 === 0 && particles.length < 100) {
        spawnParticle();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1]"
      style={{ pointerEvents: "none" }}
    />
  );
}
