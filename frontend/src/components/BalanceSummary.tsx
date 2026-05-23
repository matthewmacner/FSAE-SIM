import { useStore } from "../store";
import { fmt } from "../format";

export function BalanceSummary() {
  const stat = useStore((s) => s.staticResult.data);
  const compareSetup = useStore((s) => s.compareSetup);
  const tlltd = stat?.tlltd_front_pct;
  const ug = stat?.understeer_gradient_deg_g;

  // Balance at 60 km/h ≈ 16.7 m/s is the entry in the balance_vs_speed table.
  const bal60 = stat?.balance_vs_speed.find((b) => Math.abs(b.speed_ms - 16.7) < 0.1);
  const aeroAt60 = bal60?.aero_balance_front_pct;
  const totalAt60 = bal60?.total_balance_front_pct;

  const interp = (() => {
    if (ug === undefined) return "—";
    if (ug > 0.15) return "Understeer";
    if (ug < -0.15) return "Oversteer";
    return "Neutral";
  })();

  return (
    <div className="panel p-4 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Balance summary</span>
        {compareSetup && (
          <span className="text-[10px] uppercase tracking-wider text-accent">
            compare mode
          </span>
        )}
      </div>

      <Row label="TLLTD (front share)" value={fmt.pct(tlltd)} hint={interp} />
      <Row label="Aero balance @ 60 km/h" value={fmt.pct(aeroAt60)} hint="front" />
      <Row label="Total balance @ 60 km/h" value={fmt.pct(totalAt60)} hint="front" />
      <Row label="Understeer gradient" value={fmt.deg_g(ug)} hint={interp} />
      <Row
        label="Roll gradient"
        value={fmt.deg_g(stat?.roll_gradient_deg_g)}
      />
      <Row
        label="Ride frequency F / R"
        value={
          stat
            ? `${stat.front_ride_freq_hz.toFixed(2)} / ${stat.rear_ride_freq_hz.toFixed(2)} Hz`
            : "—"
        }
      />
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-ink-2">{label}</span>
        <span className="stat text-sm">{value}</span>
      </div>
      {hint && <div className="text-[10px] text-ink-3 text-right">{hint}</div>}
    </div>
  );
}
