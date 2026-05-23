import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { ResultsTabs } from "./components/ResultsTabs";
import { BalanceSummary } from "./components/BalanceSummary";
import { MassGeometryPanel } from "./panels/MassGeometryPanel";
import { SuspensionPanel } from "./panels/SuspensionPanel";
import { TirePanel } from "./panels/TirePanel";
import { AeroPanel } from "./panels/AeroPanel";
import { PowertrainPanel } from "./panels/PowertrainPanel";
import { BrakesPanel } from "./panels/BrakesPanel";
import { useStore } from "./store";

export default function App() {
  const initialize = useStore((s) => s.initialize);
  const setup = useStore((s) => s.setup);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <div className="h-full flex flex-col bg-canvas">
      <TopBar />
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 p-4">
        <aside className="col-span-3 flex flex-col gap-3 overflow-auto pr-1 min-h-0">
          {setup ? (
            <>
              <MassGeometryPanel />
              <SuspensionPanel />
              <TirePanel />
              <AeroPanel />
              <PowertrainPanel />
              <BrakesPanel />
            </>
          ) : (
            <div className="panel p-4 text-[12px] text-ink-3">
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
    </div>
  );
}
