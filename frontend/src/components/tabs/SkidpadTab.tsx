import { useStore } from "../../store";
import { fmt } from "../../format";
import { useUnitFormatters } from "../../format";
import { ChartFrame } from "../Plot";

export function SkidpadTab() {
  const r = useStore((s) => s.skidpadResult.data);
  const loading = useStore((s) => s.skidpadResult.loading);
  const u = useUnitFormatters();

  if (!r) {
    return (
      <div className="text-ink-3 text-sm">
        {loading ? "Computing…" : "Adjust a parameter to compute."}
      </div>
    );
  }

  const cw = r.corner_loads_N;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-5 panel p-5">
        <div className="eyebrow mb-2">FS skidpad — R = 15.25 m</div>
        <div className="flex items-end gap-6 mt-2">
          <BigStat label="Lap time" value={fmt.s(r.lap_time_s)} highlight />
          <BigStat label="Lateral g" value={fmt.g(r.lat_g)} />
          <BigStat label="Speed" value={u.speed(r.speed_ms, 1)} />
        </div>
        <p className="mt-4 text-[11px] text-ink-3 leading-relaxed">{r.notes}</p>
      </div>

      <div className="col-span-7 panel p-4">
        <div className="eyebrow mb-3">Corner loads on the circle</div>
        <div className="h-72">
          <ChartFrame
            data={[
              {
                x: ["FL outside", "FR inside", "RL outside", "RR inside"],
                y: [cw.fl_N, cw.fr_N, cw.rl_N, cw.rr_N],
                type: "bar",
                marker: {
                  color: ["#5ee0c4", "#2a3441", "#5ee0c4", "#2a3441"],
                  line: { color: "#5ee0c4", width: 1 },
                },
              },
            ]}
            layout={{
              yaxis: { title: { text: "Vertical load (N)" }, rangemode: "tozero" },
              showlegend: false,
            }}
          />
        </div>
        <div className="mt-2 text-[11px] text-ink-2">
          Inside-to-outside load delta:{" "}
          <span className="stat">{r.inside_outside_load_delta_N.toFixed(0)} N</span>
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
