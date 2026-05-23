import { useStore } from "../../store";
import { fmt } from "../../format";
import { useUnitFormatters } from "../../format";
import { ChartFrame } from "../Plot";

export function AccelTab() {
  const r = useStore((s) => s.accelResult.data);
  const loading = useStore((s) => s.accelResult.loading);
  const u = useUnitFormatters();

  if (!r) {
    return (
      <div className="text-ink-3 text-sm">
        {loading ? "Computing…" : "Adjust a parameter to compute."}
      </div>
    );
  }

  // Split trace into traction-limited / power-limited / redline segments.
  const tractionX: number[] = [];
  const tractionY: number[] = [];
  const powerX: number[] = [];
  const powerY: number[] = [];
  for (const p of r.trace) {
    if (p.distance_m > 75) break;
    const speedDisplay = u.units === "metric" ? p.speed_ms * 3.6 : p.speed_ms * 2.23694;
    if (p.limited_by === "traction") {
      tractionX.push(p.distance_m);
      tractionY.push(speedDisplay);
    } else {
      powerX.push(p.distance_m);
      powerY.push(speedDisplay);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 panel p-5">
        <div className="eyebrow mb-2">75 m straight</div>
        <BigStat label="Time" value={fmt.s(r.time_75m_s)} highlight />
        <div className="mt-4">
          <BigStat label="Exit speed" value={u.speed(r.top_speed_75m_ms, 1)} />
        </div>
      </div>

      <div className="col-span-9 panel p-4">
        <div className="eyebrow mb-3">Velocity vs distance</div>
        <div className="h-72">
          <ChartFrame
            data={[
              {
                x: tractionX,
                y: tractionY,
                type: "scatter",
                mode: "lines",
                name: "Traction-limited",
                line: { color: "#d97706", width: 3 },
              },
              {
                x: powerX,
                y: powerY,
                type: "scatter",
                mode: "lines",
                name: "Power-limited",
                line: { color: "#0d9488", width: 3 },
              },
            ]}
            layout={{
              xaxis: { title: { text: "Distance (m)" }, range: [0, 80] },
              yaxis: {
                title: {
                  text: u.units === "metric" ? "Speed (km/h)" : "Speed (mph)",
                },
                rangemode: "tozero",
              },
              showlegend: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-3">{label}</div>
      <div
        className={`mt-1 font-mono tabular-nums ${
          highlight ? "text-accent text-3xl" : "text-ink-0 text-2xl"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
