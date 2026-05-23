import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function ParameterPanel({ title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-ink-0 hover:bg-panel2 transition-colors rounded-t-lg"
      >
        <span className="text-[12px] uppercase tracking-[0.14em] font-medium">
          {title}
        </span>
        <span className="text-ink-3 text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-3 pb-2 border-t border-edge">{children}</div>
      )}
    </div>
  );
}
