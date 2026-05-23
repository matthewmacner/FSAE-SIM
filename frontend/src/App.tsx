import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { ResultsTabs } from "./components/ResultsTabs";
import { BalanceSummary } from "./components/BalanceSummary";
import { CarDiagram, type PartKey } from "./components/CarDiagram";
import { Modal } from "./components/Modal";
import { MassGeometryPanel } from "./panels/MassGeometryPanel";
import { SuspensionPanel } from "./panels/SuspensionPanel";
import { TirePanel } from "./panels/TirePanel";
import { AeroPanel } from "./panels/AeroPanel";
import { PowertrainPanel } from "./panels/PowertrainPanel";
import { BrakesPanel } from "./panels/BrakesPanel";
import { useStore } from "./store";

const PANELS: Record<PartKey, { title: string; render: () => JSX.Element }> = {
  mass_geometry: { title: "Mass & geometry", render: () => <MassGeometryPanel /> },
  suspension: { title: "Suspension", render: () => <SuspensionPanel /> },
  tire: { title: "Tires", render: () => <TirePanel /> },
  aero: { title: "Aerodynamics", render: () => <AeroPanel /> },
  powertrain: { title: "Powertrain", render: () => <PowertrainPanel /> },
  brakes: { title: "Brakes", render: () => <BrakesPanel /> },
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
        <aside className="col-span-3 panel overflow-auto min-h-0">
          {setup ? (
            <CarDiagram onSelect={setOpenPart} />
          ) : (
            <div className="p-4 text-[12px] text-ink-3">
              Loading preset from backend…
            </div>
          )}
        </aside>
        <main className="col-span-7 min-h-0">
          <ResultsTabs />
        </main>
        <aside className="col-span-2 min-h-0 overflow-auto">
          <BalanceSummary />
        </aside>
      </div>

      {openPart && (
        <Modal
          title={PANELS[openPart].title}
          onClose={() => setOpenPart(null)}
        >
          {PANELS[openPart].render()}
        </Modal>
      )}
    </div>
  );
}
