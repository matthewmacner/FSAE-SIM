import { useStore } from "../store";
import { ParameterPanel } from "../components/ParameterPanel";
import { ParamSlider } from "../components/ParamSlider";

export function SuspensionPanel() {
  const sus = useStore((s) => s.setup?.suspension);
  if (!sus) return null;
  return (
    <ParameterPanel title="Suspension">
      <ParamSlider
        label="Spring rate F"
        path="suspension.spring_rate_front_N_mm"
        value={sus.spring_rate_front_N_mm}
        min={10}
        max={120}
        step={1}
        unit="N/mm"
        precision={0}
        tooltip="Spring stiffness at the spring. Combined with motion ratio, this sets the wheel rate."
      />
      <ParamSlider
        label="Spring rate R"
        path="suspension.spring_rate_rear_N_mm"
        value={sus.spring_rate_rear_N_mm}
        min={10}
        max={120}
        step={1}
        unit="N/mm"
        precision={0}
      />
      <ParamSlider
        label="Motion ratio F"
        path="suspension.motion_ratio_front"
        value={sus.motion_ratio_front}
        min={0.5}
        max={2.0}
        step={0.05}
        unit=""
        precision={2}
        tooltip="Wheel travel ÷ spring travel. k_wheel = k_spring / MR². Most FS pushrod cars run 0.9–1.1."
      />
      <ParamSlider
        label="Motion ratio R"
        path="suspension.motion_ratio_rear"
        value={sus.motion_ratio_rear}
        min={0.5}
        max={2.0}
        step={0.05}
        unit=""
        precision={2}
      />
      <ParamSlider
        label="ARB F"
        path="suspension.arb_front_Nm_deg"
        value={sus.arb_front_Nm_deg}
        min={0}
        max={600}
        step={5}
        unit="Nm/deg"
        precision={0}
        tooltip="Front anti-roll-bar stiffness. Raise to push the TLLTD forward (more understeer)."
      />
      <ParamSlider
        label="ARB R"
        path="suspension.arb_rear_Nm_deg"
        value={sus.arb_rear_Nm_deg}
        min={0}
        max={600}
        step={5}
        unit="Nm/deg"
        precision={0}
        tooltip="Rear ARB stiffness. Raise to push TLLTD rearward (more oversteer)."
      />
      <ParamSlider
        label="Roll center F"
        path="suspension.roll_center_front_mm"
        value={sus.roll_center_front_mm}
        min={-50}
        max={150}
        step={1}
        unit="mm"
        precision={0}
        tooltip="Height of the front roll center. Sets the geometric portion of front LLT."
      />
      <ParamSlider
        label="Roll center R"
        path="suspension.roll_center_rear_mm"
        value={sus.roll_center_rear_mm}
        min={-50}
        max={200}
        step={1}
        unit="mm"
        precision={0}
      />
      <ParamSlider
        label="Camber F"
        path="suspension.static_camber_front_deg"
        value={sus.static_camber_front_deg}
        min={-5}
        max={2}
        step={0.1}
        unit="deg"
        precision={1}
      />
      <ParamSlider
        label="Camber R"
        path="suspension.static_camber_rear_deg"
        value={sus.static_camber_rear_deg}
        min={-5}
        max={2}
        step={0.1}
        unit="deg"
        precision={1}
      />
      <ParamSlider
        label="Toe F"
        path="suspension.static_toe_front_deg"
        value={sus.static_toe_front_deg}
        min={-1}
        max={1}
        step={0.05}
        unit="deg"
        precision={2}
      />
      <ParamSlider
        label="Toe R"
        path="suspension.static_toe_rear_deg"
        value={sus.static_toe_rear_deg}
        min={-1}
        max={1}
        step={0.05}
        unit="deg"
        precision={2}
      />
      <ParamSlider
        label="Caster"
        path="suspension.caster_deg"
        value={sus.caster_deg}
        min={0}
        max={10}
        step={0.1}
        unit="deg"
        precision={1}
      />
      <ParamSlider
        label="Anti-dive"
        path="suspension.anti_dive_pct"
        value={sus.anti_dive_pct}
        min={0}
        max={100}
        step={1}
        unit="%"
        precision={0}
        tooltip="% of brake load that's reacted geometrically instead of through the springs. Reduces brake pitch."
      />
      <ParamSlider
        label="Anti-squat"
        path="suspension.anti_squat_pct"
        value={sus.anti_squat_pct}
        min={0}
        max={100}
        step={1}
        unit="%"
        precision={0}
      />
    </ParameterPanel>
  );
}
