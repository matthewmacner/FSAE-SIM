import { useMemo, useState } from "react";
import { useStore } from "../../store";
import { fmt } from "../../format";
import { ChartFrame } from "../Plot";

// Common parameters worth sweeping during setup work.
const PRESETS: { label: string; path: string; from: number; to: number; steps: number }[] = [
  { label: "Front ARB stiffness", path: "suspension.arb_front_Nm_deg", from: 30, to: 200, steps: 7 },
  { label: "Rear ARB stiffness", path: "suspension.arb_rear_Nm_deg", from: 20, to: 180, steps: 7 },
  { label: "Front spring rate", path: "suspension.spring_rate_front_N_mm", from: 20, to: 70, steps: 7 },
  { label: "Rear spring rate", path: "suspension.spring_rate_rear_N_mm", from: 20, to: 70, steps: 7 },
  { label: "CG height", path: "mass_geometry.cg_height_mm", from: 230, to: 340, steps: 7 },
  { label: "Weight dist. (% front)", path: "mass_geometry.weight_dist_front_pct", from: 42, to: 55, steps: 7 },
  { label: "Front CL·A", path: "aero.cla_front_m2", from: 0.8, to: 2.2, steps: 7 },
  { label: "Tire peak μ", path: "tire.peak_mu", from: 1.2, to: 1.9, steps: 7 },
];

function linspace(a: number, b: number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(a + (i * (b - a)) / (n - 1));
  return out;
}

export function SweepTab() {
  const [presetIndex, setPresetIndex] = useState(0);
  const preset = PRESETS[presetIndex];
  const runSweep = useStore((s) => s.runSweep);
  const r = useStore((s) => s.sweepResult.data);
  const loading = useStore((s) => s.sweepResult.loading);
  const err = useStore((s) => s.sweepResult.error);

  const values = useMemo(
    () => linspace(preset.from, preset.to, preset.steps),
    [preset],
  );

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 panel p-3 flex flex-wrap items-center gap-3">
        <span className="eyebrow">Sweep parameter</span>
        <select
          className="bg-canvas border border-edge text-ink-0 rounded px-2 py-1 text-sm"
          value={presetIndex}
          onChange={(e) => setPresetIndex(parseInt(e.target.value))}
        >
          {PRESETS.map((p, i) => (
            <option value={i} key={p.path}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-ink-3 font-mono">
          {preset.from} → {preset.to} ({preset.steps} steps)
        </span>
        <button
          className="btn-primary"
          onClick={() => void runSweep(preset.path, values)}
          disabled={loading}
        >
          {loading ? "Running…" : "Run sweep"}
        </button>
        {err && <span className="text-accent-alert text-[11px]">{err}</span>}
      </div>

      {r && (
        <>
          <div className="col-span-6 panel p-3 h-72">
            <div className="eyebrow mb-2">Skidpad time vs sweep</div>
            <ChartFrame
              data={[
                {
                  x: r.sweep_values,
                  y: r.points.map((p) => p.skidpad_time_s ?? null),
                  type: "scatter",
                  mode: "lines+markers",
                  line: { color: "#5ee0c4", width: 2 },
                  marker: { size: 8 },
                },
              ]}
              layout={{
                margin: { l: 55, r: 15, t: 15, b: 40 },
                xaxis: { title: { text: preset.label } },
                yaxis: { title: { text: "Skidpad (s)" } },
                showlegend: false,
                shapes: [
                  {
                    type: "line",
                    x0: r.baseline_value,
                    x1: r.baseline_value,
                    y0: 0,
                    y1: 1,
                    yref: "paper",
                    line: { color: "#5b6573", dash: "dash" },
                  },
                ],
              }}
            />
          </div>

          <div className="col-span-6 panel p-3 h-72">
            <div className="eyebrow mb-2">Accel 75 m vs sweep</div>
            <ChartFrame
              data={[
                {
                  x: r.sweep_values,
                  y: r.points.map((p) => p.accel_75m_s ?? null),
                  type: "scatter",
                  mode: "lines+markers",
                  line: { color: "#ffb86b", width: 2 },
                  marker: { size: 8 },
                },
              ]}
              layout={{
                margin: { l: 55, r: 15, t: 15, b: 40 },
                xaxis: { title: { text: preset.label } },
                yaxis: { title: { text: "75 m time (s)" } },
                showlegend: false,
                shapes: [
                  {
                    type: "line",
                    x0: r.baseline_value,
                    x1: r.baseline_value,
                    y0: 0,
                    y1: 1,
                    yref: "paper",
                    line: { color: "#5b6573", dash: "dash" },
                  },
                ],
              }}
            />
          </div>

          <div className="col-span-12 panel p-3 h-72">
            <div className="eyebrow mb-2">Balance (TLLTD % front) vs sweep</div>
            <ChartFrame
              data={[
                {
                  x: r.sweep_values,
                  y: r.points.map((p) => p.tlltd_front_pct ?? null),
                  type: "scatter",
                  mode: "lines+markers",
                  line: { color: "#7eb6ff", width: 2 },
                  marker: { size: 8 },
                },
              ]}
              layout={{
                margin: { l: 55, r: 15, t: 15, b: 40 },
                xaxis: { title: { text: preset.label } },
                yaxis: { title: { text: "TLLTD (% front)" } },
                showlegend: false,
                shapes: [
                  {
                    type: "line",
                    x0: r.baseline_value,
                    x1: r.baseline_value,
                    y0: 0,
                    y1: 1,
                    yref: "paper",
                    line: { color: "#5b6573", dash: "dash" },
                  },
                ],
              }}
            />
          </div>

          <div className="col-span-12 panel p-3">
            <div className="eyebrow mb-2">Raw values</div>
            <table className="w-full text-[11px] font-mono">
              <thead className="text-ink-3">
                <tr>
                  <th className="text-left py-1">{preset.label}</th>
                  <th className="text-right py-1">Skidpad (s)</th>
                  <th className="text-right py-1">75 m (s)</th>
                  <th className="text-right py-1">TLLTD %</th>
                  <th className="text-right py-1">UG °/g</th>
                </tr>
              </thead>
              <tbody>
                {r.points.map((p) => (
                  <tr
                    key={p.value}
                    className={
                      Math.abs(p.value - r.baseline_value) < 1e-6
                        ? "text-accent"
                        : "text-ink-1"
                    }
                  >
                    <td className="py-1">{p.value.toFixed(2)}</td>
                    <td className="text-right">{fmt.num(p.skidpad_time_s ?? undefined, 3)}</td>
                    <td className="text-right">{fmt.num(p.accel_75m_s ?? undefined, 3)}</td>
                    <td className="text-right">{fmt.num(p.tlltd_front_pct ?? undefined, 1)}</td>
                    <td className="text-right">{fmt.num(p.understeer_gradient_deg_g ?? undefined, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-[10px] text-ink-3">
              Lap time isn't included by default to keep sweeps fast; rerun with the
              backend's include_lap=true if you want it.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
