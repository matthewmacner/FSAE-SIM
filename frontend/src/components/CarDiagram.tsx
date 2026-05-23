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
 * Side-profile stylized FSAE car. The car faces left (front wing on the
 * left, rear wing on the right) — matches the typical FS press-photo
 * orientation. Each clickable region is a separate <g> with hover + selected
 * highlighting in the accent color.
 *
 * viewBox 700 × 280.
 */
export function CarDiagram({ selected, onSelect }: Props) {
  const [hover, setHover] = useState<PartKey | null>(null);
  const active = hover ?? selected;

  // Light-mode palette. Everything in the slate-100 ↔ slate-400 band.
  const baseStroke = "#94a3b8"; // slate-400
  const fillBody = "#f1f5f9"; // slate-100
  const fillMid = "#e2e8f0"; // slate-200
  const fillCockpit = "#ffffff"; // panel bg shows through
  const fillRubber = "#cbd5e1"; // slate-300 — soft tires
  const fillRim = "#f8fafc"; // slate-50 — wheel rim
  const fillEngine = "#e2e8f0";
  const fillHelmet = "#94a3b8";
  const fillVisor = "#475569";
  const susStroke = "#94a3b8";
  const brakeStroke = "#d97706";
  const accent = "#0d9488";

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
        <line x1="0" y1="240" x2="700" y2="240" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* ----------------------------------------------------- AERO */}
        <g {...partProps("aero")}>
          {/* Front wing — main plane */}
          <rect
            x="20"
            y="208"
            width="95"
            height="14"
            rx="2"
            fill={fillBody}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero")}
          />
          {/* Front wing flap (second element) */}
          <rect
            x="30"
            y="197"
            width="80"
            height="8"
            rx="2"
            fill={fillMid}
            stroke={partStroke("aero", "#cbd5e1")}
          />
          {/* Front wing endplate (vertical, visible from side) */}
          <rect
            x="14"
            y="190"
            width="8"
            height="42"
            rx="1.5"
            fill={fillMid}
            stroke={partStroke("aero")}
          />

          {/* Rear wing endplate (large vertical, signature FS shape) */}
          <path
            d="M 540 50 L 660 50 L 660 175 L 600 185 L 540 180 Z"
            fill={fillBody}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero")}
          />
          {/* Rear wing horizontal elements (multi-element wing) */}
          <line x1="540" y1="68" x2="660" y2="68" stroke={partStroke("aero", "#cbd5e1")} strokeWidth="1" />
          <line x1="540" y1="86" x2="660" y2="86" stroke={partStroke("aero", "#cbd5e1")} strokeWidth="1" />
          <line x1="540" y1="104" x2="660" y2="104" stroke={partStroke("aero", "#cbd5e1")} strokeWidth="1" />
          <line x1="540" y1="122" x2="660" y2="122" stroke={partStroke("aero", "#cbd5e1")} strokeWidth="1" />
          {/* Rear wing pylon connecting to body */}
          <rect
            x="555"
            y="125"
            width="6"
            height="55"
            fill={fillMid}
            stroke={partStroke("aero", "#cbd5e1")}
          />
        </g>

        {/* ------------------------------------------------- CHASSIS / BODY */}
        <g {...partProps("mass_geometry")}>
          {/* Nose cone — long tapered shape from front-wing area up to monocoque */}
          <path
            d="M 110 222 L 115 198 L 220 150 L 220 222 Z"
            fill={fillBody}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry")}
          />
          {/* Main monocoque — driver cell + rear bodywork */}
          <path
            d="M 220 150 L 260 115 L 350 105 L 425 138 L 540 150 L 540 222 L 220 222 Z"
            fill={fillBody}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry")}
          />
          {/* Cockpit opening — driver sits here */}
          <path
            d="M 268 132 L 333 122 L 348 152 L 290 152 Z"
            fill={fillCockpit}
            stroke={partStroke("mass_geometry", "#cbd5e1")}
            strokeWidth="0.8"
          />
          {/* Driver helmet */}
          <circle
            cx="305"
            cy="115"
            r="18"
            fill={fillHelmet}
            stroke={partStroke("mass_geometry")}
            strokeWidth="1"
          />
          {/* Helmet visor */}
          <path
            d="M 290 113 Q 305 105 320 113 L 320 119 L 290 119 Z"
            fill={fillVisor}
          />
          {/* Roll hoop — tall vertical bar behind driver */}
          <rect
            x="348"
            y="78"
            width="8"
            height="48"
            rx="2"
            fill={fillMid}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry")}
          />
          {/* Side mirror hint */}
          <rect x="248" y="135" width="6" height="4" rx="1" fill={fillMid} stroke="#cbd5e1" />
          {/* CG marker */}
          <g opacity="0.85">
            <circle
              cx="395"
              cy="190"
              r="6"
              fill="none"
              stroke={partStroke("mass_geometry", accent)}
              strokeWidth="0.9"
            />
            <line x1="389" y1="190" x2="401" y2="190" stroke={partStroke("mass_geometry", accent)} strokeWidth="0.9" />
            <line x1="395" y1="184" x2="395" y2="196" stroke={partStroke("mass_geometry", accent)} strokeWidth="0.9" />
          </g>
        </g>

        {/* ----------------------------------------------------- POWERTRAIN */}
        <g {...partProps("powertrain")}>
          {/* Engine bay visible behind driver — sits inside the body */}
          <rect
            x="360"
            y="155"
            width="170"
            height="60"
            rx="3"
            fill={fillEngine}
            stroke={partStroke("powertrain")}
            strokeWidth={partStrokeWidth("powertrain")}
          />
          {/* Engine cooling fins / cylinder hints */}
          {[375, 390, 405, 420, 435, 450, 465].map((x) => (
            <line
              key={x}
              x1={x}
              y1={165}
              x2={x}
              y2={205}
              stroke={partStroke("powertrain", "#94a3b8")}
              strokeWidth="1.2"
            />
          ))}
          {/* Sidepod intake hint */}
          <path
            d="M 480 162 L 525 162 L 522 195 L 480 195 Z"
            fill={fillMid}
            stroke={partStroke("powertrain", "#cbd5e1")}
            strokeWidth="0.8"
          />
          {/* Exhaust tip exiting at rear */}
          <rect x="530" y="180" width="18" height="8" rx="3" fill={fillMid} stroke={partStroke("powertrain", "#94a3b8")} />
        </g>

        {/* ----------------------------------------------------- SUSPENSION */}
        <g {...partProps("suspension")}>
          {/* Front upper A-arm — wheel hub → bulkhead high */}
          <line
            x1="170"
            y1="200"
            x2="225"
            y2="165"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          {/* Front lower A-arm */}
          <line
            x1="170"
            y1="218"
            x2="225"
            y2="210"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          {/* Front pushrod */}
          <line
            x1="180"
            y1="205"
            x2="235"
            y2="155"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 1.5)}
            strokeLinecap="round"
          />
          {/* Rear upper A-arm */}
          <line
            x1="490"
            y1="200"
            x2="445"
            y2="170"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          {/* Rear lower A-arm */}
          <line
            x1="490"
            y1="220"
            x2="445"
            y2="215"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 2.5)}
            strokeLinecap="round"
          />
          {/* Rear pushrod */}
          <line
            x1="480"
            y1="205"
            x2="438"
            y2="160"
            stroke={partStroke("suspension", susStroke)}
            strokeWidth={partStrokeWidth("suspension", 1.5)}
            strokeLinecap="round"
          />
        </g>

        {/* ---------------------------------------------------------- TIRES */}
        <g {...partProps("tire")}>
          {/* Front wheel — outer tire */}
          <circle
            cx="170"
            cy="210"
            r="32"
            fill={fillRubber}
            stroke={partStroke("tire", "#94a3b8")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          {/* Front wheel — inner rim */}
          <circle
            cx="170"
            cy="210"
            r="17"
            fill={fillRim}
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          {/* Spokes */}
          <line x1="170" y1="195" x2="170" y2="225" stroke="#94a3b8" strokeWidth="0.9" />
          <line x1="155" y1="210" x2="185" y2="210" stroke="#94a3b8" strokeWidth="0.9" />
          {/* Hub center */}
          <circle cx="170" cy="210" r="3" fill="#94a3b8" />

          {/* Rear wheel — slightly larger */}
          <circle
            cx="490"
            cy="210"
            r="36"
            fill={fillRubber}
            stroke={partStroke("tire", "#94a3b8")}
            strokeWidth={partStrokeWidth("tire", 1)}
          />
          <circle
            cx="490"
            cy="210"
            r="19"
            fill={fillRim}
            stroke="#cbd5e1"
            strokeWidth="0.8"
          />
          <line x1="490" y1="193" x2="490" y2="227" stroke="#94a3b8" strokeWidth="0.9" />
          <line x1="473" y1="210" x2="507" y2="210" stroke="#94a3b8" strokeWidth="0.9" />
          <circle cx="490" cy="210" r="3" fill="#94a3b8" />
        </g>

        {/* --------------------------------------------------------- BRAKES */}
        <g {...partProps("brakes")}>
          {/* Front brake caliper sitting on top of front-wheel rim */}
          <rect
            x="156"
            y="184"
            width="14"
            height="11"
            rx="2"
            fill={fillMid}
            stroke={partStroke("brakes", brakeStroke)}
            strokeWidth={partStrokeWidth("brakes", 1.5)}
          />
          {/* Rear brake caliper */}
          <rect
            x="476"
            y="180"
            width="14"
            height="12"
            rx="2"
            fill={fillMid}
            stroke={partStroke("brakes", brakeStroke)}
            strokeWidth={partStrokeWidth("brakes", 1.5)}
          />
        </g>

        {/* Direction labels — front/rear hints */}
        <g opacity="0.55">
          <polygon points="10,260 20,255 20,265" fill="#94a3b8" />
          <text
            x="34"
            y="263"
            fontSize="9"
            fill="#94a3b8"
            fontFamily="JetBrains Mono, monospace"
          >
            FRONT
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
            REAR
          </text>
        </g>
      </svg>
    </div>
  );
}
