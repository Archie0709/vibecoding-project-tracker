import { useEffect, useState } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';
import { copyText } from '../lib/clipboard';
import { buildPrompt } from '../lib/prompt';
import { focusRing } from '../lib/ui';
import { useToast } from './Toast';

/**
 * M10 copy-prompt (FR-17, NFR-10): one click copies the task + context as a Markdown prompt.
 * Feedback is given three ways: the icon changes to a tick, the label says "Copied",
 * and a toast is announced to screen readers (WCAG 2.2 SC 4.1.3).
 * The accessible name starts with the visible word "Copy" (WCAG 2.2 SC 2.5.3 Label in Name).
 */
export default function CopyPromptButton({ task, variant = 'card' }) {
  const showToast = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    const ok = await copyText(buildPrompt(task));
    if (ok) {
      setCopied(true);
      showToast('Copied. Paste it into your AI tool.');
    } else {
      showToast("Couldn't copy automatically. Your browser blocked clipboard access.");
    }
  }

  const Icon = copied ? Check : ClipboardCopy;
  const styles =
    variant === 'card'
      ? 'gap-1 rounded border border-brand-primary/60 px-2 py-1 text-xs text-brand-primary hover:bg-brand-primary/10'
      : 'min-h-[36px] gap-2 rounded-md border border-brand-primary/60 px-4 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10';

  return (
    <button type="button" onClick={handleCopy} className={`inline-flex items-center ${styles} ${focusRing}`}>
      <Icon aria-hidden="true" className={variant === 'card' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {copied ? 'Copied' : variant === 'card' ? 'Copy' : 'Copy as prompt'}
      <span className="sr-only"> &ldquo;{task.title}&rdquo; as prompt context</span>
    </button>
  );
}
