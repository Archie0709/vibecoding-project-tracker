import { STAGES } from './constants';
import { formatTimestamp, parseISODate } from './dates';
import { getDueState } from './dueStatus';
import { typeStyle } from './taskTypes';

/** e.g. "21 Oct 2026" — always with the year, because a prompt may be read much later. */
function formatLongDate(iso) {
  const date = parseISODate(iso);
  return date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

/**
 * M10 copy-prompt (FR-17): turns a task into a Markdown briefing that can be pasted
 * straight into an AI tool (Claude, ChatGPT, Cursor…). Markdown is used because these
 * tools read it natively, and headings make it easy for both people and models to scan.
 */
export function buildPrompt(task) {
  const status = STAGES.find((s) => s.id === task.status)?.label ?? task.status;
  const due = getDueState(task);

  const facts = [
    `- **Type:** ${typeStyle(task.type).label}`,
    `- **Status:** ${status}`,
    `- **Owner:** ${task.assignee || 'Unassigned'}`,
    task.dueDate
      ? `- **Due:** ${formatLongDate(task.dueDate)} (${due.label.split(' · ')[0]})`
      : '- **Due:** No due date',
    task.createdDate ? `- **Created:** ${formatLongDate(task.createdDate)}` : null,
  ].filter(Boolean);

  const contextMeta = [
    task.contextUpdatedAt ? `Last updated ${formatTimestamp(task.contextUpdatedAt)}` : null,
    task.contextTool ? `from ${task.contextTool}` : null,
  ].filter(Boolean);

  const sections = [
    `# Task: ${task.title}`,
    facts.join('\n'),
    `## Description\n\n${task.description?.trim() || '_No description._'}`,
    task.context?.trim()
      ? `## Context${contextMeta.length ? `\n\n_${contextMeta.join(' · ')}_` : ''}\n\n${task.context.trim()}`
      : '## Context\n\n_No context recorded yet._',
    '## What I need\n\nContinue this task using the details and context above. Ask me if anything is unclear before writing code.',
  ];

  return `${sections.join('\n\n')}\n`;
}
