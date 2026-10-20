import { Bug, Sparkles } from 'lucide-react';

/**
 * M6 tag-style: how each task type is shown (DESIGN.md §2, FR-08, NFR-02).
 * Every type has a colour, an icon and a text label, so colour is never the only cue
 * (WCAG 2.2 SC 1.4.1 Use of Color). Violet/coral avoid the red/green pairing that is
 * hardest for colour-blind users to tell apart.
 *
 * Tailwind needs full class names written out (no string building), so they live here.
 */
export const TYPE_STYLES = {
  feature: {
    label: 'Feature',
    Icon: Sparkles,
    text: 'text-type-feature',
    stripe: 'border-l-type-feature',
    ring: 'ring-type-feature',
    tint: 'bg-type-feature/10',
  },
  bug: {
    label: 'Bug',
    Icon: Bug,
    text: 'text-type-bug',
    stripe: 'border-l-type-bug',
    ring: 'ring-type-bug',
    tint: 'bg-type-bug/10',
  },
};

export function typeStyle(type) {
  return TYPE_STYLES[type] ?? TYPE_STYLES.feature;
}
