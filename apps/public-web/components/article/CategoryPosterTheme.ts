import {
  Trophy,
  Globe,
  TrendingUp,
  Cpu,
  Zap,
  Flame,
  Newspaper,
  LucideIcon,
} from "lucide-react";

export interface PosterTheme {
  categoryKey: string;
  categoryLabel: string;
  icon: LucideIcon;
  ribbonBgHex: string;
  accentColorHex: string;
  borderColorClass: string;
  vignetteGradientClass: string;
  badgeTextColor: string;
}

export const CATEGORY_POSTER_THEMES: Record<string, PosterTheme> = {
  sports: {
    categoryKey: "sports",
    categoryLabel: "SPORTS",
    icon: Trophy,
    ribbonBgHex: "#990028",
    accentColorHex: "#E50914",
    borderColorClass: "border-red-600/60",
    vignetteGradientClass: "from-[#590014]/90 via-black/85 to-[#260008]",
    badgeTextColor: "text-red-400",
  },
  world: {
    categoryKey: "world",
    categoryLabel: "WORLD",
    icon: Globe,
    ribbonBgHex: "#0F4C81",
    accentColorHex: "#2563EB",
    borderColorClass: "border-blue-500/60",
    vignetteGradientClass: "from-[#0A2540]/90 via-black/85 to-[#030D1A]",
    badgeTextColor: "text-blue-400",
  },
  business: {
    categoryKey: "business",
    categoryLabel: "BUSINESS",
    icon: TrendingUp,
    ribbonBgHex: "#046A38",
    accentColorHex: "#059669",
    borderColorClass: "border-emerald-500/60",
    vignetteGradientClass: "from-[#033A1F]/90 via-black/85 to-[#01170C]",
    badgeTextColor: "text-emerald-400",
  },
  technology: {
    categoryKey: "technology",
    categoryLabel: "TECHNOLOGY",
    icon: Cpu,
    ribbonBgHex: "#6B21A8",
    accentColorHex: "#9333EA",
    borderColorClass: "border-purple-500/60",
    vignetteGradientClass: "from-[#3B0764]/90 via-black/85 to-[#19022C]",
    badgeTextColor: "text-purple-400",
  },
  science: {
    categoryKey: "science",
    categoryLabel: "SCIENCE",
    icon: Zap,
    ribbonBgHex: "#0891B2",
    accentColorHex: "#0891B2",
    borderColorClass: "border-cyan-500/60",
    vignetteGradientClass: "from-[#0E4A56]/90 via-black/85 to-[#041A1F]",
    badgeTextColor: "text-cyan-400",
  },
  politics: {
    categoryKey: "politics",
    categoryLabel: "POLITICS",
    icon: Flame,
    ribbonBgHex: "#B45309",
    accentColorHex: "#D97706",
    borderColorClass: "border-amber-500/60",
    vignetteGradientClass: "from-[#5C2304]/90 via-black/85 to-[#240D01]",
    badgeTextColor: "text-amber-400",
  },
};

export function getPosterTheme(category?: string): PosterTheme {
  const key = (category || "").toLowerCase().trim();
  if (CATEGORY_POSTER_THEMES[key]) {
    return CATEGORY_POSTER_THEMES[key];
  }
  return {
    categoryKey: key || "news",
    categoryLabel: (category || "BREAKING").toUpperCase(),
    icon: Newspaper,
    ribbonBgHex: "#990028",
    accentColorHex: "#E50914",
    borderColorClass: "border-red-600/60",
    vignetteGradientClass: "from-[#590014]/90 via-black/85 to-[#260008]",
    badgeTextColor: "text-red-400",
  };
}
