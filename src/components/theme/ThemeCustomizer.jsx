import { Check, MoonStar, Palette, SunMedium, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { THEME_PRESETS } from "../../data/themes";
import { useTheme } from "../../providers/ThemeProvider";

export const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, setMode, setPreset, setCustomPrimary } = useTheme();
  const activeId = settings.presetId;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="glass-panel mb-4 w-[340px] rounded-[30px] p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Theme Customizer</h3>
                <p className="text-sm text-muted">Tune the civic mood in real time.</p>
              </div>
              <button onClick={() => setMode(settings.mode === "dark" ? "light" : "dark")} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/20 bg-surface/70">
                {settings.mode === "dark" ? <SunMedium className="h-5 w-5 text-accent" /> : <MoonStar className="h-5 w-5 text-primary" />}
              </button>
            </div>

            <div className="mb-4 rounded-[24px] border border-border/15 bg-surface/35 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Soft 3D + glass layers</p>
                  <p className="text-xs leading-6 text-muted">Color tokens update the whole experience, not just buttons.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setPreset(preset.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${activeId === preset.id ? "border-primary/45 bg-primary/10" : "border-border/15 bg-surface/45 hover:border-primary/20"}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-semibold">{preset.name}</span>
                    <div className="flex gap-2">
                      {Object.values(preset.palette).map((color) => (
                        <span key={color} className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted">{preset.description}</p>
                    {activeId === preset.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                </button>
              ))}
            </div>

            <label className="mt-4 block rounded-2xl border border-border/15 bg-surface/40 p-4">
              <span className="mb-2 block text-sm font-medium text-muted">Custom primary glow</span>
              <input type="color" defaultValue="#3b82f6" onChange={(event) => setCustomPrimary(event.target.value)} className="h-12 w-full cursor-pointer rounded-xl border-0 bg-transparent" />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen((current) => !current)} className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-elevated/75 text-primary shadow-glow backdrop-blur-xl transition hover:scale-105">
        <Palette className="h-7 w-7" />
      </button>
    </div>
  );
};
