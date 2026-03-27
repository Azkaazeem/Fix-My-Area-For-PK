import { MapPinned, Menu, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { NavLink } from "./NavLink";

export const AppShell = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-border/10 bg-surface/55 backdrop-blur-xl">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <NavLink to="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 shadow-glow">
              <MapPinned className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Fix My Area</p>
              <p className="text-xs text-muted">Pakistan&apos;s civic action network</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-3 md:flex">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/report">Report</NavLink>
            <NavLink to="/my-reports">My Reports</NavLink>
            <NavLink to="/all-reports">All Reports</NavLink>
            <NavLink to="/auth">Account</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-full border border-border/20 bg-elevated/70 px-4 py-2 text-sm text-muted transition hover:border-primary/40 hover:text-text md:inline-flex">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Live civic stats
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/15 bg-elevated/60 text-text md:hidden"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="border-t border-border/10 bg-surface/85 px-4 pb-4 pt-3 backdrop-blur-xl md:hidden"
            >
              <div className="section-shell flex flex-col gap-3 px-0">
                <NavLink to="/" className="w-full rounded-2xl bg-elevated/50 px-4 py-3 text-left">Home</NavLink>
                <NavLink to="/report" className="w-full rounded-2xl bg-elevated/50 px-4 py-3 text-left">Report</NavLink>
                <NavLink to="/my-reports" className="w-full rounded-2xl bg-elevated/50 px-4 py-3 text-left">My Reports</NavLink>
                <NavLink to="/all-reports" className="w-full rounded-2xl bg-elevated/50 px-4 py-3 text-left">All Reports</NavLink>
                <NavLink to="/auth" className="w-full rounded-2xl bg-elevated/50 px-4 py-3 text-left">Account</NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};
