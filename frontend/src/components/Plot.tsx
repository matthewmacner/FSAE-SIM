// Wraps react-plotly with the basic distribution and our app theme.
// Using `plotly.js-basic-dist-min` keeps the bundle reasonable (~1 MB vs 4 MB
// for full plotly).

import Plotly from "plotly.js-basic-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Layout, Config, Data } from "plotly.js";

const Plot = createPlotlyComponent(Plotly);

export const PLOT_FONT = {
  family: "Inter, sans-serif",
  size: 11,
  color: "#334155", // slate-700, matches text-ink-1
};

export const baseLayout: Partial<Layout> = {
  paper_bgcolor: "#ffffff",
  plot_bgcolor: "#ffffff",
  font: PLOT_FONT,
  margin: { l: 55, r: 20, t: 20, b: 45 },
  xaxis: {
    gridcolor: "#e2e8f0", // slate-200
    zerolinecolor: "#94a3b8", // slate-400
    linecolor: "#cbd5e1", // slate-300
    tickfont: PLOT_FONT,
    title: { font: PLOT_FONT },
  },
  yaxis: {
    gridcolor: "#e2e8f0",
    zerolinecolor: "#94a3b8",
    linecolor: "#cbd5e1",
    tickfont: PLOT_FONT,
    title: { font: PLOT_FONT },
  },
  legend: { font: PLOT_FONT },
};

export const baseConfig: Partial<Config> = {
  displayModeBar: false,
  responsive: true,
};

// Theme-aligned chart series colors. Importing from here keeps every tab in
// sync if the palette ever changes again.
export const SERIES = {
  primary: "#0d9488", // teal-600
  warm: "#d97706", // amber-600
  blue: "#2563eb", // blue-600
  alert: "#dc2626", // red-600
  violet: "#7c3aed", // violet-600
  axis: "#94a3b8", // slate-400 — for baseline reference lines
};

interface Props {
  data: Data[];
  layout?: Partial<Layout>;
  className?: string;
}

export function ChartFrame({ data, layout, className }: Props) {
  const merged: Partial<Layout> = {
    ...baseLayout,
    ...layout,
    xaxis: { ...baseLayout.xaxis, ...(layout?.xaxis ?? {}) },
    yaxis: { ...baseLayout.yaxis, ...(layout?.yaxis ?? {}) },
  };
  return (
    <div className={className ?? "w-full h-full"}>
      <Plot
        data={data}
        layout={merged}
        config={baseConfig}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
