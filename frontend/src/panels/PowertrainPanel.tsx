import { useStore } from "../store";
import { ParameterPanel } from "../components/ParameterPanel";
import { ParamSlider } from "../components/ParamSlider";

export function PowertrainPanel() {
  const pt = useStore((s) => s.setup?.powertrain);
  const update = useStore((s) => s.updateParam);
  const runAll = useStore((s) => s.runAll);
  if (!pt) return null;
  return (
    <ParameterPanel title="Powertrain" defaultOpen={false}>
      <div className="flex items-center gap-2 py-1">
        <span className="text-[12px] text-ink-1 w-44">Drivetrain</span>
        <select
          className="bg-canvas border border-edge text-ink-0 rounded px-2 py-1 text-sm flex-1"
          value={pt.drivetrain_type}
          onChange={(e) => {
            update("powertrain.drivetrain_type", e.target.value);
            void runAll();
          }}
        >
          <option value="combustion">Combustion</option>
          <option value="ev">Electric</option>
        </select>
      </div>
      <ParamSlider
        label="Redline"
        path="powertrain.redline_rpm"
        value={pt.redline_rpm}
        min={3000}
        max={20000}
        step={100}
        unit="rpm"
        precision={0}
      />
      <ParamSlider
        label="Final drive"
        path="powertrain.final_drive_ratio"
        value={pt.final_drive_ratio}
        min={1.0}
        max={20.0}
        step={0.1}
        unit=":1"
        precision={2}
        tooltip="Final drive ratio. EV single-speed reductions are often 10–15."
      />
      <ParamSlider
        label="Drivetrain eff."
        path="powertrain.drivetrain_efficiency"
        value={pt.drivetrain_efficiency}
        min={0.5}
        max={0.99}
        step={0.01}
        unit=""
        precision={2}
      />
      <ParamSlider
        label="Tire radius"
        path="powertrain.tire_radius_mm"
        value={pt.tire_radius_mm}
        min={180}
        max={300}
        step={1}
        unit="mm"
        precision={0}
      />
      {pt.drivetrain_type === "ev" ? (
        <ParamSlider
          label="Battery"
          path="powertrain.battery_capacity_kwh"
          value={pt.battery_capacity_kwh ?? 0}
          min={0}
          max={20}
          step={0.1}
          unit="kWh"
          precision={1}
        />
      ) : (
        <ParamSlider
          label="Fuel tank"
          path="powertrain.fuel_capacity_l"
          value={pt.fuel_capacity_l ?? 0}
          min={0}
          max={15}
          step={0.1}
          unit="L"
          precision={1}
        />
      )}
      <div className="mt-2 text-[10px] text-ink-3 leading-tight">
        Torque curve and gear ratios are editable via Save/Load .json — UI sliders coming in v2.
      </div>
    </ParameterPanel>
  );
}
