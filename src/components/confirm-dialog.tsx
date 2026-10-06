"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SECONDARY_BUTTON_CLASS, Spinner } from "./ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DANGER_BUTTON_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors hover:bg-rose-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-700/25 disabled:cursor-not-allowed disabled:opacity-60";

/* Native <dialog> gives us focus trapping, Escape handling and an inert background for free. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        if (!isPending) onCancel();
      }}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) cancels.
        if (e.target === e.currentTarget && !isPending) onCancel();
      }}
      aria-labelledby="confirm-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-ink shadow-[0_24px_64px_-16px_rgba(28,25,23,0.35)] ring-1 ring-stone-900/10 backdrop:bg-stone-900/40 backdrop:backdrop-blur-[2px] open:animate-fade-up"
    >
      <div className="p-6">
        <h2 id="confirm-dialog-title" className="font-display text-xl font-medium tracking-tight">
          {title}
        </h2>
        {description && <div className="mt-2 text-sm leading-relaxed text-stone-600">{description}</div>}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-stone-900/6 bg-stone-50/70 px-6 py-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isPending} className={SECONDARY_BUTTON_CLASS} autoFocus>
          Annuler
        </button>
        <button type="button" onClick={onConfirm} disabled={isPending} className={DANGER_BUTTON_CLASS}>
          {isPending && <Spinner />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
