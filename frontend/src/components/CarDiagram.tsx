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
 * Side-profile FSAE car diagram with clickable parts. Renders a stylized
 * hand-drawn SVG by default; if you drop a custom image at
 * `frontend/public/car.png`, the component prefers that and overlays the
 * same hotspot regions on top of it.
 *
 * Drawing principles:
 * - Body is ONE smooth path with no straight segments between joints.
 * - Roll hoop is a single curved arch + one diagonal brace (not an
 *   antenna of parallel bars).
 * - Cockpit is a dark ellipse drawn on top of the body, not a U-cutout.
 * - Red stripe is one continuous path that follows the body contour.
 * - Wheels are large (r=42) and dominate the silhouette like real FSAE.
 *
 * viewBox 580 × 280.
 */
export function CarDiagram({ selected, onSelect }: Props) {
  const [hover, setHover] = useState<PartKey | null>(null);
  const [useImage, setUseImage] = useState(true);
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
        active === key ? `drop-shadow(0 0 3px ${accent})` : undefined,
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

      <div className="relative w-full bg-panel">
        {useImage && (
          // Hidden probe — if /car.png loads we replace the SVG entirely.
          // Once it fails we never try again.
          <img
            src="/car.png"
            alt=""
            className="hidden"
            onLoad={() => {
              /* image is present — flip into image mode */
              const overlay = document.getElementById("car-image-mode");
              if (overlay) overlay.style.display = "block";
              const svgMode = document.getElementById("car-svg-mode");
              if (svgMode) svgMode.style.display = "none";
            }}
            onError={() => setUseImage(false)}
          />
        )}

        {/* Image mode (only shown if /car.png exists) */}
        <div id="car-image-mode" style={{ display: "none" }}>
          <img
            src="/car.png"
            alt="FSAE car"
            className="w-full h-auto block select-none"
            draggable={false}
          />
        </div>

        {/* SVG mode — default */}
        <svg
          id="car-svg-mode"
          viewBox="0 0 580 280"
          className="w-full h-auto block"
          role="img"
          aria-label="FSAE car side profile with clickable parts"
        >
          {/* Subtle ground line */}
          <line x1="0" y1="255" x2="580" y2="255" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* ============================================== AERO =========== */}
          <g {...partProps("aero")}>
            {/* Rear-wing endplate */}
            <path
              d="M 16 70 L 70 65 L 70 198 L 44 208 L 20 198 Z"
              fill={white}
              stroke={partStroke("aero")}
              strokeWidth={partStrokeWidth("aero", 1.5)}
              strokeLinejoin="round"
            />
            {/* Red horizontal band on endplate */}
            <path d="M 18 115 L 69 112 L 69 142 L 22 142 Z" fill={red} />
            {/* Rear-wing main element */}
            <path
              d="M 66 148 L 168 152 L 168 168 L 66 170 Z"
              fill={white}
              stroke={partStroke("aero")}
              strokeWidth={partStrokeWidth("aero", 1.2)}
              strokeLinejoin="round"
            />
            <rect x="66" y="158" width="102" height="2.5" fill={red} />

            {/* Front wing — main plane, ahead of front wheel */}
            <rect
              x="460"
              y="218"
              width="102"
              height="13"
              rx="1.5"
              fill={white}
              stroke={partStroke("aero")}
              strokeWidth={partStrokeWidth("aero", 1.5)}
            />
            <rect x="460" y="223" width="102" height="3" fill={red} />
            {/* Front-wing endplate */}
            <path
              d="M 555 207 L 575 205 L 575 240 L 565 244 L 555 238 Z"
              fill={white}
              stroke={partStroke("aero")}
              strokeWidth={partStrokeWidth("aero", 1.5)}
              strokeLinejoin="round"
            />
            <rect x="557" y="217" width="18" height="5" fill={red} />
          </g>

          {/* ====================================== MASS & BODY ============ */}
          <g {...partProps("mass_geometry")}>
            {/* Body silhouette — ONE smooth path, no straight segments
                between joints. Sidepod top is flat; everything else is
                a quadratic curve. */}
            <path
              d="
                M 75 220
                L 75 168
                Q 86 138 130 132
                L 230 132
                Q 350 140 420 175
                Q 490 200 538 215
                L 542 220
                L 75 220
                Z
              "
              fill={white}
              stroke={partStroke("mass_geometry")}
              strokeWidth={partStrokeWidth("mass_geometry", 1.5)}
              strokeLinejoin="round"
            />

            {/* Red side stripe — ONE continuous path, follows body line */}
            <path
              d="
                M 88 196
                L 348 196
                Q 408 202 468 213
                Q 508 219 532 221
                L 532 226
                Q 508 223 468 218
                Q 408 207 348 201
                L 88 201
                Z
              "
              fill={red}
            />

            {/* Cockpit — dark ellipse on the body, not a cutout */}
            <ellipse
              cx="272"
              cy="146"
              rx="38"
              ry="11"
              fill={charcoal}
              stroke={partStroke("mass_geometry", "#1a1a1a")}
              strokeWidth="0.5"
            />

            {/* Roll hoop — ONE clean arch from cockpit rear to sidepod top */}
            <path
              d="M 228 132 Q 256 78 285 132"
              fill="none"
              stroke={partStroke("mass_geometry", charcoalMid)}
              strokeWidth={partStrokeWidth("mass_geometry", 6.5)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Single rear diagonal brace */}
            <line
              x1="270"
              y1="92"
              x2="218"
              y2="132"
              stroke={partStroke("mass_geometry", charcoalMid)}
              strokeWidth={partStrokeWidth("mass_geometry", 3.5)}
              strokeLinecap="round"
              opacity="0.92"
            />

            {/* CG marker — small target inside the body */}
            <g opacity="0.85">
              <circle
                cx="200"
                cy="200"
                r="5.5"
                fill="none"
                stroke={partStroke("mass_geometry", accent)}
                strokeWidth="1"
              />
              <line x1="194.5" y1="200" x2="205.5" y2="200" stroke={partStroke("mass_geometry", accent)} strokeWidth="1" />
              <line x1="200" y1="194.5" x2="200" y2="205.5" stroke={partStroke("mass_geometry", accent)} strokeWidth="1" />
            </g>
          </g>

          {/* ====================================== POWERTRAIN ============== */}
          <g {...partProps("powertrain")}>
            {/* Sidepod intake — curved scoop integrated with the body */}
            <path
              d="
                M 152 178
                Q 178 174 220 175
                L 258 176
                Q 274 178 274 188
                Q 274 198 258 200
                L 220 200
                Q 178 199 152 196
                Q 138 192 138 187
                Q 138 182 152 178
                Z
              "
              fill="#1a1a1a"
              stroke={partStroke("powertrain")}
              strokeWidth={partStrokeWidth("powertrain", 1.1)}
              strokeLinejoin="round"
            />
            {/* Cooling vanes inside the intake */}
            {[166, 178, 190, 202, 214, 226, 238, 250].map((x) => (
              <line
                key={`vane-${x}`}
                x1={x}
                y1={181}
                x2={x}
                y2={196}
                stroke={partStroke("powertrain", "#5a5a5a")}
                strokeWidth="0.85"
              />
            ))}
            {/* Exhaust tip at the rear */}
            <rect
              x="68"
              y="178"
              width="14"
              height="8"
              rx="2"
              fill="#1a1a1a"
              stroke={partStroke("powertrain", charcoalMid)}
              strokeWidth={partStrokeWidth("powertrain", 1)}
            />
          </g>

          {/* ====================================== SUSPENSION ============== */}
          <g {...partProps("suspension")}>
            {/* Rear suspension — wheel center (175, 210) */}
            <line x1="175" y1="200" x2="240" y2="175" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
            <line x1="175" y1="225" x2="240" y2="212" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
            <line x1="187" y1="212" x2="245" y2="168" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 1.6)} strokeLinecap="round" />

            {/* Front suspension — wheel center (445, 210) */}
            <line x1="445" y1="200" x2="385" y2="178" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
            <line x1="445" y1="225" x2="385" y2="215" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 2.4)} strokeLinecap="round" />
            <line x1="435" y1="212" x2="380" y2="170" stroke={partStroke("suspension", charcoalMid)} strokeWidth={partStrokeWidth("suspension", 1.6)} strokeLinecap="round" />
          </g>

          {/* =========================================== TIRES ============== */}
          <g {...partProps("tire")}>
            {/* Rear wheel */}
            <circle cx="175" cy="210" r="42" fill={charcoal} stroke={partStroke("tire", "#1a1a1a")} strokeWidth={partStrokeWidth("tire", 1.2)} />
            <circle cx="175" cy="210" r="25" fill={rimOuter} stroke="#3a3a3a" strokeWidth="0.8" />
            <circle cx="175" cy="210" r="14" fill={rimInner} />
            {[0, 72, 144, 216, 288].map((angle) => {
              const rad = ((angle - 90) * Math.PI) / 180;
              return (
                <line
                  key={`rs-${angle}`}
                  x1={175}
                  y1={210}
                  x2={175 + 24 * Math.cos(rad)}
                  y2={210 + 24 * Math.sin(rad)}
                  stroke="#3a3a3a"
                  strokeWidth="1.6"
                />
              );
            })}
            <circle cx="175" cy="210" r="4.5" fill="#1a1a1a" />

            {/* Front wheel */}
            <circle cx="445" cy="210" r="42" fill={charcoal} stroke={partStroke("tire", "#1a1a1a")} strokeWidth={partStrokeWidth("tire", 1.2)} />
            <circle cx="445" cy="210" r="25" fill={rimOuter} stroke="#3a3a3a" strokeWidth="0.8" />
            <circle cx="445" cy="210" r="14" fill={rimInner} />
            {[0, 72, 144, 216, 288].map((angle) => {
              const rad = ((angle - 90) * Math.PI) / 180;
              return (
                <line
                  key={`fs-${angle}`}
                  x1={445}
                  y1={210}
                  x2={445 + 24 * Math.cos(rad)}
                  y2={210 + 24 * Math.sin(rad)}
                  stroke="#3a3a3a"
                  strokeWidth="1.6"
                />
              );
            })}
            <circle cx="445" cy="210" r="4.5" fill="#1a1a1a" />
          </g>

          {/* ========================================== BRAKES ============== */}
          {/* Smaller, less candy-orange — drawn inside the rim, subtle accent */}
          <g {...partProps("brakes")}>
            <rect
              x="166"
              y="190"
              width="10"
              height="8"
              rx="1.5"
              fill="#1a1a1a"
              stroke={partStroke("brakes", "#a85a00")}
              strokeWidth={partStrokeWidth("brakes", 1)}
            />
            <rect
              x="436"
              y="190"
              width="10"
              height="8"
              rx="1.5"
              fill="#1a1a1a"
              stroke={partStroke("brakes", "#a85a00")}
              strokeWidth={partStrokeWidth("brakes", 1)}
            />
          </g>

          {/* ========================================== SHOCKS ============== */}
          {/* Two coil springs in the top-right, well clear of the car body */}
          <g {...partProps("dampers")}>
            <text
              x="490"
              y="22"
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
            <g transform="translate(462, 68)">
              <text x="0" y="-30" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">R</text>
              <line x1="0" y1="-24" x2="0" y2="-12" stroke={partStroke("dampers", charcoalMid)} strokeWidth="2.4" strokeLinecap="round" />
              <rect x="-7" y="-13" width="14" height="3.5" rx="1" fill={partStroke("dampers", charcoalMid)} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ellipse
                  key={`r-coil-${i}`}
                  cx="0"
                  cy={-7 + i * 4.2}
                  rx="7"
                  ry="2.3"
                  fill="none"
                  stroke={partStroke("dampers", springGrey)}
                  strokeWidth={partStrokeWidth("dampers", 1.5)}
                />
              ))}
              <rect x="-7" y="18" width="14" height="3.5" rx="1" fill={partStroke("dampers", charcoalMid)} />
              <line x1="0" y1="21" x2="0" y2="30" stroke={partStroke("dampers", charcoalMid)} strokeWidth="2.4" strokeLinecap="round" />
            </g>
            {/* Front shock (F) */}
            <g transform="translate(518, 68)">
              <text x="0" y="-30" textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">F</text>
              <line x1="0" y1="-24" x2="0" y2="-12" stroke={partStroke("dampers", charcoalMid)} strokeWidth="2.4" strokeLinecap="round" />
              <rect x="-7" y="-13" width="14" height="3.5" rx="1" fill={partStroke("dampers", charcoalMid)} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ellipse
                  key={`f-coil-${i}`}
                  cx="0"
                  cy={-7 + i * 4.2}
                  rx="7"
                  ry="2.3"
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
          <g opacity="0.5">
            <polygon points="10,272 20,267 20,277" fill="#94a3b8" />
            <text x="34" y="275" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">
              REAR
            </text>
          </g>
          <g opacity="0.5">
            <polygon points="440,272 430,267 430,277" fill="#94a3b8" />
            <text x="390" y="275" textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="JetBrains Mono, monospace">
              FRONT
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
