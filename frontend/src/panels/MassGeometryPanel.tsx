import { useStore } from "../store";
import { ParameterPanel } from "../components/ParameterPanel";
import { ParamSlider } from "../components/ParamSlider";

export function MassGeometryPanel() {
  const mg = useStore((s) => s.setup?.mass_geometry);
  if (!mg) return null;
  return (
    <ParameterPanel title="Mass & geometry">
      <ParamSlider
        label="Total mass"
        path="mass_geometry.total_mass_kg"
        value={mg.total_mass_kg}
        min={120}
        max={400}
        step={1}
        unit="kg"
        precision={0}
        tooltip="Total mass including driver. FS range is typically 180–280 kg."
      />
      <ParamSlider
        label="Weight dist. front"
        path="mass_geometry.weight_dist_front_pct"
        value={mg.weight_dist_front_pct}
        min={35}
        max={60}
        step={0.5}
        unit="% front"
        precision={1}
        tooltip="Static fraction of weight on the front axle. Most FS cars are 45–50 % front."
      />
      <ParamSlider
        label="Wheelbase"
        path="mass_geometry.wheelbase_mm"
        value={mg.wheelbase_mm}
        min={1400}
        max={1800}
        step={5}
        unit="mm"
        precision={0}
      />
      <ParamSlider
        label="Track front"
        path="mass_geometry.track_front_mm"
        value={mg.track_front_mm}
        min={1100}
        max={1400}
        step={5}
        unit="mm"
        precision={0}
      />
      <ParamSlider
        label="Track rear"
        path="mass_geometry.track_rear_mm"
        value={mg.track_rear_mm}
        min={1100}
        max={1400}
        step={5}
        unit="mm"
        precision={0}
      />
      <ParamSlider
        label="CG height"
        path="mass_geometry.cg_height_mm"
        value={mg.cg_height_mm}
        min={200}
        max={400}
        step={1}
        unit="mm"
        precision={0}
        tooltip="Height of the CG above ground. Lower = less load transfer. Battery-floor EVs run ~250 mm; combustion is 280–320 mm."
      />
      <ParamSlider
        label="Unsprung F"
        path="mass_geometry.unsprung_mass_front_kg"
        value={mg.unsprung_mass_front_kg}
        min={4}
        max={25}
        step={0.5}
        unit="kg"
        precision={1}
      />
      <ParamSlider
        label="Unsprung R"
        path="mass_geometry.unsprung_mass_rear_kg"
        value={mg.unsprung_mass_rear_kg}
        min={4}
        max={25}
        step={0.5}
        unit="kg"
        precision={1}
      />
      <ParamSlider
        label="Yaw inertia"
        path="mass_geometry.yaw_inertia_kgm2"
        value={mg.yaw_inertia_kgm2}
        min={40}
        max={200}
        step={1}
        unit="kg·m²"
        precision={0}
      />
    </ParameterPanel>
  );
}
