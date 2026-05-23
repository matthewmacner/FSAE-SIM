import { useStore } from "../store";
import { ParameterPanel } from "../components/ParameterPanel";
import { ParamSlider } from "../components/ParamSlider";

export function AeroPanel() {
  const aero = useStore((s) => s.setup?.aero);
  if (!aero) return null;
  return (
    <ParameterPanel title="Aerodynamics">
      <ParamSlider
        label="CL·A front"
        path="aero.cla_front_m2"
        value={aero.cla_front_m2}
        min={0}
        max={5}
        step={0.05}
        unit="m²"
        precision={2}
        tooltip="Front lift coefficient × frontal area. Higher = more front downforce. Combined with rear sets aero balance."
      />
      <ParamSlider
        label="CL·A rear"
        path="aero.cla_rear_m2"
        value={aero.cla_rear_m2}
        min={0}
        max={5}
        step={0.05}
        unit="m²"
        precision={2}
      />
      <ParamSlider
        label="CD·A"
        path="aero.cda_m2"
        value={aero.cda_m2}
        min={0.3}
        max={3}
        step={0.05}
        unit="m²"
        precision={2}
        tooltip="Drag coefficient × frontal area. Drag force = 0.5·ρ·v²·CD·A."
      />
      <ParamSlider
        label="Ref. velocity"
        path="aero.reference_velocity_ms"
        value={aero.reference_velocity_ms}
        min={5}
        max={50}
        step={0.5}
        unit="m/s"
        precision={1}
      />
      <ParamSlider
        label="Air density"
        path="aero.air_density_kg_m3"
        value={aero.air_density_kg_m3}
        min={0.9}
        max={1.35}
        step={0.01}
        unit="kg/m³"
        precision={2}
        tooltip="Ambient air density. 1.20 ≈ 25 °C at sea level. Lincoln in summer ≈ 1.13."
      />
    </ParameterPanel>
  );
}
