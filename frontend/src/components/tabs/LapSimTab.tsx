import { useStore } from "../../store";
import { fmt } from "../../format";
import { ChartFrame } from "../Plot";

export function LapSimTab() {
  const r = useStore((s) => s.lapResult.data);
  const loading = useStore((s) => s.lapResult.loading);

  if (!r) {
    return (
      <div className="text-ink-3 text-sm">
        {loading ? "Computing lap…" : "Adjust a parameter to compute."}
      </div>
    );
  }

  const dist = r.trace.map((t) => t.distance_m);
  const speedKmh = r.trace.map((t) => t.speed_ms * 3.6);
  const ax = r.trace.map((t) => t.ax_g);
  const ay = r.trace.map((t) => t.ay_g);
  const fz_f = r.trace.map((t) => t.fz_fl_N + t.fz_fr_N);
  const fz_r = r.trace.map((t) => t.fz_rl_N + t.fz_rr_N);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 panel p-5 space-y-4">
        <div>
          <div className="eyebrow">Lap time</div>
          <div className="text-3xl text-accent font-mono tabular-nums mt-1">
            {fmt.s(r.lap_time_s)}
          </div>
        </div>
        <Row label="Track length" value={`${r.track_length_m.toFixed(0)} m`} />
        <Row label="Avg speed" value={`${(r.avg_speed_ms * 3.6).toFixed(1)} km/h`} />
        <Row label="Max speed" value={`${(r.max_speed_ms * 3.6).toFixed(1)} km/h`} />
        <Row label="Energy / lap" value={fmt.kj(r.energy_per_lap_kj)} />
        <hr className="border-edge" />
        <div className="eyebrow">Endurance (22 km)</div>
        <Row label="Laps" value={r.endurance_laps.toFixed(1)} />
        <Row label="Energy" value={fmt.kj(r.endurance_energy_kj)} />
        {r.endurance_fuel_l !== null && (
          <Row label="Fuel" value={fmt.l(r.endurance_fuel_l)} />
        )}
        {r.endurance_battery_kwh !== null && (
          <Row label="Battery" value={fmt.kwh(r.endurance_battery_kwh)} />
        )}
      </div>

      <div className="col-span-9 grid grid-rows-3 gap-4 h-[540px]">
        <div className="panel p-3">
          <div className="eyebrow mb-1 px-1">Speed</div>
          <div className="h-[140px]">
            <ChartFrame
              data={[
                {
                  x: dist,
                  y: speedKmh,
                  type: "scatter",
                  mode: "lines",
                  line: { color: "#0d9488", width: 2 },
                  hovertemplate: "%{x:.0f} m<br>%{y:.1f} km/h<extra></extra>",
                },
              ]}
              layout={{
                margin: { l: 50, r: 10, t: 5, b: 30 },
                xaxis: { title: { text: "" } },
                yaxis: { title: { text: "km/h" } },
                showlegend: false,
              }}
            />
          </div>
        </div>

        <div className="panel p-3">
          <div className="eyebrow mb-1 px-1">g traces</div>
          <div className="h-[140px]">
            <ChartFrame
              data={[
                {
                  x: dist,
                  y: ax,
                  type: "scatter",
                  mode: "lines",
                  name: "ax",
                  line: { color: "#d97706", width: 1.5 },
                },
                {
                  x: dist,
                  y: ay,
                  type: "scatter",
                  mode: "lines",
                  name: "ay",
                  line: { color: "#2563eb", width: 1.5 },
                },
              ]}
              layout={{
                margin: { l: 50, r: 10, t: 5, b: 30 },
                xaxis: { title: { text: "" } },
                yaxis: { title: { text: "g" } },
                showlegend: true,
              }}
            />
          </div>
        </div>

        <div className="panel p-3">
          <div className="eyebrow mb-1 px-1">Axle vertical load</div>
          <div className="h-[140px]">
            <ChartFrame
              data={[
                {
                  x: dist,
                  y: fz_f,
                  type: "scatter",
                  mode: "lines",
                  name: "Front",
                  line: { color: "#0d9488", width: 1.5 },
                },
                {
                  x: dist,
                  y: fz_r,
                  type: "scatter",
                  mode: "lines",
                  name: "Rear",
                  line: { color: "#d97706", width: 1.5 },
                },
              ]}
              layout={{
                margin: { l: 50, r: 10, t: 5, b: 30 },
                xaxis: { title: { text: "Distance (m)" } },
                yaxis: { title: { text: "Fz (N)" }, rangemode: "tozero" },
                showlegend: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-[11px]">
      <span className="text-ink-2">{label}</span>
      <span className="stat text-sm">{value}</span>
    </div>
  );
}
