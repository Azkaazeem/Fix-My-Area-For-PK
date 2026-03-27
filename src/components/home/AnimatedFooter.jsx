import { ArrowRight, HeartHandshake, Instagram, Linkedin, MapPinned, Twitter } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export const AnimatedFooter = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    if (!footerRef.current) return;
    const orbs = footerRef.current.querySelectorAll("[data-orb]");
    const cards = footerRef.current.querySelectorAll("[data-footer-card]");

    gsap.to(orbs, { y: "-=18", x: "+=10", duration: 3.6, repeat: -1, yoyo: true, stagger: 0.25, ease: "sine.inOut" });
    gsap.to(cards, { y: "-=12", duration: 2.8, repeat: -1, yoyo: true, stagger: 0.18, ease: "sine.inOut" });
  }, []);

  return (
    <footer ref={footerRef} className="section-shell relative overflow-hidden pb-12 pt-8 md:pb-16 md:pt-10">
      <div data-orb className="absolute left-8 top-8 h-28 w-28 rounded-full bg-primary/18 blur-3xl" />
      <div data-orb className="absolute right-10 top-20 h-36 w-36 rounded-full bg-secondary/14 blur-3xl" />
      <div data-orb className="absolute bottom-6 left-1/3 h-24 w-24 rounded-full bg-accent/16 blur-3xl" />
      <div className="glass-panel relative overflow-hidden rounded-[42px] p-8 sm:p-10 lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgb(var(--primary)_/_0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgb(var(--secondary)_/_0.16),_transparent_26%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary"><HeartHandshake className="mr-2 h-4 w-4" />A better way to raise local issues</div>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-text sm:text-5xl">Help your community report problems, build support, and push for action.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">From blocked roads to utility failures and emergency incidents, Fix My Area helps people report clearly and keep important issues in view.</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/report" className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-4 font-semibold text-white shadow-glow">Report a new issue<ArrowRight className="ml-2 h-5 w-5" /></Link>
              <Link to="/auth" className="inline-flex items-center justify-center rounded-full border border-border/20 bg-elevated/55 px-7 py-4 font-semibold text-text">Create your citizen profile</Link>
            </div>
          </div>
          <div className="relative min-h-[280px] [perspective:1200px]">
            <div data-footer-card className="absolute left-0 top-8 w-[58%] rounded-[28px] border border-border/15 bg-surface/45 p-5 shadow-2xl" style={{ transform: "translateZ(90px) rotate(-6deg)" }}>
              <p className="text-sm uppercase tracking-[0.28em] text-muted">Coverage</p>
              <p className="mt-4 inline-flex items-center text-lg font-semibold text-text"><MapPinned className="mr-2 h-5 w-5 text-primary" />Karachi, Lahore, Islamabad</p>
              <p className="mt-3 text-sm leading-7 text-muted">Designed for local reporting across major cities and growing communities.</p>
            </div>
            <div data-footer-card className="absolute right-0 top-0 w-[52%] rounded-[28px] border border-border/15 bg-elevated/60 p-5 shadow-2xl" style={{ transform: "translateZ(140px) rotate(8deg)" }}>
              <p className="text-sm uppercase tracking-[0.28em] text-muted">Follow along</p>
              <div className="mt-4 flex gap-3">{[Twitter, Instagram, Linkedin].map((Icon, index) => <button key={index} className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/15 bg-surface/60 text-muted transition hover:border-primary/30 hover:text-primary"><Icon className="h-5 w-5" /></button>)}</div>
              <p className="mt-3 text-sm leading-7 text-muted">Stay connected with civic updates, stories, and public action highlights.</p>
            </div>
            <div data-footer-card className="absolute bottom-0 left-[18%] w-[60%] rounded-[28px] border border-primary/20 bg-primary/10 p-5 shadow-2xl" style={{ transform: "translateZ(110px) rotate(-2deg)" }}>
              <p className="text-sm uppercase tracking-[0.28em] text-primary">Community support</p>
              <p className="mt-3 font-display text-3xl font-semibold text-text">18.6k active citizens</p>
              <p className="mt-2 text-sm leading-7 text-muted">More visibility and more support can help serious issues stay on the public radar.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
