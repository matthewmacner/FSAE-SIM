import { useStore } from "../store";
import { Tooltip } from "./Tooltip";

interface Props {
  label: string;
  path: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  tooltip?: string;
  precision?: number;
}

function lookup(obj: unknown, path: string): number | null {
  let cursor: unknown = obj;
  for (const part of path.split(".")) {
    if (cursor && typeof cursor === "object" && part in cursor) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  return typeof cursor === "number" ? cursor : null;
}

export function ParamSlider({
  label,
  path,
  value,
  min,
  max,
  step = 0.1,
  unit,
  tooltip,
  precision = 1,
}: Props) {
  const update = useStore((s) => s.updateParam);
  const runAll = useStore((s) => s.runAll);
  const compare = useStore((s) => s.compareSetup);
  const compareValue = compare ? lookup(compare, path) : null;
  const onChange = (next: number) => {
    update(path, next);
  };
  const onCommit = () => {
    void runAll();
  };
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex items-center gap-1 w-44 min-w-0">
        <span className="text-[12px] text-ink-1 truncate">{label}</span>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <input
        type="range"
        className="slider flex-1"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        onKeyUp={onCommit}
      />
      <input
        type="number"
        className="input-num"
        value={Number.isFinite(value) ? value.toFixed(precision) : ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
        }}
      />
      {unit && <span className="text-[11px] text-ink-3 w-12">{unit}</span>}
      {compareValue !== null && (
        <span
          className={`text-[10px] font-mono tabular-nums px-1 rounded ${
            Math.abs(compareValue - value) < 1e-6
              ? "text-ink-3"
              : "text-accent-warm bg-accent-warm/10"
          }`}
          title={`Compare value: ${compareValue}`}
        >
          {compareValue.toFixed(precision)}
        </span>
      )}
    </div>
  );
}
