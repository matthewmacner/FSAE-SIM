import { useEffect, type ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-canvas/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-4 py-3 border-b border-edge flex items-center justify-between">
          <span className="text-ink-0 font-semibold tracking-tight text-sm">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink-0 w-6 h-6 rounded hover:bg-edge transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="overflow-auto p-3 flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
