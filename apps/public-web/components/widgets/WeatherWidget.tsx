"use client";
import { useEffect, useState } from "react";
import { feedService, CityWeather } from "@/services/feedService";
import { Sun, Cloud, CloudRain, Snowflake } from "lucide-react";

export function WeatherWidget() {
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [activeCityIndex, setActiveCityIndex] = useState(0);

  useEffect(() => {
    feedService.getWeatherSnapshot().then(setCities);
  }, []);

  if (cities.length === 0) return null;

  const current = cities[activeCityIndex];

  return (
    <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-muted-foreground border-l border-border pl-3">
      <div className="flex items-center gap-1.5 font-sans font-semibold text-foreground">
        {current.icon === "sun" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
        {current.icon === "cloud" && <Cloud className="h-3.5 w-3.5 text-slate-400" />}
        {current.icon === "rain" && <CloudRain className="h-3.5 w-3.5 text-blue-400" />}
        {current.icon === "snow" && <Snowflake className="h-3.5 w-3.5 text-cyan-300" />}
        <span>{current.city}</span>
        <span className="text-primary font-mono font-bold">{current.tempC}°C</span>
      </div>
      <button
        onClick={() => setActiveCityIndex((prev) => (prev + 1) % cities.length)}
        className="text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors underline font-mono ml-1"
        title="Switch city"
      >
        Next
      </button>
    </div>
  );
}
