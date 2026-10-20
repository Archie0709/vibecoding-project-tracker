import { AlertOctagon, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { formatDuration, formatShortDate, parseISODate } from './dates';

/**
 * M8 due-tint (FR-11, FR-12, DESIGN.md §2).
 *
 * All thresholds and colours live here, so the user-customisable colours (FR-13)
 * only need to change this config. Each state has a colour, an icon AND a text
 * label — colour is never the only cue (WCAG 2.2 SC 1.4.1).
 *
 * Tailwind needs full class names written out, so they are listed per state.
 * The card tint is a translucent gradient layered over the card colour (so the card
 * keeps its own background). The chip has an outline only, no fill: a filled chip
 * dropped the overdue/done text below 4.5:1 on a hovered card; outline-only keeps
 * every state >= 4.59:1 (WCAG 2.2 SC 1.4.3).
 */
export const DUE_CONFIG = {
  // "2 days or less" counts as warning (includes today and tomorrow).
  warningDays: 2,
};

export const DUE_STATES = {
  safe: {
    Icon: Clock,
    text: 'text-due-safe',
    chip: 'ring-due-safe/50',
    card: 'bg-gradient-to-b from-due-safe/[0.05] to-due-safe/[0.05]',
  },
  warning: {
    Icon: AlertTriangle,
    text: 'text-due-warning',
    chip: 'ring-due-warning/50',
    card: 'bg-gradient-to-b from-due-warning/[0.06] to-due-warning/[0.06]',
  },
  overdue: {
    Icon: AlertOctagon,
    text: 'text-due-overdue',
    chip: 'ring-due-overdue/50',
    card: 'bg-gradient-to-b from-due-overdue/[0.07] to-due-overdue/[0.07]',
  },
  neutral: {
    Icon: CheckCircle2,
    text: 'text-due-neutral',
    chip: 'ring-due-neutral/50',
    card: '',
  },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days from today until `iso` (negative = past). Uses local dates, not UTC. */
export function daysUntil(iso, today = new Date()) {
  const due = parseISODate(iso);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due - start) / MS_PER_DAY);
}

/**
 * Works out the due state of a task.
 * Returns null when the task has no due date.
 */
export function getDueState(task, today = new Date()) {
  if (!task.dueDate) return null;
  if (task.status === 'done') {
    // Done overrides the date: no urgency once finished.
    return { key: 'neutral', label: `Done · was due ${formatShortDate(task.dueDate, today)}`, ...DUE_STATES.neutral };
  }

  const days = daysUntil(task.dueDate, today);
  const date = formatShortDate(task.dueDate, today);

  let key;
  let label;
  if (days < 0) {
    key = 'overdue';
    label = `Overdue by ${formatDuration(days)}`;
  } else if (days === 0) {
    key = 'warning';
    label = 'Due today';
  } else if (days === 1) {
    key = 'warning';
    label = 'Due tomorrow';
  } else if (days <= DUE_CONFIG.warningDays) {
    key = 'warning';
    label = `Due in ${formatDuration(days)}`;
  } else {
    key = 'safe';
    label = `Due in ${formatDuration(days)}`;
  }

  return { key, label: `${label} · ${date}`, ...DUE_STATES[key] };
}
