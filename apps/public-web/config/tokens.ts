/**
 * Centralized Edition TV Design Tokens System
 * Standards: Apple / Linear / Vercel design quality
 */

export const designTokens = {
  colors: {
    // OKLCH / HSL Semantic Mapping
    background: "var(--background)",
    foreground: "var(--foreground)",
    card: "var(--card)",
    cardForeground: "var(--card-foreground)",
    popover: "var(--popover)",
    popoverForeground: "var(--popover-foreground)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    secondary: "var(--secondary)",
    secondaryForeground: "var(--secondary-foreground)",
    muted: "var(--muted)",
    mutedForeground: "var(--muted-foreground)",
    accent: "var(--accent)",
    accentForeground: "var(--accent-foreground)",
    destructive: "var(--destructive)",
    destructiveForeground: "var(--destructive-foreground)",
    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",

    // Specialized Domain Colors
    editorial: {
      accent: "oklch(0.55 0.22 27)", // Deep Crimson
      subtle: "oklch(0.96 0.02 27)",
      border: "oklch(0.85 0.06 27)",
    },
    ai: {
      gradientStart: "oklch(0.62 0.26 295)", // Violet-Purple
      gradientEnd: "oklch(0.68 0.21 230)",   // Cyan-Blue
      pulse: "oklch(0.75 0.18 280)",
    },
    news: {
      breaking: "oklch(0.58 0.24 25)",       // Alert Red
      live: "oklch(0.64 0.20 140)",          // Emerald Live Green
      exclusive: "oklch(0.72 0.19 75)",      // Amber Gold
    },
  },
  typography: {
    fontSans: "var(--font-geist-sans), var(--font-inter), system-ui, sans-serif",
    fontMono: "var(--font-geist-mono), monospace",
    fontSerif: "var(--font-newsreader), Georgia, serif",
  },
  spacing: {
    xs: "0.25rem",  // 4px
    sm: "0.5rem",   // 8px
    md: "1rem",     // 16px
    lg: "1.5rem",  // 24px
    xl: "2rem",     // 32px
    "2xl": "3rem",    // 48px
    "3xl": "4rem",    // 64px
  },
  borderRadius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
    full: "9999px",
  },
  animations: {
    durationFast: "150ms",
    durationNormal: "250ms",
    durationSlow: "400ms",
    easeSpring: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeSmooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};
