interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export const Logo = ({ variant = "dark", className = "" }: LogoProps) => {
  const stroke = variant === "light" ? "hsl(var(--surface-deep-foreground))" : "hsl(var(--foreground))";
  return (
    <a href="#top" className={`flex items-center gap-2.5 group ${className}`} aria-label="Sankhofa — Accueil">
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none" className="transition-transform duration-700 group-hover:-rotate-12">
        {/* Sankofa bird mark — head turned back */}
        <path
          d="M8 28 C 8 20, 14 14, 22 14 L 30 14 L 26 18 L 22 18 C 18 18, 14 22, 14 28 Z"
          fill="hsl(var(--accent))"
        />
        <circle cx="27" cy="16" r="1.2" fill={stroke} />
        <path d="M14 28 L 20 32 L 26 28" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      <span className="font-display text-lg tracking-tight" style={{ color: stroke }}>
        SANKHOFA
      </span>
    </a>
  );
};
