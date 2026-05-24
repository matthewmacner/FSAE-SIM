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
 * Side-profile FSAE car, facing right. The body silhouette is one
 * continuous white shape — bodywork + floor merged so the lower half
 * isn't a dark slab. Red stripe runs as a single path from rear bulkhead
 * to nose tip, both endpoints anchored to the body geometry. Shock
 * springs float in the top-right of the SVG, clearly clear of the car.
 *
 * viewBox 580 × 320.
 */
export function CarDiagram({ selected, onSelect }: Props) {
  const [hover, setHover] = useState<PartKey | null>(null);
  const active = hover ?? selected;

  // Livery palette.
  const white = "#ffffff";
  const red = "#c8362e";
  const charcoal = "#2c2c2c";
  const charcoalMid = "#3a3a3a";
  const rimOuter = "#6a6a6a";
  const rimInner = "#8a8a8a";
  const springGrey = "#5a5a5a";
  const accent = "#0d9488";

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
        viewBox="0 0 580 320"
        className="w-full h-auto bg-panel"
        role="img"
        aria-label="FSAE car side profile with clickable parts"
      >
        {/* Subtle ground line */}
        <line x1="0" y1="280" x2="580" y2="280" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* ================================================== AERO ====== */}
        <g {...partProps("aero")}>
          {/* Rear-wing endplate */}
          <path
            d="M 14 70 L 72 64 L 72 222 L 46 234 L 18 222 Z"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.6)}
            strokeLinejoin="round"
          />
          <path
            d="M 16 128 L 71 125 L 71 162 L 20 162 Z"
            fill={red}
          />
          {/* Rear-wing main element */}
          <path
            d="M 68 165 L 178 170 L 178 190 L 68 194 Z"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.3)}
            strokeLinejoin="round"
          />
          <rect x="68" y="178" width="110" height="3" fill={red} />

          {/* Front wing */}
          <rect
            x="455"
            y="244"
            width="105"
            height="15"
            rx="1.5"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.6)}
          />
          <rect x="455" y="251" width="105" height="3.5" fill={red} />
          <path
            d="M 553 232 L 577 229 L 577 268 L 567 273 L 553 266 Z"
            fill={white}
            stroke={partStroke("aero")}
            strokeWidth={partStrokeWidth("aero", 1.6)}
            strokeLinejoin="round"
          />
          <rect x="555" y="244" width="22" height="6" fill={red} />
        </g>

        {/* =========================================== MASS & BODY ====== */}
        {/* ONE continuous white silhouette: bodywork + underbody floor.
            Goes from bottom-back corner up the rear bulkhead, over the
            sidepod hump, through the cockpit dip, up to the dash, down
            the nose taper, and along the floor back to start. */}
        <g {...partProps("mass_geometry")}>
          <path
            d="
              M 78 270
              L 78 195
              Q 86 174 115 168
              Q 175 162 250 165
              Q 263 168 270 178
              L 270 192
              L 343 192
              L 343 178
              Q 351 167 363 165
              Q 408 173 455 200
              Q 488 220 510 220
              L 524 226
              L 532 250
              L 532 270
              L 78 270
              Z
            "
            fill={white}
            stroke={partStroke("mass_geometry")}
            strokeWidth={partStrokeWidth("mass_geometry", 1.6)}
            strokeLinejoin="round"
          />

          {/* Red stripe — one continuous band, endpoints align with rear
              bulkhead (x=80) and nose tip (x=508). Flat across sidepod and
              cockpit-floor area, then slopes down with the nose taper. */}
          <path
            d="
              M 80 200
              L 363 200
              Q 410 207 455 217
              Q 488 224 508 226
              L 508 232
              Q 488 230 455 223
              Q 410 213 363 206
              L 80 206
              Z
            "
            fill={red}
          />

          {/* Cockpit interior — dark patch inside the U-cutout */}
          <path
            d="M 270 192 L 343 192 L 343 206 L 277 206 Z"
            fill={charcoal}
          />

          {/* Roll-hoop truss */}
          <g>
            <line x1="258" y1="192" x2="258" y2="98" stroke={partStroke("mass_geometry", charcoalMid)} strokeWidth={partStrokeWidth("mass_geometry", 5.5)} strokeLinecap="round" />
            <line x1="284" y1="192" x2="284" y2="98" stroke={partStroke("mass_geometry", charcoalMid)} strokeWidth={partStrokeWidth("mass_geometry", 5.5)} strokeLinecap="round" />
            <path d="M 258 98 Q 271 82 284 98" fill="none" stroke={partStroke("mass_geometry", charcoalMid)} strokeWidth={partStrokeWidth("mass_geometry", 5.5)} strokeLinecap="round" />
            <line x1="276" y1="102" x2="235" y2="192" stroke={partStroke("mass_geometry", charcoalMid)} strokeWidth={partStrokeWidth("mass_geometry", 4)} strokeLinecap="round" />
            <line x1="266" y1="102" x2="305" y2="192" stroke={partStroke("mass_geometry", charcoalMid)} strokeWidth={partStrokeWidth("mass_geometry", 3.5)} strokeLinecap="round" />
          </g>

          {/* Wing mirror */}
          <rect x="346" y="188" width="9" height="5" rx="1" fill={charcoalMid} />

          {/* CG marker */}
          <g opacity="0.9">
            <circle cx="218" cy="240" r="6" fill="none" stroke={partStroke("mass_geometry", accent)} strokeWidth="1" />
            <line x1="212" y1="240" x2="224" y2="240" stroke={partStroke("mass_geometry", accent)} strokeWidth="1" />
            <line x1="218" y1="234" x2="218" y2="246" stroke={partStroke("mass_geometry", accent)} strokeWidth="1" />
          </g>
        </g>

        {/* ============================================ POWERTRAIN ===== */}
        <g {...partProps("powertrain")}>
          <path
            d="
              M 138 198
              Q 145 192 162 191
              L 240 191
              Q 258 193 263 202
              Q 263 213 246 215
              L 162 215
              Q 145 213 138 208
              Q 132 203 138 198
              Z
            "
            fill="#1a1a1a"
            stroke={partStroke("powertrain")}
            strokeWidth={partStrokeWidth("powertrain", 1.2)}
            strokeLinejoin="round"
          />
          {[155, 167, 179, 191, 203, 215, 227, 239].map((x) => (
            <line
              key={`vane-${x}`}
              x1={x}
              y1={196}
              x2={x}
              y2={211}
              stroke={partStroke("powertrain", "#5a5a5a")}
              strokeWidth="0.9"
            />
          ))}
          <rect
            x="76"
            y="196"
            width="14"
            height="9"
            rx="2"
            fill="#1a1a1a"
            stroke={partStroke("powertrain", charcoalMid)}
            strokeWidth={partStrokeWidth("powertrain", 1)}
          />
        </g>

        {/* ============================================= SUSPENSION ===== */}
        <g {...partProps("suspension")}>
          <line x1="170" y1="220" x2="248" y2="192" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
          <line x1="170" y1="246" x2="248" y2="230" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
          <line x1="180" y1="232" x2="248" y2="178" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 1.6)} strokeLinecap="round" />
          <line x1="410" y1="220" x2="353" y2="195" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
          <line x1="410" y1="246" x2="353" y2="234" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
          <line x1="400" y1="232" x2="353" y2="180" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 1.6)} strokeLinecap="round" />
        </g>

        {/* ================================================== TIRES ===== */}
        <g {...partProps("tire")}>
          <circle cx="170" cy="232" r="46" fill={charcoal} stroke={partStroke("tire", "#1a1a1a")} strokeWidth={partStrokeWidth("tire", 1.3)} />
          <circle cx="170" cy="232" r="27" fill={rimOuter} stroke="#3a3a3a" strokeWidth="0.8" />
          <circle cx="170" cy="232" r="15" fill={rimInner} />
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            return <line key={`rs-${angle}`} x1={170} y1={232} x2={170 + 26 * Math.cos(rad)} y2={232 + 26 * Math.sin(rad)} stroke="#3a3a3a" strokeWidth="1.7" />;
          })}
          <circle cx="170" cy="232" r="5" fill="#1a1a1a" />

          <circle cx="410" cy="232" r="46" fill={charcoal} stroke={partStroke("tire", "#1a1a1a")} strokeWidth={partStrokeWidth("tire", 1.3)} />
          <circle cx="410" cy="232" r="27" fill={rimOuter} stroke="#3a3a3a" strokeWidth="0.8" />
          <circle cx="410" cy="232" r="15" fill={rimInner} />
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            return <line key={`fs-${angle}`} x1={410} y1={232} x2={410 + 26 * Math.cos(rad)} y2={232 + 26 * Math.sin(rad)} stroke="#3a3a3a" strokeWidth="1.7" />;
          })}
          <circle cx="410" cy="232" r="5" fill="#1a1a1a" />
        </g>

        {/* =============================================== BRAKES ========= */}
        <g {...partProps("brakes")}>
          <rect x="156" y="205" width="14" height="13" rx="2" fill="#1a1a1a" stroke={partStroke("brakes", "#d97706")} strokeWidth={partStrokeWidth("brakes", 1.6)} />
          <rect x="396" y="205" width="14" height="13" rx="2" fill="#1a1a1a" stroke={partStroke("brakes", "#d97706")} strokeWidth={partStrokeWidth("brakes", 1.6)} />
        </g>

        {/* ================================================== SHOCKS ====== */}
        {/* Two coil springs floating in the top-right of the SVG, well
            clear of the car. Labelled R / F so it's obvious which is
            which. Click either to open the Shocks panel. */}
        <g {...partProps("dampers")}>
          <text
            x="486"
            y="28"
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="#64748b"
            fontFamily="Inter, sans-serif"
            letterSpacing="1.4"
          >
            SHOCKS
          </text>
          {/* Rear shock (R) */}
          <g transform="translate(458, 78)">
            <text x="0" y="-32" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">R</text>
            <line x1="0" y1="-26" x2="0" y2="-14" stroke={partStroke("dampers", charcoalMid)} strokeWidth="2.4" strokeLinecap="round" />
            <rect x="-7" y="-15" width="14" height="3.5" rx="1" fill={partStroke("dampers", charcoalMid)} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse
                key={`r-coil-${i}`}
                cx="0"
                cy={-9 + i * 4.5}
                rx="7"
                ry="2.4"
                fill="none"
                stroke={partStroke("dampers", springGrey)}
                strokeWidth={partStrokeWidth("dampers", 1.5)}
              />
            ))}
            <rect x="-7" y="18" width="14" height="3.5" rx="1" fill={partStroke("dampers", charcoalMid)} />
            <line x1="0" y1="21" x2="0" y2="30" stroke={partStroke("dampers", charcoalMid)} strokeWidth="2.4" strokeLinecap="round" />
          </g>
          {/* Front shock (F) */}
          <g transform="translate(514, 78)">
            <text x="0" y="-32" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">F</text>
            <line x1="0" y1="-26" x2="0" y2="-14" stroke={partStroke("dampers", charcoalMid)} strokeWidth="2.4" strokeLinecap="round" />
            <rect x="-7" y="-15" width="14" height="3.5" rx="1" fill={partStroke("dampers", charcoalMid)} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse
                key={`f-coil-${i}`}
                cx="0"
                cy={-9 + i * 4.5}
                rx="7"
                ry="2.4"
                fill="none"
                stroke={partStroke("dampers", springGrey)}
                strokeWidth={partStrokeWidth("dampers", 1.5)}
              />
            ))}
            <rect x="-7" y="18" width="14" height="3.5" rx="1" fill={partStroke("dampers", charcoalMid)} />
            <line x1="0" y1="21" x2="0" y2="30" stroke={partStroke("dampers", charcoalMid)} strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </g>

        {/* Direction labels */}
        <g opacity="0.55">
          <polygon points="10,300 20,295 20,305" fill="#94a3b8" />
          <text x="34" y="303" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">
            REAR
          </text>
        </g>
        <g opacity="0.55">
          <polygon points="430,300 420,295 420,305" fill="#94a3b8" />
          <text x="380" y="303" textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">
            FRONT
          </text>
        </g>
      </svg>
    </div>
  );
}
