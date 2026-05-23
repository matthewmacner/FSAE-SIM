import { useStore } from "../store";
import { ParameterPanel } from "../components/ParameterPanel";
import { ParamSlider } from "../components/ParamSlider";

export function TirePanel() {
  const tire = useStore((s) => s.setup?.tire);
  const update = useStore((s) => s.updateParam);
  const runAll = useStore((s) => s.runAll);
  if (!tire) return null;
  return (
    <ParameterPanel title="Tires">
      <div className="flex items-center gap-2 py-1">
        <span className="text-[12px] text-ink-1 w-44">Compound</span>
        <input
          className="flex-1 px-2 py-1 rounded bg-canvas border border-edge text-ink-0 text-sm"
          value={tire.compound}
          onChange={(e) => update("tire.compound", e.target.value)}
          onBlur={() => void runAll()}
        />
      </div>
      <ParamSlider
        label="Peak μ"
        path="tire.peak_mu"
        value={tire.peak_mu}
        min={0.5}
        max={2.5}
        step={0.01}
        unit=""
        precision={2}
        tooltip="Peak friction coefficient at the reference vertical load. R25B-class slicks ≈ 1.5–1.7."
      />
      <ParamSlider
        label="Cornering stiff."
        path="tire.cornering_stiffness_N_deg"
        value={tire.cornering_stiffness_N_deg}
        min={200}
        max={3000}
        step={10}
        unit="N/deg"
        precision={0}
      />
      <ParamSlider
        label="Load sens. exp."
        path="tire.load_sensitivity_exp"
        value={tire.load_sensitivity_exp}
        min={0.5}
        max={1.0}
        step={0.01}
        unit=""
        precision={2}
        tooltip="F_y_max = μ·Fz_ref·(Fz/Fz_ref)^n. n < 1 captures grip drop with load — n ≈ 0.8–0.9 for slicks."
      />
      <ParamSlider
        label="Reference load"
        path="tire.reference_load_N"
        value={tire.reference_load_N}
        min={400}
        max={3000}
        step={10}
        unit="N"
        precision={0}
      />
      <ParamSlider
        label="Rolling resist."
        path="tire.rolling_resistance_coef"
        value={tire.rolling_resistance_coef}
        min={0.005}
        max={0.05}
        step={0.001}
        unit=""
        precision={3}
      />
      <ParamSlider
        label="Vertical stiff."
        path="tire.vertical_stiffness_N_mm"
        value={tire.vertical_stiffness_N_mm}
        min={40}
        max={300}
        step={5}
        unit="N/mm"
        precision={0}
      />
      <ParamSlider
        label="Opt. slip angle"
        path="tire.optimal_slip_angle_deg"
        value={tire.optimal_slip_angle_deg}
        min={3}
        max={15}
        step={0.1}
        unit="deg"
        precision={1}
      />
      <ParamSlider
        label="Opt. slip ratio"
        path="tire.optimal_slip_ratio"
        value={tire.optimal_slip_ratio}
        min={0.05}
        max={0.30}
        step={0.01}
        unit=""
        precision={2}
      />
    </ParameterPanel>
  );
}
