// Thin typed wrappers around the FastAPI endpoints. All requests go through
// the `/api` prefix which Vite proxies to the backend (default localhost:8000).

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

const BASE = "/api";

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  staticAnalysis: (setup: VehicleSetup) =>
    postJSON<StaticAnalysis>("/static", setup),

  gg: (setup: VehicleSetup, speeds_ms?: number[]) =>
    postJSON<GGDiagram>("/gg", { setup, speeds_ms }),

  skidpad: (setup: VehicleSetup) =>
    postJSON<SkidpadResult>("/skidpad", setup),

  accel: (setup: VehicleSetup) =>
    postJSON<AccelResult>("/accel", setup),

  lap: (setup: VehicleSetup, track?: { distance_m: number[]; curvature_1_m: number[] }) =>
    postJSON<LapResult>("/lap", { setup, track }),

  sweep: (
    setup: VehicleSetup,
    parameter_path: string,
    values: number[],
    include_lap = true,
  ) =>
    postJSON<SweepResult>("/sweep", {
      setup,
      parameter_path,
      values,
      include_lap,
    }),

  listPresets: () =>
    getJSON<{ presets: PresetSummary[] }>("/presets"),

  loadPreset: (name: string) =>
    getJSON<VehicleSetup>(`/presets/${name}`),
};
