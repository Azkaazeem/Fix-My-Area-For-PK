import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

export const NavLink = ({ className, to, ...props }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        "rounded-full px-4 py-2 text-sm font-medium transition",
        isActive ? "bg-primary/15 text-primary shadow-glow" : "text-muted hover:bg-elevated/60 hover:text-text",
        className
      )}
      {...props}
    />
  );
};
