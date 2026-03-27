import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { THEME_PRESETS } from "../data/themes";
import { hexToRgb } from "../utils/theme";

const DEFAULT_THEME = {
  mode: "dark",
  presetId: "civic-blue"
};

const STORAGE_KEY = "fix-my-area-theme";
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_THEME;
  });

  useEffect(() => {
    const preset = THEME_PRESETS.find((item) => item.id === settings.presetId) ?? THEME_PRESETS[0];
    const root = document.documentElement;
    const primary = settings.customPrimary ?? preset.palette.primary;
    const modeTokens =
      settings.mode === "light"
        ? {
            surface: "244 248 255",
            elevated: "255 255 255",
            border: "148 163 184",
            text: "10 22 41",
            muted: "82 104 132",
            success: "22 163 74",
            danger: "220 38 38",
            backdrop: "232 241 249",
            glowAmbient: "255 255 255"
          }
        : {
            surface: "4 12 26",
            elevated: "10 22 42",
            border: "118 148 189",
            text: "238 247 255",
            muted: "160 181 206",
            success: "74 222 128",
            danger: "248 113 113",
            backdrop: "2 8 18",
            glowAmbient: "12 17 32"
          };

    root.classList.toggle("light", settings.mode === "light");
    root.style.setProperty("--surface", modeTokens.surface);
    root.style.setProperty("--elevated", modeTokens.elevated);
    root.style.setProperty("--border", modeTokens.border);
    root.style.setProperty("--text", modeTokens.text);
    root.style.setProperty("--muted", modeTokens.muted);
    root.style.setProperty("--primary", hexToRgb(primary));
    root.style.setProperty("--secondary", hexToRgb(preset.palette.secondary));
    root.style.setProperty("--accent", hexToRgb(preset.palette.accent));
    root.style.setProperty("--success", modeTokens.success);
    root.style.setProperty("--danger", modeTokens.danger);
    root.style.setProperty("--backdrop", modeTokens.backdrop);
    root.style.setProperty("--glow", hexToRgb(preset.palette.glow));
    root.style.setProperty("--glow-ambient", modeTokens.glowAmbient);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      setMode: (mode) => setSettings((current) => ({ ...current, mode })),
      setPreset: (presetId) => setSettings((current) => ({ ...current, presetId, customPrimary: undefined })),
      setCustomPrimary: (hex) => setSettings((current) => ({ ...current, customPrimary: hex }))
    }),
    [settings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider.");
  return context;
};
