import { useState } from "react";

export type PartKey =
  | "mass_geometry"
  | "suspension"
  | "tire"
  | "aero"
  | "powertrain"
  | "brakes"
  | "dampers";

const LABELS: Record<PartKey, string> = {
  mass_geometry: "Mass & geometry",
  suspension: "Suspension",
  tire: "Tires",
  aero: "Aerodynamics",
  powertrain: "Powertrain",
  brakes: "Brakes",
  dampers: "Shocks",
};

interface Props {
  selected: PartKey | null;
  onSelect: (part: PartKey) => void;
}

/**
 * Hotspot regions in normalized coordinates (0–100) over the car image.
 * Multiple regions can map to the same PartKey (e.g. front + rear wing
 * both → "aero"). Later entries draw on top of earlier ones, so put
 * smaller / more specific regions last so they win clicks.
 *
 * Tune these numbers by hovering the live image and watching what
 * highlights — coordinates are calibrated against the reference render
 * (≈1180 × 900) and may need a few percent of adjustment per region.
 */
interface Hotspot {
  key: PartKey;
  /** Top-left x in percent of image width. */
  x: number;
  /** Top-left y in percent of image height. */
  y: number;
  /** Width in percent of image width. */
  w: number;
  /** Height in percent of image height. */
  h: number;
  /** Human-readable name for the corner label (defaults to LABELS[key]). */
  note?: string;
}

const HOTSPOTS: Hotspot[] = [
  // === Aero ===
  { key: "aero", x: 8, y: 38, w: 11, h: 50, note: "Rear wing" },
  { key: "aero", x: 80, y: 65, w: 19, h: 22, note: "Front wing" },

  // === Mass & body (rough, will be tuned) ===
  { key: "mass_geometry", x: 19, y: 48, w: 60, h: 22, note: "Bodywork" },

  // === Roll structure (more specific — sits on top of body region) ===
  { key: "mass_geometry", x: 38, y: 28, w: 12, h: 22, note: "Roll hoop" },

  // === Powertrain — middle of the car between wheels, lower band ===
  { key: "powertrain", x: 32, y: 60, w: 25, h: 13, note: "Engine bay" },

  // === Suspension links — between body and each wheel ===
  { key: "suspension", x: 26, y: 60, w: 9, h: 18, note: "Rear suspension" },
  { key: "suspension", x: 56, y: 60, w: 9, h: 18, note: "Front suspension" },

  // === Tires — full wheel area ===
  { key: "tire", x: 17, y: 52, w: 16, h: 38, note: "Rear wheel" },
  { key: "tire", x: 63, y: 52, w: 16, h: 38, note: "Front wheel" },

  // === Brakes — center of each wheel rim (drawn last so they capture
  //              clicks before the wider tire hotspot). ===
  { key: "brakes", x: 22, y: 65, w: 6, h: 12, note: "Rear brake" },
  { key: "brakes", x: 68, y: 65, w: 6, h: 12, note: "Front brake" },
];

