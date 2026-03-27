import clsx from "clsx";
import { CATEGORY_OPTIONS } from "../../data/issues";

export const CategoryPicker = ({ value, onChange, disabled = false }) => {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {CATEGORY_OPTIONS.map(({ id, icon: Icon, label, description, tone }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(id)}
          className={clsx(
            "group relative overflow-hidden rounded-[26px] border p-4 text-left transition duration-300",
            value === id ? "border-primary/55 bg-primary/10 shadow-glow" : "border-border/15 bg-surface/40 hover:-translate-y-1 hover:border-primary/25",
            tone === "emergency" && "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,_rgb(var(--danger)_/_0.16),_transparent_34%)]",
            disabled && "cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-border/15"
          )}
        >
          <div className="relative">
            <div className={clsx("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl", tone === "emergency" ? "bg-danger/12 text-danger" : "bg-primary/12 text-primary")}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="font-display text-lg font-semibold">{label}</h4>
              <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]", tone === "emergency" ? "bg-danger/10 text-danger" : "bg-secondary/12 text-secondary")}>
                {tone}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted">{description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
