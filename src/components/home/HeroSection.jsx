import { ArrowRight, Flame, MapPinHouse, ShieldCheck, Sparkles, Waves, Zap } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CITY_SIGNALS, HOME_STATS } from "../../data/issues";

const floatingCards = [
  {
    title: "Water leakage",
    subtitle: "Reported by nearby residents",
    icon: Waves,
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=900&q=80",
    className: "left-4 top-12"
  },
  {
    title: "Power outage",
    subtitle: "Utility complaint under review",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
    className: "right-0 top-8"
  },
  {
    title: "Fire emergency",
    subtitle: "Critical case flagged immediately",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=900&q=80",
    className: "right-10 bottom-16"
  }
];

export const HeroSection = () => {
  const stageRef = useRef(null);

  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;

    const mainImage = root.querySelector("[data-main-image]");
    const floating = root.querySelectorAll("[data-floating-card]");
    const chips = root.querySelectorAll("[data-chip]");
    const halos = root.querySelectorAll("[data-halo]");

    gsap.fromTo(mainImage, { opacity: 0, y: 36, rotateY: -14, rotateX: 8 }, { opacity: 1, y: 0, rotateY: -10, rotateX: 8, duration: 1.2, ease: "power3.out" });

    gsap.fromTo(
      floating,
      { opacity: 0, y: 42, scale: 0.9, rotateY: 18 },
      { opacity: 1, y: 0, scale: 1, rotateY: 0, duration: 1.05, stagger: 0.14, ease: "power3.out", delay: 0.2 }
    );

    gsap.to(floating, {
      y: "-=14",
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      stagger: 0.2,
      ease: "sine.inOut"
    });

    gsap.to(chips, {
      y: "-=10",
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      stagger: 0.18,
      ease: "sine.inOut"
    });

    gsap.to(halos, {
      rotate: 360,
      duration: 22,
      repeat: -1,
      ease: "none",
      stagger: 3
    });
  }, []);

  return (
    <section className="section-shell relative overflow-hidden py-16 pb-28 md:py-24 lg:py-28">
      <div className="absolute left-[-8%] top-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute right-[-4%] top-24 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="grid items-center gap-16 lg:grid-cols-[1.02fr_1fr] lg:gap-12">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs text-primary sm:text-sm">
            <ShieldCheck className="h-4 w-4" />
            Built for faster civic action across Pakistan
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[0.95] text-text sm:text-5xl lg:text-6xl xl:text-[4.9rem]">
            Report local area issues and push them toward real action.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Fix My Area is a modern civic platform where people can report water, gas, electricity, road, garbage, and emergency problems, gather community support, and track progress clearly.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link to="/report" className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:scale-[1.02]">
              Report an Issue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/auth" className="inline-flex items-center justify-center rounded-full border border-border/20 bg-elevated/55 px-8 py-4 text-base font-semibold text-text transition hover:border-primary/35">
              Join the movement
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HOME_STATS.map((item) => (
              <div key={item.label} className="glass-panel rounded-[28px] p-5">
                <p className="text-2xl font-display font-semibold sm:text-3xl">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.label}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-primary">{item.delta}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {CITY_SIGNALS.map((item) => (
              <div key={item.city} className="rounded-full border border-border/15 bg-elevated/45 px-4 py-3 text-sm">
                <span className="font-semibold text-text">{item.city}</span>
                <span className="mx-2 text-muted">•</span>
                <span className="text-muted">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={stageRef} className="relative flex min-h-[640px] items-center justify-center [perspective:1800px] lg:min-h-[760px]">
          <div className="absolute inset-0 rounded-full bg-primary/18 blur-3xl" />
          <div data-halo className="absolute h-[560px] w-[560px] rounded-full border border-primary/12" />
          <div data-halo className="absolute h-[430px] w-[430px] rounded-full border border-secondary/12" />

          <div data-chip className="absolute left-8 top-16 rounded-full border border-primary/20 bg-surface/60 px-4 py-2 text-sm text-text backdrop-blur-md">
            <Sparkles className="mr-2 inline h-4 w-4 text-primary" />
            Real issue reporting visuals
          </div>
          <div data-chip className="absolute right-4 bottom-20 rounded-full border border-danger/25 bg-danger/10 px-4 py-2 text-sm text-danger backdrop-blur-md">
            <Flame className="mr-2 inline h-4 w-4" />
            Emergency cases stay highlighted
          </div>
          <div data-chip className="absolute bottom-6 left-8 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-sm text-secondary backdrop-blur-md">
            <MapPinHouse className="mr-2 inline h-4 w-4" />
            Lahore, Karachi, Islamabad live
          </div>

          <div data-main-image className="relative h-[430px] w-[300px] overflow-hidden rounded-[40px] border border-white/15 bg-white/10 shadow-[0_40px_120px_rgba(25,111,217,0.3)] backdrop-blur-2xl" style={{ transform: "translateZ(120px) rotateY(-10deg) rotateX(8deg)", transformStyle: "preserve-3d" }}>
            <img src="https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1200&q=80" alt="Local road issue" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/15 to-transparent" />
            <div className="absolute inset-x-6 top-6 h-3 rounded-full bg-white/35" />
            <div className="absolute bottom-6 left-6 right-6 rounded-[26px] border border-white/15 bg-black/20 p-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.32em] text-white/75">Live report</p>
              <p className="mt-2 font-display text-2xl font-semibold text-white">Road damage in a busy area</p>
              <p className="mt-2 text-sm leading-6 text-white/80">A clearer way to show what is happening on the ground.</p>
            </div>
          </div>

          {floatingCards.map(({ title, subtitle, icon: Icon, image, className }) => (
            <div key={title} data-floating-card className={`absolute h-[180px] w-[210px] overflow-hidden rounded-[30px] border border-white/12 bg-white/10 shadow-2xl backdrop-blur-xl ${className}`} style={{ transformStyle: "preserve-3d" }}>
              <img src={image} alt={title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/95 via-surface/25 to-transparent" />
              <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md">
                <Icon className="h-5 w-5" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-lg font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm leading-5 text-white/80">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
