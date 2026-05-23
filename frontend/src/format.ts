// Formatting helpers. Centralized so the units toggle has a single place to
// switch metric ↔ imperial.

import { useStore } from "./store";

const dash = "—";

function isNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

export const fmt = {
  pct: (v?: number, p = 1) => (isNum(v) ? `${v.toFixed(p)} %` : dash),
  deg_g: (v?: number, p = 2) => (isNum(v) ? `${v.toFixed(p)} °/g` : dash),
  g: (v?: number, p = 2) => (isNum(v) ? `${v.toFixed(p)} g` : dash),
  s: (v?: number, p = 2) => (isNum(v) ? `${v.toFixed(p)} s` : dash),
  hz: (v?: number, p = 2) => (isNum(v) ? `${v.toFixed(p)} Hz` : dash),
  num: (v?: number, p = 1) => (isNum(v) ? v.toFixed(p) : dash),
  N: (v?: number, p = 0) => (isNum(v) ? `${v.toFixed(p)} N` : dash),
  kj: (v?: number, p = 1) => (isNum(v) ? `${v.toFixed(p)} kJ` : dash),
  l: (v?: number, p = 2) => (isNum(v) ? `${v.toFixed(p)} L` : dash),
  kwh: (v?: number, p = 2) => (isNum(v) ? `${v.toFixed(p)} kWh` : dash),
};

// Speed and distance switch on the global units toggle.
export function useUnitFormatters() {
  const units = useStore((s) => s.units);
  return {
    speed: (v?: number, p = 1) => {
      if (!isNum(v)) return dash;
      if (units === "metric") return `${(v * 3.6).toFixed(p)} km/h`;
      return `${(v * 2.23694).toFixed(p)} mph`;
    },
    distance: (v?: number, p = 0) => {
      if (!isNum(v)) return dash;
      if (units === "metric") return `${v.toFixed(p)} m`;
      return `${(v * 3.28084).toFixed(p)} ft`;
    },
    mass: (v?: number, p = 0) => {
      if (!isNum(v)) return dash;
      if (units === "metric") return `${v.toFixed(p)} kg`;
      return `${(v * 2.20462).toFixed(p)} lb`;
    },
    units,
  };
}
