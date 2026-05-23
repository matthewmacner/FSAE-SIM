import { useState } from "react";
import { StaticTab } from "./tabs/StaticTab";
import { GGTab } from "./tabs/GGTab";
import { AccelTab } from "./tabs/AccelTab";
import { LapSimTab } from "./tabs/LapSimTab";
import { SweepTab } from "./tabs/SweepTab";
import { useStore } from "../store";

type TabId = "static" | "gg" | "accel" | "lap" | "sweep";

const TABS: { id: TabId; label: string }[] = [
  { id: "static", label: "Static" },
  { id: "gg", label: "G-G" },
  { id: "accel", label: "Acceleration" },
  { id: "lap", label: "Lap sim" },
  { id: "sweep", label: "Sweep" },
];

export function ResultsTabs() {
  const [active, setActive] = useState<TabId>("static");
  const compare = useStore((s) => s.compareSetup);
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-end border-b border-edge mb-4 gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-sm font-medium tracking-tight transition-colors ${
              active === t.id
                ? "text-ink-0 border-b-2 border-accent -mb-px"
                : "text-ink-3 hover:text-ink-1"
            }`}
          >
            {t.label}
          </button>
        ))}
        {compare && (
          <div className="ml-auto pb-2 text-[10px] text-accent uppercase tracking-wider">
            comparing → {compare.name || "loaded"}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-auto pr-1">
        {active === "static" && <StaticTab />}
        {active === "gg" && <GGTab />}
        {active === "accel" && <AccelTab />}
        {active === "lap" && <LapSimTab />}
        {active === "sweep" && <SweepTab />}
      </div>
    </div>
  );
}
