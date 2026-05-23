import { useStore } from "../../store";
import { fmt } from "../../format";
import { ChartFrame } from "../Plot";

export function StaticTab() {
  const s = useStore((st) => st.staticResult.data);
  const loading = useStore((st) => st.staticResult.loading);
  if (!s) {
    return (
      <div className="text-ink-3 text-sm">
        {loading ? "Computing…" : "Adjust a parameter to compute."}
      </div>
    );
  }

  const cw = s.corner_weights_N;
  const corners: { label: string; v: number }[] = [
    { label: "FL", v: cw.fl_N },
    { label: "FR", v: cw.fr_N },
    { label: "RL", v: cw.rl_N },
    { label: "RR", v: cw.rr_N },
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card title="Corner weights" className="col-span-4">
        <div className="grid grid-cols-2 gap-2">
          {corners.map((c) => (
            <div
              key={c.label}
              className="panel-quiet px-3 py-2 flex items-baseline justify-between"
            >
              <span className="text-[11px] text-ink-3">{c.label}</span>
              <span className="stat text-sm">{c.v.toFixed(0)} N</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-baseline justify-between text-[11px] text-ink-2">
          <span>Cross-weight</span>
          <span className="stat">{fmt.pct(s.cross_weight_pct)}</span>
        </div>
        <div className="flex items-baseline justify-between text-[11px] text-ink-2">
          <span>Front / rear axle</span>
          <span className="stat">
            {s.front_axle_load_N.toFixed(0)} / {s.rear_axle_load_N.toFixed(0)} N
          </span>
        </div>
      </Card>

      <Card title="Wheel rates & frequencies" className="col-span-4">
        <Row label="Wheel rate F" value={`${s.front_wheel_rate_N_mm.toFixed(1)} N/mm`} />
        <Row label="Wheel rate R" value={`${s.rear_wheel_rate_N_mm.toFixed(1)} N/mm`} />
        <Row label="Ride freq F" value={fmt.hz(s.front_ride_freq_hz)} />
        <Row label="Ride freq R" value={fmt.hz(s.rear_ride_freq_hz)} />
        <Row label="Damping ratio F" value={s.front_damping_ratio.toFixed(2)} />
        <Row label="Damping ratio R" value={s.rear_damping_ratio.toFixed(2)} />
      </Card>

      <Card title="Stability summary" className="col-span-4">
        <Row label="Front roll stiffness" value={`${s.front_roll_stiffness_Nm_deg.toFixed(0)} Nm/deg`} />
        <Row label="Rear roll stiffness" value={`${s.rear_roll_stiffness_Nm_deg.toFixed(0)} Nm/deg`} />
        <Row label="TLLTD (front share)" value={fmt.pct(s.tlltd_front_pct)} />
        <Row label="Roll gradient" value={fmt.deg_g(s.roll_gradient_deg_g)} />
        <Row label="Pitch grad. (brake)" value={fmt.deg_g(s.pitch_gradient_brake_deg_g)} />
        <Row label="Pitch grad. (accel)" value={fmt.deg_g(s.pitch_gradient_accel_deg_g)} />
        <Row label="Understeer gradient" value={fmt.deg_g(s.understeer_gradient_deg_g)} />
      </Card>

      <Card title="Balance vs speed" className="col-span-12">
        <div className="h-64">
          <ChartFrame
            data={[
              {
                x: s.balance_vs_speed.map((b) => b.speed_ms * 3.6),
                y: s.balance_vs_speed.map((b) => b.mechanical_balance_front_pct),
                name: "Mechanical",
                type: "scatter",
                mode: "lines+markers",
                line: { color: "#0d9488", width: 2 },
                marker: { size: 6 },
              },
              {
                x: s.balance_vs_speed.map((b) => b.speed_ms * 3.6),
                y: s.balance_vs_speed.map((b) => b.aero_balance_front_pct),
                name: "Aero",
                type: "scatter",
                mode: "lines+markers",
                line: { color: "#d97706", width: 2 },
                marker: { size: 6 },
              },
              {
                x: s.balance_vs_speed.map((b) => b.speed_ms * 3.6),
                y: s.balance_vs_speed.map((b) => b.total_balance_front_pct),
                name: "Total",
                type: "scatter",
                mode: "lines+markers",
                line: { color: "#2563eb", width: 2.5, dash: "dot" },
                marker: { size: 6 },
              },
            ]}
            layout={{
              xaxis: { title: { text: "Speed (km/h)" } },
              yaxis: { title: { text: "Balance (% front)" }, range: [30, 70] },
              showlegend: true,
            }}
          />
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`panel p-4 ${className ?? ""}`}>
      <div className="eyebrow mb-3">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-[11px] py-0.5">
      <span className="text-ink-2">{label}</span>
      <span className="stat text-sm">{value}</span>
    </div>
  );
}
