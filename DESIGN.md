# Vibecoding Project Tracker — Design

**Status:** Filled in by Archie (Archie0709) for `design-done`. All colour pairs below were checked against WCAG 2.2 contrast ratios (results in §2).

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

---

## 1. Mood / vibe

**Calm, focused, after-hours:** a quiet dark workspace where the only things that catch your eye are what actually need attention (bugs, overdue work, the copy button).

References for the vibe:

- GitHub's dark default theme (dimmed slate surfaces, soft accent colours, Markdown-first)
- Linear's dark UI (low visual noise, one accent, keyboard-first)
- VS Code's "Dark Modern" theme (familiar to the developer audience, comfortable for long sessions)

Anti-references — what we are explicitly **not** trying to look like:

- Neon "gamer" dark themes: pure black backgrounds with saturated glowing colours. They cause halation (bright text appears to bleed) and eye strain, and they make status colours shout.
- Trello's default bright blue: busy, and it doesn't feel like a developer tool.

**Why dark, and how its drawbacks are handled:** dark was chosen because it is the developer's preference and matches the dark IDE and terminal setups that the target users (developers) commonly work in. Research generally finds that dark text on a light background gives slightly better reading performance (Piepenbrock et al., 2013), so the theme follows published dark-theme guidance to reduce that cost:
- a dark grey background rather than pure black
- off-white rather than pure white text
- desaturated accent colours
- lighter surfaces for raised elements such as the modal (Google Material Design, "Dark theme").

Every text colour still meets WCAG 2.2 AA contrast (see §2). A light theme is noted as future work.

## 2. Color palette

These hex values are pasted into `tailwind.config.js`. Utility classes follow the token name, e.g. `bg-surface-card`, `text-text-muted`, `border-due-warning`.

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#5CC8B8` | Header wordmark, "+" button fill (with `surface-page` text), focus rings |
| `brand-accent` | `#8AB4F8` | Links, hover highlights |
| `surface-page` | `#0F1419` | Page background |
| `surface-card` | `#1A222C` | Columns' cards, anchor tiles |
| `surface-raised` | `#232D38` | Modal, dropdowns, toasts (one step lighter = closer to the user) |
| `text-primary` | `#E6EDF3` | Body text |
| `text-muted` | `#9AA8B6` | Captions, dates, counts |
| `border-subtle` | `#344150` | Decorative dividers and card outlines (never the only cue) |
| `border-strong` | `#6B7B8C` | Form-input borders: ≥ 3:1 on every surface (WCAG 1.4.11) |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#B39DFF` (soft violet) | Cards tagged `feature`: left accent stripe + `Sparkles` icon + the word "Feature" |
| `type-bug` | `#FF8F85` (soft coral) | Cards tagged `bug`: left accent stripe + `Bug` icon + the word "Bug" |

Violet and coral were chosen over the starter's green and red, because green/red is the pairing most often confused by red-green colour-blind users. The two also differ in lightness and always carry a different icon and label.

### Due-date states (M8 `due-tint`)

| Token | Hex | When used | Non-colour cue (Lucide icon + text) |
|---|---|---|---|
| `due-safe` | `#6CB6FF` (blue) | More than 2 days out | `Clock` icon + "Due in N days" |
| `due-warning` | `#F2C14E` (amber) | 2 days or less (including today) | `AlertTriangle` icon + "Due tomorrow" / "Due today" |
| `due-overdue` | `#FF6B6B` (red) | Past due | `AlertOctagon` icon + "Overdue by N days" |
| `due-neutral` | `#8F9BA8` (grey) | Done (overrides the date) | `CheckCircle2` icon + "Done" |

The thresholds and colours are defined in one config object, so user-customisable colours can be added later (client Q&A suggestion).

### Contrast check (WCAG 2.2, text ≥ 4.5:1 for AA)

| Colour | on `surface-page` | on `surface-card` | on `surface-raised` |
|---|---|---|---|
| `text-primary` | 15.67 | 13.58 | 11.82 |
| `text-muted` | 7.63 | 6.61 | 5.75 |
| `brand-primary` | 9.18 | 7.95 | 6.92 |
| `brand-accent` | 8.78 | 7.61 | 6.63 |
| `type-feature` | 8.10 | 7.02 | 6.11 |
| `type-bug` | 8.39 | 7.27 | 6.33 |
| `due-safe` | 8.61 | 7.47 | 6.50 |
| `due-warning` | 11.03 | 9.56 | 8.32 |
| `due-overdue` | 6.67 | 5.78 | 5.03 |
| `due-neutral` | 6.54 | 5.67 | 4.94 |
| `border-strong` (non-text, needs 3:1) | 4.26 | 3.69 | 3.22 |

Button label (`surface-page` text on `brand-primary` fill): **9.18:1**.

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | Inter (600/700) | Highly legible screen font with clear letterforms (distinct I/l/1); neutral, so it stays calm. |
| Body | Inter (400/500) | One family for UI text keeps the page quiet; it has a large x-height, so it reads well at 14 px on dark backgrounds. |
| Monospace (tags, badges, code) | JetBrains Mono | Familiar to developers, and it marks prompt/context text as something meant to be pasted into a tool. |

Both are loaded from Google Fonts, with system-font fallbacks.

Sizes (no text below 12 px):

- Page title: 24 px / semibold
- Section header: 13 px / semibold uppercase, letter-spaced (column titles)
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

- **Cards:** `surface-card` on the `surface-page` background, 1 px `border-subtle` outline, 4 px left stripe in the task-type colour; a slightly lighter background on hover and focus, with no heavy shadows.
- **Buttons:** primary = solid `brand-primary` fill with dark text, rounded-md, at least 36 px tall; secondary = transparent with a `border-strong` outline. Every button has a visible 2 px `brand-primary` focus ring with an offset (`focus-visible`).
- **Modal:** centred, max-w-lg, `surface-raised` background, page dimmed with a black backdrop at 60% opacity; focus stays inside the modal and Esc closes it; the first field gets focus when it opens.
- **Empty states:** dashed `border-subtle` box, muted text, encouraging, never sad.
- **Drag affordance:** cards can be dragged between columns with a mouse (M12). A grip icon appears on hover and the cursor changes to a hand. While dragging, the card fades, other columns show a dashed teal outline, and the column under the pointer highlights. Dragging is never the only way to move a card: every card keeps its status dropdown, which works with a keyboard and screen readers (WCAG 2.2 SC 2.5.7).
- **Motion:** a 200 ms fade only, and none when the user has `prefers-reduced-motion` set.

## 5. Voice / microcopy

Short, calm, a little warm, written for someone tired at 11pm.

| Where | Text |
|---|---|
| "+" button label | "+ New task" |
| Empty column placeholder | "Nothing here yet — that's fine." |
| Toast after "Copy as Prompt Context" | "Copied. Paste it into your AI tool." |
| Confirm-delete message | "Delete "{title}"? This can't be undone." |
| Handoff toast (M7 `task-owner`) | "Handed off to {name}." |

## 6. Logo / wordmark

- **Product name:** Vibecoding Project Tracker (solo entry by Archie, no separate team name; see PRD §11)
- **Wordmark style:** the name in Inter semibold, `text-primary`, with a small `brand-primary` "▍" cursor block in front of it, nodding to a terminal prompt. No image logo.

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it. **We ship dark only** (see §1).
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. We use [Lucide icons](https://lucide.dev) (`lucide-react`) if we need icons.

---

*DESIGN.md version: hackathon-starter v1 · filled in for design-done*
