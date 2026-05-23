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
  color: "#c7d0db",
};

export const baseLayout: Partial<Layout> = {
  paper_bgcolor: "#141a22",
  plot_bgcolor: "#141a22",
  font: PLOT_FONT,
  margin: { l: 55, r: 20, t: 20, b: 45 },
  xaxis: {
    gridcolor: "#2a3441",
    zerolinecolor: "#5b6573",
    linecolor: "#2a3441",
    tickfont: PLOT_FONT,
    title: { font: PLOT_FONT },
  },
  yaxis: {
    gridcolor: "#2a3441",
    zerolinecolor: "#5b6573",
    linecolor: "#2a3441",
    tickfont: PLOT_FONT,
    title: { font: PLOT_FONT },
  },
  legend: { font: PLOT_FONT },
};

export const baseConfig: Partial<Config> = {
  displayModeBar: false,
  responsive: true,
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
