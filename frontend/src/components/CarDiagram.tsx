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
 * Side-profile FSAE car. Facing right (front + nose-cone right, rear wing
 * left). Render-style livery: white body with a red stripe, dark charcoal
 * floor and wheels, a tall vertical rear-wing endplate, and a visible
 * roll-hoop truss — matches the reference render.
 *
 * viewBox 700 × 280. Six clickable groups with hover/select highlights.
 */
export function CarDiagram({ selected, onSelect }: Props) {
  const [hover, setHover] = useState<PartKey | null>(null);
  const active = hover ?? selected;

  // Livery palette — straight from the reference.
  const white = "#ffffff";
  const red = "#c8362e";
  const charcoal = "#2c2c2c"; // tires, floor
  const charcoalMid = "#3a3a3a"; // roll hoop, strokes
  const rimOuter = "#6a6a6a";
  const rimInner = "#8a8a8a";
  const accent = "#0d9488"; // teal — hover/select highlight

  const partProps = (key: PartKey) => ({
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover((h) => (h === key ? null : h)),
    onClick: () => onSelect(key),
    className: "cursor-pointer transition-all duration-150",
    style: {
      filter:
        active === key ? `drop-shadow(0 0 4px ${accent})` : undefined,
    },
  });

  const partStroke = (key: PartKey, fallback = charcoalMid) =>
    active === key ? accent : fallback;
  const partStrokeWidth = (key: PartKey, fallback = 1.2) =>
    active === key ? 2.4 : fallback;

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
        <line x1="0" y1="240" x2="700" y2="240" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* ================================================== AERO ====== */}
        <g {...partProps("aero")}>
          {/* Rear-wing endplate — large vertical slab with red stripe */}
          <path
            d="M 16 52 L 72 48 L 72 200 L 48 210 L 22 200 Z"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.5)}
            strokeLinejoin="round"
          />
          <path
            d="M 17 105 L 71 102 L 71 132 L 21 132 Z"
            fill={red}
          />
          {/* Wing main plane extending forward */}
          <path
            d="M 68 138 L 178 142 L 178 156 L 68 158 Z"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.2)}
            strokeLinejoin="round"
          />
          <rect x="68" y="148" width="110" height="3" fill={red} />

          {/* Front wing — small, low, ahead of front wheel */}
          <rect
            x="555"
            y="208"
            width="106"
            height="13"
            rx="1"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.5)}
          />
          <rect x="555" y="214" width="106" height="3.5" fill={red} />
          {/* Front-wing endplate (vertical) */}
          <path
            d="M 658 200 L 680 198 L 680 232 L 670 235 L 658 230 Z"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.5)}
            strokeLinejoin="round"
          />
          <rect x="660" y="210" width="20" height="6" fill={red} />
        </g>

        {/* ============================================ MASS & BODY ====== */}
        <g {...partProps("mass_geometry")}>
          {/* Dark charcoal floor / underbody — long flat plate */}
          <path
            d="M 95 222 L 95 200 L 555 200 L 660 215 L 660 222 Z"
            fill={charcoal}
            stroke={partStroke("mass_geometry", "#1a1a1a")}
            strokeWidth={partStrokeWidth("mass_geometry", 1)}
          />

          {/* Main body silhouette — white, single flowing path */}
          <path
            d="
              M 102 200
              L 102 178
              Q 122 162 165 158
              L 350 158
              L 360 170
              L 405 170
              L 415 158
              Q 480 170 545 192
              Q 600 204 640 210
              L 642 200
              L 102 200
              Z
            "
            fill={white}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry", 1.5)}
            strokeLinejoin="round"
          />

          {/* Red side stripe — follows the body contour */}
          <path
            d="
              M 110 172
              L 360 172
              L 415 172
              Q 480 184 545 200
              Q 580 207 615 211
              L 615 215
              Q 580 211 545 205
              Q 480 189 415 177
              L 360 177
              L 110 177
              Z
            "
            fill={red}
          />

          {/* Cockpit opening — dark interior */}
          <path
            d="M 360 170 L 405 170 L 405 184 L 365 184 Z"
            fill={charcoal}
            stroke="#1a1a1a"
            strokeWidth="0.8"
          />

          {/* Roll-hoop truss — multiple bars and a diagonal brace */}
          {/* Main hoop curve */}
          <path
            d="M 348 158 L 348 80 Q 360 64 376 76 L 376 158"
            fill="none"
            stroke={partStroke("mass_geometry", charcoalMid)}
            strokeWidth={partStrokeWidth("mass_geometry", 6)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Diagonal brace going to the back */}
          <line
            x1="362"
            y1="82"
            x2="318"
            y2="158"
            stroke={partStroke("mass_geometry", charcoalMid)}
            strokeWidth={partStrokeWidth("mass_geometry", 4)}
            strokeLinecap="round"
          />
          {/* Smaller forward brace */}
          <line
            x1="360"
            y1="120"
            x2="396"
            y2="158"
            stroke={partStroke("mass_geometry", charcoalMid)}
            strokeWidth={partStrokeWidth("mass_geometry", 3)}
            strokeLinecap="round"
          />

          {/* Wing mirror — small detail near front of cockpit */}
          <rect
            x="418"
            y="156"
            width="8"
            height="5"
            rx="1"
            fill={charcoalMid}
          />

          {/* CG marker */}
          <g opacity="0.9">
            <circle
              cx="280"
              cy="188"
              r="6"
              fill="none"
              stroke={partStroke("mass_geometry", accent)}
              strokeWidth="1"
            />
            <line x1="274" y1="188" x2="286" y2="188" stroke={partStroke("mass_geometry", accent)} strokeWidth="1" />
            <line x1="280" y1="182" x2="280" y2="194" stroke={partStroke("mass_geometry", accent)} strokeWidth="1" />
          </g>
        </g>

        {/* =========================================== POWERTRAIN ======== */}
        {/* Sidepod cooling intake on the side of the body, plus the
            airbox bulge on top and exhaust tip — surface accents that
            don't break the body silhouette. */}
        <g {...partProps("powertrain")}>
          {/* Sidepod cooling intake — dark slot on the side */}
          <path
            d="M 200 172 L 295 172 Q 308 178 308 184 Q 308 190 295 192 L 200 192 Z"
            fill="#1a1a1a"
            stroke={partStroke("powertrain")}
            strokeWidth={partStrokeWidth("powertrain", 1.2)}
            strokeLinejoin="round"
          />
          {/* Intake vanes / cooling fins */}
          {[212, 225, 238, 251, 264, 277].map((x) => (
            <line
              key={`fin-${x}`}
              x1={x}
              y1={175}
              x2={x}
              y2={189}
              stroke={partStroke("powertrain", "#5a5a5a")}
              strokeWidth="0.9"
            />
          ))}
          {/* Exhaust tip exiting at the rear */}
          <rect
            x="92"
            y="172"
            width="16"
            height="9"
            rx="2"
            fill="#1a1a1a"
            stroke={partStroke("powertrain", charcoalMid)}
            strokeWidth={partStrokeWidth("powertrain", 1)}
          />
        </g>

        {/* ============================================ SUSPENSION ======== */}
        <g {...partProps("suspension")}>
          {/* Rear suspension — wheel center (200, 210) */}
          <line
            x1="200"
            y1="200"
            x2="258"
            y2="172"
            stroke={partStroke("suspension", charcoalMid)}
            strokeWidth={partStrokeWidth("suspension", 2.4)}
            strokeLinecap="round"
          />
          <line
            x1="200"
            y1="222"
            x2="258"
            y2="210"
            stroke={partStroke("suspension", charcoalMid)}
            strokeWidth={partStrokeWidth("suspension", 2.4)}
            strokeLinecap="round"
          />
          <line
            x1="212"
            y1="210"
            x2="262"
            y2="158"
            stroke={partStroke("suspension", charcoalMid)}
            strokeWidth={partStrokeWidth("suspension", 1.6)}
            strokeLinecap="round"
          />

          {/* Front suspension — wheel center (510, 210) */}
          <line
            x1="510"
            y1="200"
            x2="450"
            y2="178"
            stroke={partStroke("suspension", charcoalMid)}
            strokeWidth={partStrokeWidth("suspension", 2.4)}
            strokeLinecap="round"
          />
          <line
            x1="510"
            y1="222"
            x2="450"
            y2="212"
            stroke={partStroke("suspension", charcoalMid)}
            strokeWidth={partStrokeWidth("suspension", 2.4)}
            strokeLinecap="round"
          />
          <line
            x1="500"
            y1="208"
            x2="450"
            y2="168"
            stroke={partStroke("suspension", charcoalMid)}
            strokeWidth={partStrokeWidth("suspension", 1.6)}
            strokeLinecap="round"
          />
        </g>

        {/* ================================================ TIRES ========== */}
        <g {...partProps("tire")}>
          {/* Rear wheel */}
          <circle
            cx="200"
            cy="210"
            r="40"
            fill={charcoal}
            stroke={partStroke("tire", "#1a1a1a")}
            strokeWidth={partStrokeWidth("tire", 1.2)}
          />
          {/* Outer rim */}
          <circle
            cx="200"
            cy="210"
            r="25"
            fill={rimOuter}
            stroke="#3a3a3a"
            strokeWidth="0.8"
          />
          {/* Inner hub disc */}
          <circle cx="200" cy="210" r="13" fill={rimInner} />
          {/* 5-spoke pattern */}
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            return (
              <line
                key={`rs-${angle}`}
                x1={200}
                y1={210}
                x2={200 + 24 * Math.cos(rad)}
                y2={210 + 24 * Math.sin(rad)}
                stroke="#3a3a3a"
                strokeWidth="1.6"
              />
            );
          })}
          {/* Center hub */}
          <circle cx="200" cy="210" r="4" fill="#1a1a1a" />

          {/* Front wheel */}
          <circle
            cx="510"
            cy="210"
            r="40"
            fill={charcoal}
            stroke={partStroke("tire", "#1a1a1a")}
            strokeWidth={partStrokeWidth("tire", 1.2)}
          />
          <circle
            cx="510"
            cy="210"
            r="25"
            fill={rimOuter}
            stroke="#3a3a3a"
            strokeWidth="0.8"
          />
          <circle cx="510" cy="210" r="13" fill={rimInner} />
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            return (
              <line
                key={`fs-${angle}`}
                x1={510}
                y1={210}
                x2={510 + 24 * Math.cos(rad)}
                y2={210 + 24 * Math.sin(rad)}
                stroke="#3a3a3a"
                strokeWidth="1.6"
              />
            );
          })}
          <circle cx="510" cy="210" r="4" fill="#1a1a1a" />
        </g>

        {/* ============================================== BRAKES =========== */}
        <g {...partProps("brakes")}>
          {/* Rear caliper */}
          <rect
            x="186"
            y="184"
            width="14"
            height="12"
            rx="2"
            fill="#1a1a1a"
            stroke={partStroke("brakes", "#d97706")}
            strokeWidth={partStrokeWidth("brakes", 1.6)}
          />
          {/* Front caliper */}
          <rect
            x="496"
            y="184"
            width="14"
            height="12"
            rx="2"
            fill="#1a1a1a"
            stroke={partStroke("brakes", "#d97706")}
            strokeWidth={partStrokeWidth("brakes", 1.6)}
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
