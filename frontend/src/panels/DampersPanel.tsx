import { useStore } from "../store";
import { ParameterPanel } from "../components/ParameterPanel";
import { ParamSlider } from "../components/ParamSlider";

/**
 * Damper / shock settings. Exposes the four sub-fields of `damper_front` and
 * `damper_rear` (LSC / HSC / LSR / HSR) which are part of the suspension
 * schema but aren't surfaced anywhere else in the UI.
 */
export function DampersPanel() {
  const sus = useStore((s) => s.setup?.suspension);
  if (!sus) return null;
  return (
    <ParameterPanel title="Shocks">
      <Section title="Front damper">
        <ParamSlider
          label="Low-speed comp."
          path="suspension.damper_front.low_speed_comp_Ns_m"
          value={sus.damper_front.low_speed_comp_Ns_m}
          min={0}
          max={8000}
          step={50}
          unit="N·s/m"
          precision={0}
          tooltip="Low-speed compression damping. Controls how the chassis settles under steady inputs (roll, pitch, dive)."
        />
        <ParamSlider
          label="High-speed comp."
          path="suspension.damper_front.high_speed_comp_Ns_m"
          value={sus.damper_front.high_speed_comp_Ns_m}
          min={0}
          max={8000}
          step={50}
          unit="N·s/m"
          precision={0}
          tooltip="High-speed compression damping. Comes into play over kerbs, bumps, and sharp transients."
        />
        <ParamSlider
          label="Low-speed reb."
          path="suspension.damper_front.low_speed_reb_Ns_m"
          value={sus.damper_front.low_speed_reb_Ns_m}
          min={0}
          max={10000}
          step={50}
          unit="N·s/m"
          precision={0}
          tooltip="Low-speed rebound damping. Sets how quickly the chassis returns after compression."
        />
        <ParamSlider
          label="High-speed reb."
          path="suspension.damper_front.high_speed_reb_Ns_m"
          value={sus.damper_front.high_speed_reb_Ns_m}
          min={0}
          max={10000}
          step={50}
          unit="N·s/m"
          precision={0}
          tooltip="High-speed rebound damping."
        />
      </Section>

      <Section title="Rear damper">
        <ParamSlider
          label="Low-speed comp."
          path="suspension.damper_rear.low_speed_comp_Ns_m"
          value={sus.damper_rear.low_speed_comp_Ns_m}
          min={0}
          max={8000}
          step={50}
          unit="N·s/m"
          precision={0}
        />
        <ParamSlider
          label="High-speed comp."
          path="suspension.damper_rear.high_speed_comp_Ns_m"
          value={sus.damper_rear.high_speed_comp_Ns_m}
          min={0}
          max={8000}
          step={50}
          unit="N·s/m"
          precision={0}
        />
        <ParamSlider
          label="Low-speed reb."
          path="suspension.damper_rear.low_speed_reb_Ns_m"
          value={sus.damper_rear.low_speed_reb_Ns_m}
          min={0}
          max={10000}
          step={50}
          unit="N·s/m"
          precision={0}
        />
        <ParamSlider
          label="High-speed reb."
          path="suspension.damper_rear.high_speed_reb_Ns_m"
          value={sus.damper_rear.high_speed_reb_Ns_m}
          min={0}
          max={10000}
          step={50}
          unit="N·s/m"
          precision={0}
        />
      </Section>

      <p className="mt-3 text-[10px] text-ink-3 leading-relaxed px-1">
        Dampers contribute to ride-frequency and damping-ratio readouts on the
        Static tab. They don't yet feed into the lap simulator — that's a v2
        upgrade (transient dynamics).
      </p>
    </ParameterPanel>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-ink-3 font-medium mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}
