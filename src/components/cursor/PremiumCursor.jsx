import { useEffect, useMemo, useRef, useState } from "react";

const PARTICLE_COLORS = [
  "rgb(var(--primary) / 0.45)",
  "rgb(var(--secondary) / 0.35)",
  "rgb(255 255 255 / 0.55)"
];

const MAX_PARTICLES = 8;

export const PremiumCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [particles, setParticles] = useState([]);
  const pointRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const auraRef = useRef(null);
  const coreRef = useRef(null);
  const rafRef = useRef(null);
  const lastEmitRef = useRef(0);
  const particleIdRef = useRef(0);

  const supportsFinePointer = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
    []
  );

  useEffect(() => {
    if (!supportsFinePointer) return;

    setEnabled(true);
    document.body.classList.add("has-premium-cursor");

    const tick = () => {
      const point = pointRef.current;
      const target = targetRef.current;
      point.x += (target.x - point.x) * 0.22;
      point.y += (target.y - point.y) * 0.22;

      const deltaX = target.x - point.x;
      const deltaY = target.y - point.y;
      const velocity = Math.min(Math.hypot(deltaX, deltaY), 16);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const stretchX = 1 + velocity / 70;
      const stretchY = Math.max(0.94, 1 - velocity / 100);

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) rotate(${angle}deg) scale(${stretchX}, ${stretchY})`;
      }

      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    const handleMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY };

      const now = performance.now();
      if (now - lastEmitRef.current < 80) return;
      lastEmitRef.current = now;

      const created = {
        id: particleIdRef.current++,
        x: event.clientX + (Math.random() * 4 - 2),
        y: event.clientY + (Math.random() * 4 - 2),
        size: 1.2 + Math.random() * 1.8,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.7,
        speed: 0.35 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 0.5,
        life: 1,
        hue: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
      };

      setParticles((current) => [created, ...current].slice(0, MAX_PARTICLES));
    };

    const handleLeave = () => setParticles([]);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseout", handleLeave);

    return () => {
      document.body.classList.remove("has-premium-cursor");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", handleLeave);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [supportsFinePointer]);

  useEffect(() => {
    if (!enabled) return;

    let animationFrame = 0;
    const animateParticles = () => {
      setParticles((current) =>
        current
          .map((particle) => ({
            ...particle,
            x: particle.x + Math.cos(particle.angle) * particle.speed + particle.drift,
            y: particle.y + Math.sin(particle.angle) * particle.speed + 0.7,
            life: particle.life - 0.08,
            size: particle.size * 0.97
          }))
          .filter((particle) => particle.life > 0.04)
      );

      animationFrame = window.requestAnimationFrame(animateParticles);
    };

    animationFrame = window.requestAnimationFrame(animateParticles);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden md:block" aria-hidden="true">
      <div ref={auraRef} className="premium-cursor-aura" />
      <div ref={coreRef} className="premium-cursor-core" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="premium-cursor-particle"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.life,
            background: particle.hue,
            transform: `translate3d(-50%, -50%, 0) scale(${0.75 + particle.life * 0.3})`
          }}
        />
      ))}
    </div>
  );
};

