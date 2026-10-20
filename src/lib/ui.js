// Shared Tailwind class strings so every control looks and behaves the same (DESIGN.md §4).

export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

const btnBase = `inline-flex min-h-[36px] items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const btnPrimary = `${btnBase} bg-brand-primary text-surface-page hover:bg-brand-primary/90`;
export const btnSecondary = `${btnBase} border border-border-strong text-text-primary hover:bg-surface-card`;
export const btnDanger = `${btnBase} border border-due-overdue text-due-overdue hover:bg-due-overdue/10`;
export const btnDangerSolid = `${btnBase} bg-due-overdue text-surface-page hover:bg-due-overdue/90`;

export const labelClass = 'mb-1 block text-sm font-medium text-text-primary';

export const inputClass = `block w-full rounded-md border border-border-strong bg-surface-page px-3 py-2 text-sm text-text-primary placeholder:text-text-muted aria-[invalid=true]:border-due-overdue ${focusRing}`;
