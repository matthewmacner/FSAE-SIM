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
  onSelect: (part: PartKey) => void;
}

/**
 * Top-down stylized FSAE car. Each clickable region is a separate <g> that
 * lights up on hover and opens the corresponding parameter panel on click.
 *
 * viewBox is 400 × 720; the parent gives it the column it should fit.
 */
export function CarDiagram({ onSelect }: Props) {
  const [hover, setHover] = useState<PartKey | null>(null);

  // Light-mode palette. The panel background is white, so the car is rendered
  // in slate tones to stand out against the surface.
  const baseStroke = "#94a3b8"; // slate-400
  const fillBody = "#f1f5f9"; // slate-100
  const fillMid = "#e2e8f0"; // slate-200
  const fillCockpit = "#ffffff"; // shows panel bg through the cockpit hole
  const fillRubber = "#334155"; // slate-700 — tires
  const fillEngine = "#cbd5e1"; // slate-300
  const susStroke = "#64748b"; // slate-500
  const brakeStroke = "#d97706"; // amber-600 — warm accent for brakes
  const accent = "#0d9488"; // teal-600

  const partProps = (key: PartKey) => ({
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover((h) => (h === key ? null : h)),
    onClick: () => onSelect(key),
    className: "cursor-pointer transition-all duration-150",
    style: {
      filter:
        hover === key ? `drop-shadow(0 0 3px ${accent})` : undefined,
    },
  });

  const partStroke = (key: PartKey, fallback = baseStroke) =>
    hover === key ? accent : fallback;
  const partStrokeWidth = (key: PartKey, fallback = 1) =>
    hover === key ? 2 : fallback;

  return (
    <div className="flex flex-col items-stretch">
      <div className="px-3 py-2 border-b border-edge flex items-baseline justify-between">
        <span className="eyebrow">Click a part</span>
        <span className="text-[11px] text-ink-2 h-4">
          {hover ? LABELS[hover] : ""}
        </span>
      </div>

      <svg
        viewBox="0 0 400 720"
        className="w-full h-auto bg-panel"
        role="img"
        aria-label="FSAE car diagram with clickable parts"
      >
        {/* ------------------------------------------------------------ AERO */}
        {/* Front wing */}
        <g {...partProps("aero")}>
          <rect
            x="90"
            y="18"
            width="220"
            height="34"
            rx="5"
            fill={fillBody}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero")}
          />
          {/* Front wing flaps */}
          <line x1="100" y1="30" x2="300" y2="30" stroke={partStroke("aero", "#cbd5e1")} strokeWidth={0.7} />
          <line x1="100" y1="40" x2="300" y2="40" stroke={partStroke("aero", "#cbd5e1")} strokeWidth={0.7} />
          {/* Front wing endplates */}
          <rect x="85" y="18" width="6" height="50" rx="2" fill={fillMid} stroke={partStroke("aero")} />
          <rect x="309" y="18" width="6" height="50" rx="2" fill={fillMid} stroke={partStroke("aero")} />

          {/* Rear wing */}
          <rect
            x="65"
            y="600"
            width="270"
            height="50"
            rx="6"
            fill={fillBody}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero")}
          />
          <line x1="75" y1="615" x2="325" y2="615" stroke={partStroke("aero", "#cbd5e1")} strokeWidth={0.7} />
          <line x1="75" y1="630" x2="325" y2="630" stroke={partStroke("aero", "#cbd5e1")} strokeWidth={0.7} />
          <line x1="75" y1="645" x2="325" y2="645" stroke={partStroke("aero", "#cbd5e1")} strokeWidth={0.7} />
          {/* Rear wing endplates */}
          <rect x="60" y="600" width="6" height="65" rx="2" fill={fillMid} stroke={partStroke("aero")} />
          <rect x="334" y="600" width="6" height="65" rx="2" fill={fillMid} stroke={partStroke("aero")} />
          {/* Rear wing pillars */}
          <rect x="170" y="525" width="8" height="80" fill={fillMid} stroke={partStroke("aero", "#cbd5e1")} />
          <rect x="222" y="525" width="8" height="80" fill={fillMid} stroke={partStroke("aero", "#cbd5e1")} />
        </g>

        {/* ---------------------------------------------------- MASS & BODY */}
        <g {...partProps("mass_geometry")}>
          {/* Front nose (taper from wing to body) */}
          <path
            d="M 180 55 L 220 55 L 245 130 L 155 130 Z"
            fill={fillBody}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry")}
          />
          {/* Main chassis */}
          <rect
            x="150"
            y="130"
            width="100"
            height="380"
            rx="6"
            fill={fillBody}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry")}
          />
          {/* Cockpit opening — fills with panel background to look "open" */}
          <rect
            x="170"
            y="180"
            width="60"
            height="110"
            rx="20"
            fill={fillCockpit}
            stroke={partStroke("mass_geometry", "#cbd5e1")}
            strokeWidth={0.8}
          />
          {/* Seat back / roll hoop position */}
          <rect
            x="160"
            y="290"
            width="80"
            height="14"
            rx="3"
            fill={fillMid}
            stroke={partStroke("mass_geometry", "#94a3b8")}
          />
          {/* Steering wheel hint */}
          <circle cx="200" cy="210" r="10" fill="none" stroke={partStroke("mass_geometry", "#94a3b8")} strokeWidth={1.2} />
          {/* CG marker */}
          <g opacity="0.85">
            <circle cx="200" cy="335" r="6" fill="none" stroke={partStroke("mass_geometry", accent)} strokeWidth={0.9} />
            <line x1="194" y1="335" x2="206" y2="335" stroke={partStroke("mass_geometry", accent)} strokeWidth={0.9} />
            <line x1="200" y1="329" x2="200" y2="341" stroke={partStroke("mass_geometry", accent)} strokeWidth={0.9} />
          </g>
        </g>

        {/* -------------------------------------------------------- POWERTRAIN */}
        <g {...partProps("powertrain")}>
          {/* Engine block in rear of chassis */}
          <rect
            x="160"
            y="370"
            width="80"
            height="110"
            rx="4"
            fill={fillEngine}
            stroke={partStroke("powertrain")}
            strokeWidth={partStrokeWidth("powertrain")}
          />
          {/* Engine cylinders (combustion hint) */}
          {[170, 183, 197, 210, 223, 236].map((x) => (
            <line
              key={x}
              x1={x}
              y1={385}
              x2={x}
              y2={465}
              stroke={partStroke("powertrain", "#94a3b8")}
              strokeWidth={1.4}
            />
          ))}
          {/* Exhaust */}
          <circle cx="244" cy="495" r="5" fill={fillMid} stroke={partStroke("powertrain", "#94a3b8")} />
        </g>

        {/* -------------------------------------------------------- SUSPENSION */}
        {/* Visible A-arms between wheel and chassis at each corner. */}
        <g {...partProps("suspension")}>
          {/* Front-left A-arms */}
          <polyline
            points="80,110  152,140  80,160"
            fill="none"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Front-right A-arms */}
          <polyline
            points="320,110  248,140  320,160"
            fill="none"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Rear-left A-arms */}
          <polyline
            points="80,440  152,470  80,490"
            fill="none"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Rear-right A-arms */}
          <polyline
            points="320,440  248,470  320,490"
            fill="none"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Anti-roll bar hint — small bar across the front */}
          <rect
            x="155"
            y="115"
            width="90"
            height="3"
            rx="1"
            fill={partStroke("suspension", susStroke)}
          />
          <rect
            x="155"
            y="447"
            width="90"
            height="3"
            rx="1"
            fill={partStroke("suspension", susStroke)}
          />
        </g>

        {/* ------------------------------------------------------------ TIRES */}
        <g {...partProps("tire")}>
          {/* Front-left */}
          <rect
            x="35"
            y="95"
            width="46"
            height="80"
            rx="9"
            fill={fillRubber}
            stroke={partStroke("tire", "#1e293b")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          {/* Front-right */}
          <rect
            x="319"
            y="95"
            width="46"
            height="80"
            rx="9"
            fill={fillRubber}
            stroke={partStroke("tire", "#1e293b")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          {/* Rear-left */}
          <rect
            x="33"
            y="425"
            width="48"
            height="86"
            rx="10"
            fill={fillRubber}
            stroke={partStroke("tire", "#1e293b")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          {/* Rear-right */}
          <rect
            x="319"
            y="425"
            width="48"
            height="86"
            rx="10"
            fill={fillRubber}
            stroke={partStroke("tire", "#1e293b")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          {/* Tread hints */}
          {[
            [40, 105], [40, 125], [40, 145], [40, 165],
            [324, 105], [324, 125], [324, 145], [324, 165],
            [38, 435], [38, 455], [38, 475], [38, 495],
            [324, 435], [324, 455], [324, 475], [324, 495],
          ].map(([x, y], i) => (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x + 38}
              y2={y}
              stroke={partStroke("tire", "#64748b")}
              strokeWidth={0.6}
            />
          ))}
        </g>

        {/* ----------------------------------------------------------- BRAKES */}
        <g {...partProps("brakes")}>
          {/* Brake rotors visible as discs inboard of each wheel */}
          {[
            [88, 135], [312, 135], [88, 468], [312, 468],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={hover === "brakes" ? 10 : 8}
                fill={fillMid}
                stroke={partStroke("brakes", brakeStroke)}
                strokeWidth={partStrokeWidth("brakes", 1.5)}
              />
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={fillRubber}
                stroke={partStroke("brakes", "#94a3b8")}
                strokeWidth={0.6}
              />
            </g>
          ))}
        </g>

        {/* Direction arrows — purely decorative */}
        <g opacity="0.55">
          <line x1="200" y1="690" x2="200" y2="708" stroke="#94a3b8" strokeWidth={1} />
          <polygon points="200,683 195,695 205,695" fill="#94a3b8" />
          <text
            x="200"
            y="715"
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
            fontFamily="JetBrains Mono, monospace"
          >
            REAR
          </text>
        </g>
        <g opacity="0.55">
          <polygon points="200,10 195,2 205,2" fill="#94a3b8" />
          <text
            x="200"
            y="14"
            textAnchor="middle"
            fontSize="9"
            fill="#94a3b8"
            fontFamily="JetBrains Mono, monospace"
          >
            FRONT
          </text>
        </g>
      </svg>

      <div className="px-3 py-2 border-t border-edge text-[10px] text-ink-3 leading-snug">
        Each part of the car opens its parameters in a panel. The Save / Load /
        Compare controls stay in the top bar.
      </div>
    </div>
  );
}
