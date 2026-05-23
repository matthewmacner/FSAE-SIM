import { useStore } from "../store";
import { ParameterPanel } from "../components/ParameterPanel";
import { ParamSlider } from "../components/ParamSlider";

export function BrakesPanel() {
  const br = useStore((s) => s.setup?.brakes);
  if (!br) return null;
  return (
    <ParameterPanel title="Brakes" defaultOpen={false}>
      <ParamSlider
        label="Brake bias F"
        path="brakes.brake_bias_front_pct"
        value={br.brake_bias_front_pct}
        min={40}
        max={80}
        step={0.5}
        unit="% front"
        precision={1}
        tooltip="Fraction of braking torque on the front axle. Tune to match the dynamic axle-load balance under braking."
      />
      <ParamSlider
        label="Max brake torque F"
        path="brakes.max_brake_torque_front_Nm"
        value={br.max_brake_torque_front_Nm}
        min={200}
        max={3000}
        step={10}
        unit="Nm"
        precision={0}
      />
      <ParamSlider
        label="Max brake torque R"
        path="brakes.max_brake_torque_rear_Nm"
        value={br.max_brake_torque_rear_Nm}
        min={200}
        max={3000}
        step={10}
        unit="Nm"
        precision={0}
      />
    </ParameterPanel>
  );
}
