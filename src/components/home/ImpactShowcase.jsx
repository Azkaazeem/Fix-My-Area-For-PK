import { Building2, Gauge, ShieldAlert, Users } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useGsapReveal } from "../../hooks/useGsapReveal";

const highlights = [
  { title: "Automatic priority handling", description: "Urgent reports can be surfaced without asking people to guess severity levels themselves.", icon: Gauge, value: "Realtime" },
  { title: "Stronger local visibility", description: "When more people support the same issue, it becomes harder to ignore and easier to act on.", icon: Building2, value: "42 Cities" },
  { title: "Safer citizen privacy", description: "Protected contact flows help people share reports without exposing sensitive personal details publicly.", icon: ShieldAlert, value: "Private" },
  { title: "Community participation", description: "Upvotes and public attention help serious local problems stay visible until progress happens.", icon: Users, value: "18.6k" }
];

export const ImpactShowcase = () => {
  const ref = useGsapReveal();
  const statsRef = useRef(null);

  useEffect(() => {
    if (!statsRef.current) return;
    const bars = statsRef.current.querySelectorAll("[data-bar]");
    gsap.fromTo(bars, { scaleY: 0.35, transformOrigin: "bottom" }, { scaleY: 1, stagger: 0.08, duration: 1.1, ease: "power3.out" });
    gsap.to(bars, { y: "-=10", duration: 2.4, yoyo: true, repeat: -1, stagger: 0.1, ease: "sine.inOut" });
  }, []);

  return (
    <section className="section-shell py-14 md:py-24">
      <div ref={ref} className="grid gap-8 lg:grid-cols-[1fr_1.04fr] lg:items-center">
        <div className="relative min-h-[440px] [perspective:1400px]">
          <div className="absolute left-4 top-8 h-44 w-44 rounded-full bg-primary/18 blur-3xl" />
          <div className="absolute bottom-8 right-6 h-40 w-40 rounded-full bg-secondary/14 blur-3xl" />
          <div className="absolute left-0 top-8 w-[76%] rounded-[34px] border border-primary/20 bg-elevated/70 p-6 shadow-2xl backdrop-blur-2xl" style={{ transform: "translateZ(80px) rotate(-5deg)" }}>
            <p className="text-sm uppercase tracking-[0.28em] text-primary">Confidence in reporting</p>
            <p className="mt-4 font-display text-6xl font-semibold">91%</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-muted">People can understand what happens next after they submit a report, which builds trust in the platform.</p>
          </div>
          <div ref={statsRef} className="absolute bottom-0 right-0 w-[62%] rounded-[34px] border border-white/10 bg-surface/75 p-6 shadow-2xl backdrop-blur-2xl" style={{ transform: "translateZ(130px) rotate(7deg)" }}>
            <p className="text-sm uppercase tracking-[0.28em] text-secondary">Public momentum</p>
            <div className="mt-6 flex h-44 items-end gap-3">
              {[42, 76, 58, 88, 66, 104, 82].map((height, index) => (
                <div key={index} data-bar className="flex-1 rounded-t-[18px] bg-gradient-to-t from-primary via-secondary to-accent" style={{ height }} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">Visible activity helps people see where support is growing and which issues need attention most.</p>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-secondary">Why it matters</p>
          <h2 className="heading-lg mt-4">Built to help local problems get noticed, supported, and tracked</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted">From faster visibility to safer reporting, every part of the experience is designed to help people raise issues clearly and follow progress with confidence.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {highlights.map(({ title, description, icon: Icon, value }, index) => (
              <div key={title} className="glass-panel rounded-[32px] p-6 sm:p-7" style={{ transform: `translateY(${index % 2 === 0 ? 0 : 18}px)` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/12 text-primary"><Icon className="h-6 w-6" /></div>
                  <span className="rounded-full border border-border/15 bg-surface/45 px-3 py-1.5 text-xs font-semibold text-muted">{value}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold text-text">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
