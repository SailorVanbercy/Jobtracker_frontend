"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

type ShowToast = (message: string, tone?: ToastTone) => void;

const TOAST_DURATION_MS = 4500;
const MAX_VISIBLE_TOASTS = 3;

const ToastContext = createContext<ShowToast | null>(null);

const TONE_STYLES: Record<ToastTone, { container: string; dot: string }> = {
  success: { container: "ring-emerald-900/10", dot: "bg-emerald-500" },
  error: { container: "ring-rose-900/10", dot: "bg-rose-500" },
  info: { container: "ring-stone-900/10", dot: "bg-teal-600" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const tone = TONE_STYLES[toast.tone];

  return (
    <li
      className={`pointer-events-auto flex w-full animate-fade-up items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink shadow-[0_12px_32px_-12px_rgba(28,25,23,0.3)] ring-1 ${tone.container}`}
    >
      <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${tone.dot}`} />
      <p className="flex-1 leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="-mr-1 rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
      >
        <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
    </li>
  );
}

/* Mounted in the root layout so toasts survive client-side navigations. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ShowToast>((message, tone = "info") => {
    nextId.current += 1;
    const toast = { id: nextId.current, tone, message };
    setToasts((current) => [...current, toast].slice(-MAX_VISIBLE_TOASTS));
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <ol
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-96"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used within a ToastProvider");
  return show;
}
