import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { ResultsTabs } from "./components/ResultsTabs";
import { BalanceSummary } from "./components/BalanceSummary";
import { CarDiagram, type PartKey } from "./components/CarDiagram";
import { MassGeometryPanel } from "./panels/MassGeometryPanel";
import { SuspensionPanel } from "./panels/SuspensionPanel";
import { TirePanel } from "./panels/TirePanel";
import { AeroPanel } from "./panels/AeroPanel";
import { PowertrainPanel } from "./panels/PowertrainPanel";
import { BrakesPanel } from "./panels/BrakesPanel";
import { useStore } from "./store";

const PANELS: Record<PartKey, () => JSX.Element> = {
  mass_geometry: () => <MassGeometryPanel />,
  suspension: () => <SuspensionPanel />,
  tire: () => <TirePanel />,
  aero: () => <AeroPanel />,
  powertrain: () => <PowertrainPanel />,
  brakes: () => <BrakesPanel />,
};

export default function App() {
  const initialize = useStore((s) => s.initialize);
  const setup = useStore((s) => s.setup);
  const [openPart, setOpenPart] = useState<PartKey | null>(null);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <div className="h-full flex flex-col bg-canvas">
      <TopBar />
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 p-4">
        {/* LEFT — car diagram on top, selected part's parameters below */}
        <aside className="col-span-4 flex flex-col gap-4 min-h-0">
          <div className="panel">
            {setup ? (
              <CarDiagram selected={openPart} onSelect={setOpenPart} />
            ) : (
              <div className="p-4 text-[12px] text-ink-3">
                Loading preset from backend…
              </div>
            )}
          </div>
          <div className="panel flex-1 overflow-auto min-h-0">
            {openPart ? (
              <div className="p-1">{PANELS[openPart]()}</div>
            ) : (
              <div className="px-6 py-10 text-center text-ink-3 text-[12px] leading-relaxed">
                Click a part of the car above to adjust its parameters.
                <br />
                <span className="text-ink-3/70">
                  Changes update the results panel on the right as you tweak.
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT — derived results: balance strip on top, tabs below */}
        <main className="col-span-8 min-h-0 flex flex-col gap-4">
          <BalanceSummary />
          <div className="flex-1 min-h-0">
            <ResultsTabs />
          </div>
        </main>
      </div>
    </div>
  );
}
