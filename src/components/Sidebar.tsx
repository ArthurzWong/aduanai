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
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
          AI
        </span>
        <div>
          <p className="text-base font-bold tracking-tight text-slate-900">AduanAI</p>
          <p className="text-xs text-slate-500">Complaint triage</p>
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
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                    active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {counts[item.id]}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">{item.hint}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-700">Demo-safe mode</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Without an AI key AduanAI runs a deterministic rule engine, so the flow never breaks on stage.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav({ view, onViewChange }: Omit<Props, "counts">) {
  return (
    <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 lg:hidden">
      {NAV.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onViewChange(item.id)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            item.id === view ? "bg-blue-600 text-white" : "text-slate-600"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
