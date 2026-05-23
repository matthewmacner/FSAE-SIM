import { useStore } from "../../store";
import { fmt } from "../../format";
import { ChartFrame } from "../Plot";

const COLORS = ["#0d9488", "#2563eb", "#d97706", "#dc2626"];

export function GGTab() {
  const r = useStore((s) => s.ggResult.data);
  const loading = useStore((s) => s.ggResult.loading);

  if (!r) {
    return (
      <div className="text-ink-3 text-sm">
        {loading ? "Computing…" : "Adjust a parameter to compute."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-9 panel p-3 h-[540px]">
        <ChartFrame
          data={r.envelopes.map((env, i) => ({
            x: env.points.map((p) => p.ay_g),
            y: env.points.map((p) => p.ax_g),
            mode: "lines+markers",
            type: "scatter",
            name: `${(env.speed_ms * 3.6).toFixed(0)} km/h`,
            line: { color: COLORS[i % COLORS.length], width: 2 },
            marker: { size: 4 },
            fill: "toself",
            fillcolor: COLORS[i % COLORS.length] + "22",
          }))}
          layout={{
            xaxis: {
              title: { text: "Lateral g (right ↔ left)" },
              zeroline: true,
              range: [-3, 3],
              dtick: 0.5,
            },
            yaxis: {
              title: { text: "Longitudinal g (brake ↓ / accel ↑)" },
              zeroline: true,
              range: [-3, 2],
              dtick: 0.5,
              scaleanchor: "x",
              scaleratio: 1,
            },
            showlegend: true,
          }}
        />
      </div>

      <div className="col-span-3 panel p-4 flex flex-col gap-3">
        <div className="eyebrow">Peaks</div>
        <Stat label="Peak lateral" value={fmt.g(r.peak_lat_g)} />
        <Stat label="Peak forward" value={fmt.g(r.peak_long_accel_g)} />
        <Stat label="Peak braking" value={fmt.g(r.peak_long_brake_g)} />
        <hr className="border-edge my-2" />
        <div className="text-[10px] text-ink-3 leading-tight">
          Each envelope is computed at a fixed speed: tire grip + downforce at that
          speed set the friction circle, and the model sweeps lateral usage from 0
          to peak with the rear axle limited by drive grip, all four by braking.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[11px] text-ink-2">{label}</span>
      <span className="stat text-base">{value}</span>
    </div>
  );
}
