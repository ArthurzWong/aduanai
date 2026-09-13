"use client";

export type View = "dashboard" | "complaints" | "agencies";

const NAV: { id: View; label: string; hint: string; icon: JSX.Element }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    hint: "Overview",
    icon: (
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
  },
  {
    id: "complaints",
    label: "Complaints",
    hint: "Queue",
    icon: <path d="M5 3h9l5 5v13H5zM14 3v5h5M8 12h8M8 16h5" />,
  },
  {
    id: "agencies",
    label: "Agencies",
    hint: "Directory",
    icon: <path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M4 12h16" />,
  },
];

interface Props {
  view: View;
  onViewChange: (view: View) => void;
  counts: Record<View, number>;
}

export function Sidebar({ view, onViewChange, counts }: Props) {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900 px-4 py-6 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ember-400 to-ember-600 text-sm font-black text-white shadow-[0_12px_26px_-14px_rgba(226,89,11,0.95)]">
          AI
        </span>
        <div>
          <p className="font-display text-base font-extrabold tracking-tight text-white">AduanAI</p>
          <p className="text-xs text-ink-300">Complaint triage</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {NAV.map((item) => {
          const active = item.id === view;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400 ${
                active ? "bg-ember-500/15 text-ember-200" : "text-ink-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 shrink-0"
                aria-hidden
              >
                {item.icon}
              </svg>
              <span className="flex-1 text-left">{item.label}</span>
              {counts[item.id] > 0 ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active ? "bg-ember-500 text-white" : "bg-white/10 text-ink-100"
                  }`}
                >
                  {counts[item.id]}
                </span>
              ) : (
                <span className="text-[11px] text-ink-300">{item.hint}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-ink-800 bg-white/[0.04] p-4">
        <p className="text-xs font-semibold text-ink-100">Demo-safe mode</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-300">
          Without an AI key AduanAI runs a deterministic rule engine, so the flow never breaks on stage.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav({ view, onViewChange }: Omit<Props, "counts">) {
  return (
    <div className="flex gap-1 rounded-2xl border border-line bg-surface p-1 shadow-card lg:hidden">
      {NAV.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onViewChange(item.id)}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
            item.id === view
              ? "bg-ember-500 text-white shadow-[0_12px_22px_-14px_rgba(226,89,11,0.95)]"
              : "text-ink-500 hover:text-ink-900"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
