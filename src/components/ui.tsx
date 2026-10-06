import type { ReactNode } from "react";

/* Shared presentational building blocks. No business logic lives here. */

export const LABEL_CLASS = "mb-1.5 block text-[13px] font-medium text-stone-700";

export const INPUT_CLASS =
  "block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink shadow-[0_1px_2px_rgba(28,25,23,0.04)] placeholder:text-stone-400 transition-[border-color,box-shadow] duration-150 hover:border-stone-400 focus:border-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-700/10 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500";

export const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(15,61,57,0.25)] transition-colors duration-150 hover:bg-teal-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/25 disabled:cursor-not-allowed disabled:bg-teal-800/50 disabled:shadow-none";

export const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-colors duration-150 hover:bg-stone-50 hover:text-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-400/25 disabled:cursor-not-allowed disabled:opacity-60";

export const CARD_CLASS =
  "rounded-2xl bg-white ring-1 ring-stone-900/6 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.12)]";

export const ERROR_ALERT_CLASS =
  "flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid size-8 place-items-center rounded-lg bg-teal-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="size-4">
        <path
          d="M4 6.5h12M4 10h8M4 13.5h5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="15" cy="13.5" r="1.75" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={inverted ? "bg-teal-400/15 ring-1 ring-teal-300/20" : ""} />
      <span
        className={`font-display text-lg font-medium tracking-tight ${
          inverted ? "text-teal-50" : "text-ink"
        }`}
      >
        Job Tracker
      </span>
    </span>
  );
}

export function Spinner() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-4 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0v-4ZM10 14.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const PREVIEW_ROWS = [
  { pill: "bg-amber-300/80", bar: "w-28", score: "w-3/4" },
  { pill: "bg-emerald-300/80", bar: "w-36", score: "w-11/12" },
  { pill: "bg-sky-300/80", bar: "w-24", score: "w-1/2" },
];

/* Decorative, text-free preview of the product shown beside auth forms. */
function ProductPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-8 rounded-[2rem] bg-teal-400/10 blur-3xl" />
      <div className="relative space-y-3">
        {PREVIEW_ROWS.map((row, index) => (
          <div
            key={index}
            style={{ animationDelay: `${150 + index * 120}ms` }}
            className={`animate-fade-up rounded-xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm ${
              index === 1 ? "translate-x-6" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-lg bg-white/10" />
              <div className="flex-1 space-y-2">
                <span className={`block h-2 rounded-full bg-white/40 ${row.bar}`} />
                <span className="block h-2 w-16 rounded-full bg-white/15" />
              </div>
              <span className={`h-5 w-14 rounded-full ${row.pill}`} />
            </div>
            <div className="mt-4 h-1 rounded-full bg-white/10">
              <span className={`block h-full rounded-full bg-teal-300/70 ${row.score}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-teal-950 p-12 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_15%_0%,rgba(45,212,191,0.16),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-size-[22px_22px]" />

        <div className="relative">
          <Brand inverted />
        </div>
        <div className="relative flex flex-1 items-center">
          <ProductPreview />
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
