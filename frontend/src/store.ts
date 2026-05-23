// Zustand store. The vehicle setup is the single source of truth — every
// result is derived from it and refetched on change (with a debounce in the
// UI). Compare mode holds a second snapshot for diffing.

import { create } from "zustand";
import { api } from "./api";
import type {
  AccelResult,
  GGDiagram,
  LapResult,
  PresetSummary,
  SkidpadResult,
  StaticAnalysis,
  SweepResult,
  VehicleSetup,
} from "./types";

export type Units = "metric" | "imperial";

interface AsyncSlot<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function freshSlot<T>(): AsyncSlot<T> {
  return { data: null, loading: false, error: null };
}

interface State {
  setup: VehicleSetup | null;
  compareSetup: VehicleSetup | null;
  units: Units;
  presets: PresetSummary[];
  staticResult: AsyncSlot<StaticAnalysis>;
  ggResult: AsyncSlot<GGDiagram>;
  skidpadResult: AsyncSlot<SkidpadResult>;
  accelResult: AsyncSlot<AccelResult>;
  lapResult: AsyncSlot<LapResult>;
  sweepResult: AsyncSlot<SweepResult>;

  initialize: () => Promise<void>;
  loadPreset: (name: string) => Promise<void>;
  updateParam: (path: string, value: number | string | null) => void;
  setSetup: (setup: VehicleSetup) => void;
  setCompareSetup: (s: VehicleSetup | null) => void;
  toggleUnits: () => void;

  runStatic: () => Promise<void>;
  runGG: () => Promise<void>;
  runSkidpad: () => Promise<void>;
  runAccel: () => Promise<void>;
  runLap: () => Promise<void>;
  runSweep: (parameter_path: string, values: number[]) => Promise<void>;
  runAll: () => Promise<void>;
}

// Deep-clone + path-set helper. Returns a NEW object so React sees the change.
function setPath(obj: unknown, path: string, value: unknown): unknown {
  const parts = path.split(".");
  const clone: Record<string, unknown> = JSON.parse(JSON.stringify(obj));
  let cursor: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    cursor = cursor[parts[i]] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
  return clone;
}

export const useStore = create<State>((set, get) => ({
  setup: null,
  compareSetup: null,
  units: "metric",
  presets: [],
  staticResult: freshSlot(),
  ggResult: freshSlot(),
  skidpadResult: freshSlot(),
  accelResult: freshSlot(),
  lapResult: freshSlot(),
  sweepResult: freshSlot(),

  initialize: async () => {
    try {
      const list = await api.listPresets();
      set({ presets: list.presets });
      if (list.presets.length > 0) {
        await get().loadPreset(list.presets[0].name);
      }
    } catch (e) {
      console.error("Failed to initialize from backend:", e);
    }
  },

  loadPreset: async (name: string) => {
    const setup = await api.loadPreset(name);
    set({ setup });
    await get().runAll();
  },

  updateParam: (path: string, value: number | string | null) => {
    const current = get().setup;
    if (!current) return;
    const next = setPath(current, path, value) as VehicleSetup;
    set({ setup: next });
  },

  setSetup: (setup) => set({ setup }),
  setCompareSetup: (s) => set({ compareSetup: s }),
  toggleUnits: () =>
    set({ units: get().units === "metric" ? "imperial" : "metric" }),

  runStatic: async () => {
    const setup = get().setup;
    if (!setup) return;
    set({ staticResult: { data: null, loading: true, error: null } });
    try {
      const data = await api.staticAnalysis(setup);
      set({ staticResult: { data, loading: false, error: null } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ staticResult: { data: null, loading: false, error: msg } });
    }
  },

  runGG: async () => {
    const setup = get().setup;
    if (!setup) return;
    set({ ggResult: { ...get().ggResult, loading: true, error: null } });
    try {
      const data = await api.gg(setup);
      set({ ggResult: { data, loading: false, error: null } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ ggResult: { data: null, loading: false, error: msg } });
    }
  },

  runSkidpad: async () => {
    const setup = get().setup;
    if (!setup) return;
    set({ skidpadResult: { ...get().skidpadResult, loading: true, error: null } });
    try {
      const data = await api.skidpad(setup);
      set({ skidpadResult: { data, loading: false, error: null } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ skidpadResult: { data: null, loading: false, error: msg } });
    }
  },

  runAccel: async () => {
    const setup = get().setup;
    if (!setup) return;
    set({ accelResult: { ...get().accelResult, loading: true, error: null } });
    try {
      const data = await api.accel(setup);
      set({ accelResult: { data, loading: false, error: null } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ accelResult: { data: null, loading: false, error: msg } });
    }
  },

  runLap: async () => {
    const setup = get().setup;
    if (!setup) return;
    set({ lapResult: { ...get().lapResult, loading: true, error: null } });
    try {
      const data = await api.lap(setup);
      set({ lapResult: { data, loading: false, error: null } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ lapResult: { data: null, loading: false, error: msg } });
    }
  },

  runSweep: async (parameter_path: string, values: number[]) => {
    const setup = get().setup;
    if (!setup) return;
    set({ sweepResult: { ...get().sweepResult, loading: true, error: null } });
    try {
      const data = await api.sweep(setup, parameter_path, values, false);
      set({ sweepResult: { data, loading: false, error: null } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ sweepResult: { data: null, loading: false, error: msg } });
    }
  },

  runAll: async () => {
    // Fire the fast ones in parallel. Lap sim is heavier so it stays on its
    // own and finishes when it finishes. Skidpad isn't surfaced in the UI
    // any more — the sweep tab fetches it via the backend's /sweep call.
    await Promise.all([
      get().runStatic(),
      get().runAccel(),
      get().runGG(),
    ]);
    void get().runLap();
  },
}));
