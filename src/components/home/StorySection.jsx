import { Activity, AlertTriangle, ChartNoAxesCombined, ShieldAlert, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useGsapReveal } from "../../hooks/useGsapReveal";

const pillars = [
  { icon: ShieldAlert, title: "Faster emergency attention", description: "Critical reports are routed with higher urgency so dangerous issues can reach the right teams sooner." },
  { icon: ChartNoAxesCombined, title: "Smarter issue visibility", description: "Community support, time unresolved, and emergency status help important cases rise to the top." },
  { icon: Sparkles, title: "Clear public updates", description: "People can understand what is happening, what matters most, and where action is building." }
];

export const StorySection = () => {
  const ref = useGsapReveal();
  const deckRef = useRef(null);

  useEffect(() => {
    if (!deckRef.current) return;
    const cards = deckRef.current.querySelectorAll("[data-stack-card]");
    gsap.to(cards, {
      y: "-=16",
      rotate: (_, target) => Number(target.dataset.rotate ?? 0),
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      stagger: 0.18,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <section className="section-shell py-12 md:py-22">
      <div ref={ref} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div ref={deckRef} className="relative min-h-[460px] [perspective:1400px]">
          <div className="absolute left-12 top-10 h-40 w-40 rounded-full bg-primary/18 blur-3xl" />
          <div className="absolute bottom-8 right-10 h-36 w-36 rounded-full bg-accent/14 blur-3xl" />
          <div data-stack-card data-rotate="-4" className="absolute left-0 top-14 w-[72%] rounded-[34px] border border-primary/20 bg-elevated/75 p-6 shadow-2xl backdrop-blur-2xl" style={{ transform: "translateZ(80px) rotate(-6deg)" }}>
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex rounded-full bg-primary/12 px-3 py-1.5 text-xs font-semibold text-primary">Live dispatch</span>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Electric transformer alert</h3>
            <p className="mt-3 text-sm leading-7 text-muted">A high-risk report can be verified by nearby residents and pushed toward emergency response faster.</p>
          </div>
          <div data-stack-card data-rotate="3" className="absolute right-4 top-0 w-[52%] rounded-[30px] border border-secondary/20 bg-secondary/10 p-5 shadow-2xl backdrop-blur-2xl" style={{ transform: "translateZ(140px) rotate(8deg)" }}>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Hotspot map</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }).map((_, index) => (
                <div key={index} className={`h-10 rounded-2xl ${index % 3 === 0 ? "bg-danger/50" : index % 2 === 0 ? "bg-accent/40" : "bg-primary/30"}`} />
              ))}
            </div>
          </div>
          <div data-stack-card data-rotate="-2" className="absolute bottom-8 left-16 w-[58%] rounded-[30px] border border-white/10 bg-surface/75 p-5 shadow-2xl backdrop-blur-2xl" style={{ transform: "translateZ(110px) rotate(-3deg)" }}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/12 text-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Priority score</p>
                <p className="text-xs text-muted">Votes x 3 + unresolved time + emergency bonus</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-primary/10 p-3"><p className="text-xs text-muted">Votes</p><p className="mt-1 font-display text-2xl font-semibold">112</p></div>
              <div className="rounded-2xl bg-secondary/10 p-3"><p className="text-xs text-muted">Days</p><p className="mt-1 font-display text-2xl font-semibold">3</p></div>
              <div className="rounded-2xl bg-danger/10 p-3"><p className="text-xs text-muted">Bonus</p><p className="mt-1 font-display text-2xl font-semibold">45</p></div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 inline-flex rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Better reporting, clearer action
          </div>
          <h2 className="heading-lg text-balance">A reporting experience that helps people be heard faster</h2>
          <p className="mt-5 text-base leading-8 text-muted">Fix My Area makes it easier to report local problems, surface the most urgent cases, and keep communities informed as action builds.</p>
          <div className="mt-8 space-y-4">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-panel rounded-[28px] p-5 transition hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary"><Icon className="h-5 w-5" /></div>
                  <div><h3 className="font-display text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{description}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
