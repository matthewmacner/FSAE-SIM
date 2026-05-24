import { useState } from "react";

export type PartKey =
  | "mass_geometry"
  | "suspension"
  | "tire"
  | "aero"
  | "powertrain"
  | "brakes";

const LABELS: Record<PartKey, string> = {
  mass_geometry: "Mass & geometry",
  suspension: "Suspension",
  tire: "Tires",
  aero: "Aerodynamics",
  powertrain: "Powertrain",
  brakes: "Brakes",
};

interface Props {
  selected: PartKey | null;
  onSelect: (part: PartKey) => void;
}

/**
 * Side-profile stylized FSAE car, facing RIGHT (rear wing on the left,
 * nose cone + front wing on the right). The body is drawn as a single
 * flowing silhouette — engine cover hump, cockpit dip, dash, nose-cone
 * taper — rather than a collage of rectangles, so it reads as one car
 * instead of a bunch of pieces.
 *
 * Powertrain is represented by surface details on the body (sidepod
 * grille, airbox bulge, exhaust) so its hotspot doesn't break the
 * silhouette.
 *
 * viewBox 700 × 280.
 */
export function CarDiagram({ selected, onSelect }: Props) {
  const [hover, setHover] = useState<PartKey | null>(null);
  const active = hover ?? selected;

  // Soft slate palette. Everything sits in the slate-100..slate-400 band so
  // the silhouette stays airy on a white panel — a clay-model look.
  const baseStroke = "#94a3b8"; // slate-400
  const fillBody = "#f1f5f9"; // slate-100 — main body
  const fillMid = "#e2e8f0"; // slate-200 — sub-elements
  const fillCockpit = "#cbd5e1"; // slate-300 — cockpit interior
  const fillRubber = "#cbd5e1"; // slate-300 — tires
  const fillRim = "#f8fafc"; // slate-50 — wheel rims
  const fillHelmet = "#94a3b8"; // slate-400 — driver helmet
  const fillVisor = "#475569"; // slate-700 — visor
  const susStroke = "#94a3b8";
  const brakeStroke = "#d97706"; // amber-600
  const accent = "#0d9488"; // teal-600

  const partProps = (key: PartKey) => ({
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover((h) => (h === key ? null : h)),
    onClick: () => onSelect(key),
    className: "cursor-pointer transition-all duration-150",
    style: {
      filter:
        active === key ? `drop-shadow(0 0 3px ${accent})` : undefined,
    },
  });

  const partStroke = (key: PartKey, fallback = baseStroke) =>
    active === key ? accent : fallback;
  const partStrokeWidth = (key: PartKey, fallback = 1) =>
    active === key ? 2 : fallback;

  return (
    <div className="flex flex-col">
      <div className="px-3 py-2 border-b border-edge flex items-baseline justify-between">
        <span className="eyebrow">Click a part</span>
        <span className="text-[11px] text-ink-2 h-4">
          {active ? LABELS[active] : ""}
        </span>
      </div>

      <svg
        viewBox="0 0 700 280"
        className="w-full h-auto bg-panel"
        role="img"
        aria-label="FSAE car side profile with clickable parts"
      >
        {/* Subtle ground line */}
        <line
          x1="0"
          y1="240"
          x2="700"
          y2="240"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        {/* =================================================== AERO ===== */}
        <g {...partProps("aero")}>
          {/* Rear wing — left side. Endplate is a tall slim shape. */}
          <path
            d="M 22 58 L 56 58 L 56 168 L 38 176 L 22 170 Z"
            fill={fillBody}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero")}
          />
          {/* Rear-wing horizontal elements (multi-element) */}
          {[68, 84, 100, 116].map((y) => (
            <rect
              key={`rw-${y}`}
              x="22"
              y={y}
              width="138"
              height="6"
              rx="1.5"
              fill={fillMid}
              stroke={partStroke("aero", "#cbd5e1")}
              strokeWidth="0.8"
            />
          ))}
          {/* Rear-wing pylons connecting to body */}
          <path
            d="M 118 122 L 125 122 L 125 152 L 118 158 Z"
            fill={fillMid}
            stroke={partStroke("aero", "#cbd5e1")}
          />
          <path
            d="M 150 122 L 157 122 L 157 152 L 150 158 Z"
            fill={fillMid}
            stroke={partStroke("aero", "#cbd5e1")}
          />

          {/* Front wing — right side, low and slightly ahead of front wheel */}
          <rect
            x="555"
            y="212"
            width="105"
            height="11"
            rx="2"
            fill={fillBody}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero")}
          />
          {/* Secondary flap above the main plane */}
          <rect
            x="572"
            y="201"
            width="82"
            height="7"
            rx="1.5"
            fill={fillMid}
            stroke={partStroke("aero", "#cbd5e1")}
          />
          {/* Front wing endplate (vertical) */}
          <path
            d="M 658 195 L 676 195 L 676 232 L 666 234 L 658 230 Z"
            fill={fillMid}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero")}
          />
        </g>

        {/* =========================================== MASS & BODY ===== */}
        <g {...partProps("mass_geometry")}>
          {/* The body silhouette is one continuous path:
              floor → up at rear bulkhead → engine-cover hump → over the
              cockpit dip → dash → long nose-cone taper → nose tip → floor.
              Uses quadratic beziers so curves stay smooth. */}
          <path
            d="
              M 110 222
              L 110 138
              Q 132 92 200 90
              Q 270 90 322 122
              L 348 122
              L 358 128
              L 366 148
              L 408 148
              L 416 132
              Q 488 160 555 200
              Q 598 218 624 222
              L 110 222
              Z
            "
            fill={fillBody}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry")}
            strokeLinejoin="round"
          />

          {/* Cockpit interior — sits in the dip in the silhouette */}
          <path
            d="M 366 148 L 408 148 L 408 170 L 367 170 Z"
            fill={fillCockpit}
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />

          {/* Roll hoop — BEHIND the helmet (to the left, since facing right) */}
          <rect
            x="350"
            y="62"
            width="9"
            height="80"
            rx="2"
            fill={fillMid}
            stroke={partStroke("mass_geometry", "#94a3b8")}
            strokeWidth={partStrokeWidth("mass_geometry")}
          />

          {/* Driver helmet */}
          <circle
            cx="386"
            cy="112"
            r="19"
            fill={fillHelmet}
            stroke={partStroke("mass_geometry")}
            strokeWidth="1"
          />
          {/* Helmet visor — faces forward (right) */}
          <path
            d="M 387 104 Q 403 107 403 121 L 403 126 L 387 126 Z"
            fill={fillVisor}
          />

          {/* Wing mirror */}
          <rect
            x="417"
            y="138"
            width="7"
            height="4"
            rx="1"
            fill={fillMid}
            stroke="#cbd5e1"
          />

          {/* CG marker — center of the chassis */}
          <g opacity="0.85">
            <circle
              cx="325"
              cy="195"
              r="6"
              fill="none"
              stroke={partStroke("mass_geometry", accent)}
              strokeWidth="0.9"
            />
            <line
              x1="319"
              y1="195"
              x2="331"
              y2="195"
              stroke={partStroke("mass_geometry", accent)}
              strokeWidth="0.9"
            />
            <line
              x1="325"
              y1="189"
              x2="325"
              y2="201"
              stroke={partStroke("mass_geometry", accent)}
              strokeWidth="0.9"
            />
          </g>
        </g>

        {/* ============================================ POWERTRAIN ===== */}
        {/* Powertrain reads as surface accents on the body silhouette: side-
            pod cooling grille, airbox bulge on top of the engine cover, and
            exhaust tip at the rear. Keeps the chassis silhouette intact. */}
        <g {...partProps("powertrain")}>
          {/* Sidepod cooling grille */}
          <rect
            x="160"
            y="160"
            width="100"
            height="32"
            rx="3"
            fill={fillMid}
            stroke={partStroke("powertrain")}
            strokeWidth={partStrokeWidth("powertrain")}
          />
          {[170, 182, 194, 206, 218, 230, 242, 254].map((x) => (
            <line
              key={`fin-${x}`}
              x1={x}
              y1={164}
              x2={x}
              y2={188}
              stroke={partStroke("powertrain", "#94a3b8")}
              strokeWidth="0.9"
            />
          ))}
          {/* Airbox bulge on top of the engine cover */}
          <ellipse
            cx="220"
            cy="92"
            rx="32"
            ry="11"
            fill={fillMid}
            stroke={partStroke("powertrain")}
            strokeWidth={partStrokeWidth("powertrain")}
          />
          {/* Airbox intake snorkel — tiny */}
          <rect
            x="216"
            y="77"
            width="10"
            height="8"
            rx="2"
            fill={fillMid}
            stroke={partStroke("powertrain", "#94a3b8")}
            strokeWidth="0.8"
          />
          {/* Exhaust tip exiting at the rear */}
          <rect
            x="98"
            y="170"
            width="18"
            height="10"
            rx="3"
            fill={fillMid}
            stroke={partStroke("powertrain", "#94a3b8")}
            strokeWidth={partStrokeWidth("powertrain", 1)}
          />
        </g>

        {/* ============================================ SUSPENSION ===== */}
        <g {...partProps("suspension")}>
          {/* Rear suspension — wheel center at (200, 210) */}
          <line
            x1="200"
            y1="200"
            x2="252"
            y2="168"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          <line
            x1="200"
            y1="220"
            x2="252"
            y2="215"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          {/* Rear pushrod (thinner) */}
          <line
            x1="210"
            y1="208"
            x2="255"
            y2="158"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 1.5)}
            strokeLinecap="round"
          />

          {/* Front suspension — wheel center at (500, 210) */}
          <line
            x1="500"
            y1="200"
            x2="450"
            y2="172"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          <line
            x1="500"
            y1="220"
            x2="450"
            y2="218"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          {/* Front pushrod */}
          <line
            x1="492"
            y1="208"
            x2="446"
            y2="160"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 1.5)}
            strokeLinecap="round"
          />
        </g>

        {/* ================================================ TIRES ===== */}
        <g {...partProps("tire")}>
          {/* Rear wheel */}
          <circle
            cx="200"
            cy="210"
            r="38"
            fill={fillRubber}
            stroke={partStroke("tire", "#94a3b8")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          <circle
            cx="200"
            cy="210"
            r="21"
            fill={fillRim}
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          {/* 5-spoke rim pattern */}
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            return (
              <line
                key={`rs-${angle}`}
                x1={200}
                y1={210}
                x2={200 + 20 * Math.cos(rad)}
                y2={210 + 20 * Math.sin(rad)}
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
            );
          })}
          <circle cx="200" cy="210" r="3.5" fill="#94a3b8" />

          {/* Front wheel — slightly smaller */}
          <circle
            cx="500"
            cy="210"
            r="34"
            fill={fillRubber}
            stroke={partStroke("tire", "#94a3b8")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          <circle
            cx="500"
            cy="210"
            r="18"
            fill={fillRim}
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            return (
              <line
                key={`fs-${angle}`}
                x1={500}
                y1={210}
                x2={500 + 17 * Math.cos(rad)}
                y2={210 + 17 * Math.sin(rad)}
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
            );
          })}
          <circle cx="500" cy="210" r="3.5" fill="#94a3b8" />
        </g>

        {/* =============================================== BRAKES ===== */}
        <g {...partProps("brakes")}>
          {/* Rear brake caliper — atop the rim */}
          <rect
            x="186"
            y="183"
            width="14"
            height="12"
            rx="2"
            fill={fillMid}
            stroke={partStroke("brakes", brakeStroke)}
            strokeWidth={partStrokeWidth("brakes", 1.5)}
          />
          {/* Front brake caliper */}
          <rect
            x="486"
            y="185"
            width="14"
            height="11"
            rx="2"
            fill={fillMid}
            stroke={partStroke("brakes", brakeStroke)}
            strokeWidth={partStrokeWidth("brakes", 1.5)}
          />
        </g>

        {/* Direction labels */}
        <g opacity="0.55">
          <polygon points="10,260 20,255 20,265" fill="#94a3b8" />
          <text
            x="34"
            y="263"
            fontSize="9"
            fill="#94a3b8"
            fontFamily="JetBrains Mono, monospace"
          >
            REAR
          </text>
        </g>
        <g opacity="0.55">
          <polygon points="690,260 680,255 680,265" fill="#94a3b8" />
          <text
            x="640"
            y="263"
            textAnchor="end"
            fontSize="9"
            fill="#94a3b8"
            fontFamily="JetBrains Mono, monospace"
          >
            FRONT
          </text>
        </g>
      </svg>
    </div>
  );
}