export function CarDiagram({ selected, onSelect }: Props) {
  const [hover, setHover] = useState<{ key: PartKey; note: string } | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const active: PartKey | null = hover?.key ?? selected;
  const accent = "#0d9488"; // teal-600
  const charcoalMid = "#3a3a3a";
  const springGrey = "#5a5a5a";

  return (
    <div className="flex flex-col">
      <div className="px-3 py-2 border-b border-edge flex items-baseline justify-between">
        <span className="eyebrow">Click a part</span>
        <span className="text-[11px] text-ink-2 h-4">
          {hover ? hover.note : active ? LABELS[active] : ""}
        </span>
      </div>

      <div className="relative w-full bg-panel">
        {imgFailed ? (
          <div className="aspect-[1180/900] w-full flex items-center justify-center p-6 text-[12px] text-ink-2 text-center leading-relaxed">
            Drop your reference render at
            <br />
            <code className="text-[11px] text-ink-0 font-mono mt-1">
              frontend/public/car.png
            </code>
            <br />
            <span className="text-ink-3 mt-2 block">
              Then refresh — the hotspots will appear on top of the image.
            </span>
          </div>
        ) : (
          <img
            src="/car.png"
            alt="FSAE car"
            className="w-full h-auto block select-none"
            draggable={false}
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Overlay — same dimensions as the image, scales with it.
            preserveAspectRatio="none" lets us use percent coords in viewBox. */}
        {!imgFailed && (
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="presentation"
          >
            {HOTSPOTS.map((h, i) => (
              <rect
                key={i}
                x={h.x}
                y={h.y}
                width={h.w}
                height={h.h}
                fill={active === h.key ? `${accent}33` : "transparent"}
                stroke={hover?.key === h.key ? accent : "transparent"}
                strokeWidth="0.35"
                className="cursor-pointer transition-colors duration-150"
                onMouseEnter={() =>
                  setHover({ key: h.key, note: h.note ?? LABELS[h.key] })
                }
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(h.key)}
              />
            ))}

            {/* SHOCKS — UI affordance, not a real car part. Two coil
                springs in the top-right corner of the overlay. Always
                drawn (image or no image). */}
            <g
              className="cursor-pointer"
              onMouseEnter={() =>
                setHover({ key: "dampers", note: LABELS.dampers })
              }
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect("dampers")}
              style={{
                filter:
                  active === "dampers"
                    ? `drop-shadow(0 0 1.5px ${accent})`
                    : undefined,
              }}
            >
              {/* SHOCKS header */}
              <text
                x="89"
                y="6.5"
                textAnchor="middle"
                fontSize="2.2"
                fontWeight="600"
                fill="#f1f5f9"
                fontFamily="Inter, sans-serif"
                letterSpacing="0.3"
                style={{ paintOrder: "stroke", stroke: "#0b1015", strokeWidth: 0.5 }}
              >
                SHOCKS
              </text>
              <SpringGlyph
                cx={84}
                cy={15}
                strokeMain={active === "dampers" ? accent : charcoalMid}
                strokeCoil={active === "dampers" ? accent : springGrey}
                label="R"
              />
              <SpringGlyph
                cx={94}
                cy={15}
                strokeMain={active === "dampers" ? accent : charcoalMid}
                strokeCoil={active === "dampers" ? accent : springGrey}
                label="F"
              />
            </g>
          </svg>
        )}
      </div>

      <div className="px-3 py-2 border-t border-edge text-[10px] text-ink-3 leading-snug">
        Hotspots are calibrated to a 1180×900 reference render. If a region is
        off, tell me which part and which direction to nudge it.
      </div>
    </div>
  );
}

/** Compact coil-spring icon drawn in the SVG overlay coordinate space.
 *  All dimensions are in viewBox units (0–100), so it stays correctly sized
 *  relative to the car image regardless of pixel scaling. */
function SpringGlyph({
  cx,
  cy,
  strokeMain,
  strokeCoil,
  label,
}: {
  cx: number;
  cy: number;
  strokeMain: string;
  strokeCoil: string;
  label: string;
}) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 5.5}
        textAnchor="middle"
        fontSize="1.8"
        fill="#94a3b8"
        fontFamily="JetBrains Mono, monospace"
        style={{ paintOrder: "stroke", stroke: "#0b1015", strokeWidth: 0.45 }}
      >
        {label}
      </text>
      <line x1={cx} y1={cy - 4.8} x2={cx} y2={cy - 3.4} stroke={strokeMain} strokeWidth="0.45" strokeLinecap="round" />
      <rect x={cx - 1.6} y={cy - 3.5} width="3.2" height="0.8" rx="0.2" fill={strokeMain} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - 2.2 + i * 0.9}
          rx="1.6"
          ry="0.55"
          fill="none"
          stroke={strokeCoil}
          strokeWidth="0.35"
        />
      ))}
      <rect x={cx - 1.6} y={cy + 3.4} width="3.2" height="0.8" rx="0.2" fill={strokeMain} />
      <line x1={cx} y1={cy + 4.2} x2={cx} y2={cy + 5.6} stroke={strokeMain} strokeWidth="0.45" strokeLinecap="round" />
    </g>
  );
}
