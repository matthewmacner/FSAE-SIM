import { useStore } from "../store";
import { fmt } from "../format";

/**
 * Horizontal strip of the most-watched derived numbers. Lives at the top of
 * the right column above the result tabs. Each cell is a labelled stat;
 * compare-mode flag flips on a small indicator without changing the layout.
 */
export function BalanceSummary() {
  const stat = useStore((s) => s.staticResult.data);
  const compareSetup = useStore((s) => s.compareSetup);
  const tlltd = stat?.tlltd_front_pct;
  const ug = stat?.understeer_gradient_deg_g;

  const bal60 = stat?.balance_vs_speed.find(
    (b) => Math.abs(b.speed_ms - 16.7) < 0.1,
  );

  const interp = (() => {
    if (ug === undefined) return undefined;
    if (ug > 0.15) return "Understeer";
    if (ug < -0.15) return "Oversteer";
    return "Neutral";
  })();

  return (
    <div className="panel px-4 py-3 flex items-stretch gap-4 overflow-x-auto">
      <div className="flex flex-col justify-center pr-4 border-r border-edge shrink-0">
        <span className="eyebrow">Balance summary</span>
        {compareSetup && (
          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-accent">
            compare mode
          </span>
        )}
      </div>

      <Cell label="TLLTD (F)" value={fmt.pct(tlltd)} hint={interp} />
      <Cell label="Aero @ 60 km/h" value={fmt.pct(bal60?.aero_balance_front_pct)} hint="front" />
      <Cell label="Total @ 60 km/h" value={fmt.pct(bal60?.total_balance_front_pct)} hint="front" />
      <Cell label="Understeer" value={fmt.deg_g(ug)} hint={interp} />
      <Cell label="Roll gradient" value={fmt.deg_g(stat?.roll_gradient_deg_g)} />
      <Cell
        label="Ride freq F / R"
        value={
          stat
            ? `${stat.front_ride_freq_hz.toFixed(2)} / ${stat.rear_ride_freq_hz.toFixed(2)} Hz`
            : "—"
        }
      />
    </div>
  );
}

function Cell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col justify-center shrink-0">
      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-3">
        {label}
      </span>
      <span className="stat text-sm">{value}</span>
      {hint && (
        <span className="text-[10px] text-ink-3 leading-none mt-0.5">
          {hint}
        </span>
      )}
    </div>
  );
}
