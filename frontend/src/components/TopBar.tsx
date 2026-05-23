import { useRef } from "react";
import { useStore } from "../store";

export function TopBar() {
  const presets = useStore((s) => s.presets);
  const setup = useStore((s) => s.setup);
  const compareSetup = useStore((s) => s.compareSetup);
  const loadPreset = useStore((s) => s.loadPreset);
  const setSetup = useStore((s) => s.setSetup);
  const setCompare = useStore((s) => s.setCompareSetup);
  const units = useStore((s) => s.units);
  const toggleUnits = useStore((s) => s.toggleUnits);
  const runAll = useStore((s) => s.runAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const compareFileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    if (!setup) return;
    const blob = new Blob([JSON.stringify(setup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${setup.name.replace(/\s+/g, "_") || "setup"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (e: React.ChangeEvent<HTMLInputElement>, asCompare: boolean) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    try {
      const parsed = JSON.parse(text);
      if (asCompare) {
        setCompare(parsed);
      } else {
        setSetup(parsed);
        void runAll();
      }
    } catch (err) {
      alert("Could not parse JSON: " + (err as Error).message);
    }
    e.target.value = "";
  };

  return (
    <header className="px-4 py-2 border-b border-edge bg-panel flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-accent/15 border border-accent/30 grid place-items-center text-accent text-sm font-bold">
          fs
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-ink-0 font-semibold tracking-tight">FSAE-Sim</span>
          <span className="text-[10px] text-ink-3 uppercase tracking-[0.18em]">
            Vehicle dynamics
          </span>
        </div>
      </div>

      <div className="h-6 w-px bg-edge" />

      <div className="flex items-center gap-2">
        <span className="eyebrow">Preset</span>
        <select
          className="bg-canvas border border-edge text-ink-0 rounded px-2 py-1 text-sm"
          onChange={(e) => {
            if (e.target.value) void loadPreset(e.target.value);
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Load…
          </option>
          {presets.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn" onClick={exportJson} disabled={!setup}>
          Save .json
        </button>
        <button
          className="btn"
          onClick={() => fileRef.current?.click()}
        >
          Load .json
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => void importJson(e, false)}
        />
        <button
          className={`btn ${compareSetup ? "border-accent text-accent" : ""}`}
          onClick={() => {
            if (compareSetup) {
              setCompare(null);
            } else {
              compareFileRef.current?.click();
            }
          }}
        >
          {compareSetup ? "Clear compare" : "Compare .json…"}
        </button>
        <input
          ref={compareFileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => void importJson(e, true)}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="btn" onClick={toggleUnits}>
          Units: {units === "metric" ? "metric" : "imperial"}
        </button>
        <span className="text-[11px] text-ink-3 font-mono truncate max-w-[20rem]">
          {setup?.name ?? ""}
        </span>
      </div>
    </header>
  );
}
