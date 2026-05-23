import { useState } from "react";

interface Props {
  text: string;
}

export function Tooltip({ text }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-edge text-[10px] text-ink-2 hover:text-ink-0 hover:bg-panel2"
        aria-label="More info"
      >
        ?
      </button>
      {open && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-64 p-2 bg-canvas border border-edge rounded text-[11px] text-ink-1 shadow-lg pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}
