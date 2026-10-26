# Vibecoding Project Tracker — PRD

**Status:** Reviewed by Archie (Archie0709) for `prd-done`, and updated to match the built prototype after M12. Solo hackathon entry. Where this PRD departs from the starter's original wording, the change is marked **[Amended]** with the reason. §17 shows which requirements are implemented.

---

## 1. Problem

Vibecoding teams have two recurring pains with large projects:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** the team members, for the remaining weeks of the summer semester.
- **Secondary:** future cohorts of vibecoders taking the same class.
- **[Amended] Wider audience (from client Q&A):** small, self-managed software development teams (junior devs, senior devs, project managers) that self-host the tool for their own team.

We are designing the tool we ourselves will use. The pitch demo is also our first real user test.

**Accessibility is a first-class requirement** (client Q&A): every colour signal is paired with an icon or text label for colour-blind users, all colour pairs meet WCAG 2.2 AA contrast, and every action is keyboard-operable.

## 3. Product overview

A single-page web app with two persistent surfaces:

- A **Kanban board** where vibecoding tasks move through four states.
- An **Anchor Board** above it that pins the four final-project deliverables (Presentation, Demo, Report, Documentation).

Each task carries the prompt context that produced it, so any teammate can click a button and copy the task + prompt history back into an AI chat to continue work.

**[Amended] M12:** users log in with their own account, can have several boards, and add teammates to a board. Tasks, links and members are stored in a MariaDB database behind a Spring Boot REST API, so everyone on a board sees the same data.

## 4. Primary user flow

1. Open the web app and log in (or create an account). **[Amended]**
2. Pick a board from the board switcher, or create one; add teammates through **Members**. **[Amended]**
3. Click "+ New task" to add a task. Fill in title, description (Markdown), type, status, assignee, due date and AI context.
4. Move the task across columns as you work, using the status dropdown or by dragging the card.
5. When stuck, click "Copy" on a task and paste the prompt into Claude/ChatGPT/Cursor to continue.
6. Hand off a task to a teammate with one dropdown.
7. Drop final deliverable links into the Anchor Board as you produce them.

## 5. Data model

Locked. Do not change without team agreement.

```js
// A single vibecoding task.
Task = {
  id: string,                    // uuid or timestamp string
  title: string,
  description: string,
  type: 'feature' | 'bug',       // visual color coding
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,              // one of the three teammate names from §8
  dueDate: string | null,        // ISO date 'YYYY-MM-DD'
  createdDate: string,           // ISO date 'YYYY-MM-DD'

  // Added in later milestones:
  context: string,               // M9 context — curated briefing for the next AI / teammate
  contextTool: string | null,    // M9 context — 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
  contextUpdatedAt: string|null, // M9 context — ISO timestamp set automatically on save
}

// One of four pinned deliverable slots.
Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,                 // human-readable
  url: string | null,            // the link the team pastes in
}
```

**[Amended] M12 changes.** The fields above were used as specified for M4–M11. From M12 the data lives in MariaDB (`backend/src/main/resources/schema.sql`) and changes as follows:

```js
User        = { id, name, email, githubHandle, passwordHash }  // passwordHash is server-side only (BCrypt)
Board       = { id, name, ownerId, createdAt }                 // a user can have many boards
BoardMember = { boardId, userId, addedAt }                     // all members are equal admins
Session     = { token, userId, createdAt, expiresAt }          // login sessions, stored server-side

Task: id is a number assigned by the database; + boardId;
      assignee (name) is replaced by assigneeId (a member's user id, or null);
      contextUpdatedAt is set by the server, only when context or tool change.
Anchor: + boardId — each board has its own four deliverable slots.
```

`Task.description` and `Task.context` are written and rendered as Markdown from M12.

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React (via Vite) | What the scaffold ships with. Don't migrate. |
| Styling | Tailwind | Already configured. Use utility classes; no separate CSS files. |
| State | React `useState` + small custom hooks | Simple, no library needed. |
| Persistence | localStorage (M4–M11) → **[Amended]** MariaDB via the REST API (M12) | localStorage kept the core milestones fast; the database makes boards shared between users. |
| Deploy | **[Amended]** Local for development; hosted as one Docker service on Render (free) with an Aiven MySQL database | Vercel cannot host the Java backend; one service keeps the app and API on the same site, so the login cookie works. |
| Icons | `lucide-react` | Consistent, accessible SVG icons (DESIGN.md §7). |
| **[Amended] Backend (M12)** | Java 21 · Spring Boot 3.5 · Maven · Spring Data JPA | The developer's strongest language; typed, well-documented, fast to scaffold with AI. |
| **[Amended] Database (M12)** | MariaDB (local install, managed via IntelliJ) | Already available on the dev laptop; no Docker needed. |
| **[Amended] Auth (M12)** | Email + password, BCrypt-hashed (Spring Security's built-in encoder), server-side session in an HttpOnly cookie | Client Q&A: "login would be ideal" so the tool isn't left exposed. |
| **[Amended] Markdown (M12)** | `react-markdown` + `remark-gfm` (no raw HTML) | Safe-by-default rendering of task fields; GitHub-style tables and checklists. |

> **Decision [Amended]:** M4–M11 are built exactly as specified, on localStorage, so each milestone ships quickly and independently. All data access goes through a single `src/api.js` layer from M4. In M12 that layer is switched from localStorage to the Spring Boot REST API, so the UI is not rewritten mid-hackathon. Development and the hackathon demo run locally (frontend on Vite, backend on Spring Boot, database on local MariaDB). **However, the module assessment requires a link that the marker can open without registering (see NFR-15 and FR-28)**, so the app is hosted on Render with a free Aiven MySQL database (see README → Hosting), with a "Try the demo" login and sample data (FR-20, FR-28). Vercel can host the frontend but not the Java backend.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

**[Amended] Solo entry** — one developer covers all three tracks.

| Slot | Name | GitHub handle |
|---|---|---|
| Developer (Tracks A, B, C) | Archie | Archie0709 |

For M7–M11 the assignee dropdown used a small fixed demo team list (Archie plus placeholder teammates) so hand-off could be demonstrated. From M12, the assignee list is the board's members, drawn from real user accounts; every user can add any other user of the self-hosted instance to a board (all users are treated as admins — small, self-managed team).

## 9. Milestone ownership

**[Amended]** Solo entry, so Archie owns every milestone. The suggested track letters are kept to show which concern each milestone belongs to.

| # | Tag | Title | Suggested owner | Final owner |
|---|---|---|---|---|
| 3 | `design-done` | Design system + voice (DESIGN.md) | **B** | Archie |
| 4 | `data-model` | Task model + board view | **A** | Archie |
| 5 | `crud-modal` | Add / edit / delete modal | **A** | Archie |
| 6 | `tag-style` | Feature / bug colors | **B** | Archie |
| 7 | `task-owner` | Owner indicator + handoff | **A** | Archie |
| 8 | `due-tint` | Due-date color tinting | **B** | Archie |
| 9 | `task-context` | Context field on the task modal | **C** | Archie |
| 10 | `copy-context` | "Copy as Prompt Context" button | **C** | Archie |
| 11 | `project-deliverables` | Deliverable Anchor Board | **B** | Archie |
| 12 | `secret-sauce` | Accounts, multiple boards, members, Markdown, MariaDB backend, drag and drop | **C / All** | Archie |
| 13 | `pitch-ready` | Demo + pitch rehearsal | **All** | Archie |


Track A owns the state model and task ownership. Track B owns the visuals (and design — M3 runs parallel to M2 so the team starts Phase 3 with the palette already chosen). Track C owns the differentiator features (M9 + M10 — the context field and the Copy-as-Prompt button) and usually leads on M12 secret-sauce. Put your strongest prompter on Track C.

**Dependency note.** M3 (`design-done`) runs **in parallel with M2** — Person B drafts DESIGN.md and pastes the colors into `tailwind.config.js` while the rest of the team reviews the PRD. M6 / M7 / M8 / M11 all depend on M4 + M5 being done first. While Person A builds M4+M5 (first ~60 min of Phase 3), Person C should draft the Markdown template for the "Copy as Prompt Context" output (M10). M12 `secret-sauce` is open-ended — pick whatever makes the tracker uniquely yours; constraint is "must be visible in the demo and must not break anything else."

## 10. AI / vibe coding angle

Where AI will be heavily used:
- M4, M5: scaffold the board and the modal from a single prompt each.
- M9, M10: write the Markdown serialization helper for the Context field.
- M7: animation polish for the handoff toast.

Where AI will **not** save you time:
- M2 (this PRD review) — read it yourself.
- M3 (DESIGN.md) — design taste is yours, not the model's.
- M12 (secret-sauce) — the whole point is that AI can't predict it.
- M13 (pitch) — write the script in your own voice.

Keep the Context field of each real task up to date as you work. By the end of the hackathon you should have a handful of curated context blocks — those become part of your Module 5 "Vibe Coding History" deliverable.

## 11. Team identity

Fill in:

- **Team name:** Archie (Archie0709) — solo entry, no separate team name
- **Tagline (one sentence):** Track the task *and* the prompt that built it.
- **Tracker URL after deploy:** <https://vibetracker-8j5a.onrender.com> — click **Try the demo** on the login page (no registration needed). Free hosting sleeps when idle, so the first load can take about a minute.

## 12. Out of scope (do not build)

- ~~Authentication / accounts.~~ **[Amended]** Moved into M12 scope: client Q&A said login would be ideal.
- Real GitHub integration.
- ~~A real backend / shared database.~~ **[Amended]** Moved into M12 scope: required for accounts and shared boards. Built only after M1–M11 are done.
- Mobile responsive — desktop only is fine.
- Multi-team support. (Multiple **boards** for one team are in scope for M12; multiple separate teams/organisations are not.)
- Real-time collaboration. (Boards are shared, but a teammate's changes appear after a page refresh rather than live.)

## 13. Definition of done

The hackathon is "done" when all 13 milestone tags are pushed to your repo and visible on the dashboard. The pitch is "done" when:

- The board loads without errors, locally (frontend + backend + MariaDB) and at a hosted link that needs no registration (NFR-15). **[Amended]**
- The "Copy as Prompt Context" demo works on stage.
- **[Amended]** No live pitch: a short video/screenshots and a ~30-second written description are prepared instead.

---

## 14. Functional requirements

**Key.** *MVP* = needed for the minimum viable product (milestones M1–M11 plus the demo data needed to mark them). *Non-MVP* = planned for M12 or later. *Source* traces each requirement to where it came from:

- **CB** = client brief / milestone list
- **CQ** = client answers to class questions
- **DG** = developer's own project guide
- **TP** = starter template (PRD/README)
- **AS** = module assessment instructions

*Milestone* is where it is implemented.

| ID | Requirement | MVP | Source | Milestone |
|---|---|---|---|---|
| FR-01 | The system shall display a Kanban board with four columns, in order: To Do, In Progress, Review, Done. | MVP | CB, TP §7 | M4 |
| FR-02 | The system shall display each task as a card in the column matching its status, with a count of tasks per column. | MVP | CB | M4 |
| FR-03 | The user shall be able to create a task with a title, description, type, status, assignee and due date. | MVP | CB | M5 |
| FR-04 | The user shall be able to edit every field of an existing task. | MVP | CB | M5 |
| FR-05 | The user shall be able to delete a task, after confirming the deletion. | MVP | CB | M5 |
| FR-06 | The user shall be able to move a task to another column by changing its status, without needing to drag. | MVP | CB, CQ (accessibility) | M5 |
| FR-07 | Tasks shall persist when the page is reloaded or the browser is closed. | MVP | TP §6 | M4–M5 |
| FR-08 | The system shall visually distinguish Feature and Bug tasks using colour, an icon and a text label. | MVP | CB, CQ | M6 |
| FR-09 | The user shall be able to assign a task to one owner, shown as a badge on the card. | MVP | CB | M7 |
| FR-10 | The user shall be able to hand a task off to another person directly from the card, with a confirmation message. | MVP | TP README | M7 |
| FR-11 | The system shall show each task's due-date state: more than 2 days left (blue), 2 days or less (amber), overdue (red), done (grey, overrides date). | MVP | CB, CQ | M8 |
| FR-12 | Each due-date state shall also be shown with an icon and text (e.g. "Overdue by 2 days"), not colour alone. | MVP | CQ | M8 |
| FR-13 | The user shall be able to customise the due-date state colours, starting from accessible defaults. | Non-MVP | CQ ("extra") | M12 (optional) |
| FR-14 | The user shall be able to add and edit a long-text AI context field on a task (conversation, bug log, requirements). | MVP | CB | M9 |
| FR-15 | The user shall be able to record which AI tool the context relates to (Claude, ChatGPT, Cursor, Codex, Other…). | MVP | CB | M9 |
| FR-16 | The system shall record when a task's context was last updated, automatically. | MVP | TP §5 | M9 |
| FR-17 | The user shall be able to copy a task and its context to the clipboard as a formatted prompt in one action, with a confirmation message. | MVP | CB | M10 |
| FR-18 | The system shall show a pinned Deliverable Anchor bar above the board with slots for Presentation, Demo, Report and Documentation. | MVP | CB | M11 |
| FR-19 | The user shall be able to set, change and open the link for each deliverable slot. | MVP | CB | M11 |
| FR-20 | The system shall provide a demo dataset in which every feature and state above can be seen. | MVP | CB (M13), AS | M4, M13 |
| FR-21 | The user shall be able to write Markdown in the description and context fields and switch between Write, Split and Preview views. | Non-MVP | DG | M12 |
| FR-22 | A user shall be able to register an account with name, email, GitHub handle and password. | Non-MVP | DG, CQ (user data) | M12 |
| FR-23 | A user shall be able to log in and log out. | Non-MVP | DG, CQ | M12 |
| FR-24 | A user shall be able to create several boards, and switch, rename and delete them. | Non-MVP | DG, CB (M12), CQ | M12 |
| FR-25 | A board member shall be able to add any registered user of the instance to a board; all members have equal (admin) rights. | Non-MVP | DG, CQ | M12 |
| FR-26 | The assignee list shall contain only the members of the current board. | Non-MVP | DG | M12 |
| FR-27 | Deliverable anchors shall belong to a board, so each board has its own set. | Non-MVP | DG | M12 |
| FR-28 | The marker shall be able to use the hosted prototype without registering (for example, a pre-filled demo account or guest mode). | MVP | AS | M13 |
| FR-29 | The user shall be able to move a task to another column by dragging its card with a mouse. The status dropdown (FR-06) remains available as the non-drag alternative. | Non-MVP | CB (M12 "drag cards") | M12 (12g) |

Other M12 "secret sauce" ideas (e.g. collapsible columns, search) are added only if each one is justified; none were added beyond FR-29.

## 15. Non-functional requirements

| ID | Category | Requirement | MVP | Source |
|---|---|---|---|---|
| NFR-01 | Accessibility | The interface shall target WCAG 2.2 level AA conformance. | MVP | CQ |
| NFR-02 | Accessibility | Colour shall never be the only way information is conveyed (task type, due state, status). | MVP | CQ |
| NFR-03 | Accessibility | Text shall have a contrast ratio of at least 4.5:1, and input borders and focus indicators at least 3:1, against their background. | MVP | CQ, DESIGN.md §2 |
| NFR-04 | Accessibility | All functions shall be usable with a keyboard alone, with a clearly visible focus indicator. | MVP | CQ |
| NFR-05 | Accessibility | Dialogs shall keep focus inside while open, close with Esc, and return focus to the control that opened them. | MVP | CQ |
| NFR-06 | Accessibility | Confirmation messages (toasts) shall be announced by screen readers. | MVP | CQ |
| NFR-07 | Accessibility | Any drag-and-drop interaction shall have a non-drag alternative. | Non-MVP | CQ |
| NFR-08 | Accessibility | Animations shall last no more than 200 ms and shall be disabled when the user prefers reduced motion. | Non-MVP | DESIGN.md §4 |
| NFR-09 | Usability | The interface shall follow the single visual design system in DESIGN.md (colours, type, components, microcopy). | MVP | CB (M3), CQ |
| NFR-10 | Usability | Copying a task as a prompt shall take a single click from the task. | MVP | CB (M10) |
| NFR-11 | Performance | The board shall load and respond to user actions within 1 second with at least 100 tasks on a standard university laptop. | MVP | Inferred (usability) |
| NFR-12 | Compatibility | The app shall work in current desktop versions of Chrome, Edge and Firefox at widths of 1024 px and above; mobile layouts are out of scope. | MVP | TP §12 |
| NFR-13 | Security | Passwords shall be stored only as salted, adaptive hashes (BCrypt) and never stored or logged in plain text. | Non-MVP | DG |
| NFR-14 | Security | Board and task data shall be available only to logged-in users who are members of that board. | Non-MVP | CQ ("best not to leave exposed") |
| NFR-15 | Availability (for assessment) | The prototype shall be reachable at a link that needs no subscription or registration by the marker. | MVP | AS |
| NFR-16 | Security | User-entered Markdown shall be rendered without executing HTML or scripts. | Non-MVP | DG (Markdown), inferred |
| NFR-17 | Deployability | The full stack shall run on a university laptop without Docker or admin rights, using a local MariaDB. | Non-MVP | DG |
| NFR-18 | Deployability | The software shall be self-hostable by a single team, so that all users of an instance belong to that team. | Non-MVP | DG, CQ |
| NFR-19 | Maintainability | All data access shall go through one data-layer module (`src/api.js`), so the storage can change without changing the UI. | MVP | DG |
| NFR-20 | Privacy | Only the personal data needed for the features shall be collected (name, email, GitHub handle). | Non-MVP | CQ (user data), inferred |
| NFR-21 | Usability (readability) | Due-date labels shall stay quick to read at any distance: up to 30 days shown in days, then rounded to months (31–45 days = "1 month"), and from 12 months in years. The exact date is always shown alongside, and it includes the year when that isn't the current year. | MVP | Developer testing (long-running solo projects) |

## 16. Data requirements

| ID | Data | Fields and rules | Where it comes from | Stored in | MVP |
|---|---|---|---|---|---|
| DR-01 | Task (core) | `id` (system), `title` (required, max 120 characters), `description` (optional Markdown text), `type` (feature \| bug), `status` (one of the four stage IDs), `assignee` (name, MVP) → `assigneeId` (board member, M12), `dueDate` (optional ISO date), `createdDate` (system) | Entered by the user in the task modal; ID and created date generated by the system | localStorage (MVP) → MariaDB `task` table (M12) | MVP |
| DR-02 | Task AI context | `context` (long text, Markdown), `contextTool` (from a fixed list), `contextUpdatedAt` (system timestamp, set by the server when context or tool change) | Pasted by the user from AI tool conversations, bug logs or requirements; timestamp from the system | As DR-01 | MVP |
| DR-03 | Stage definitions | Four fixed stages with IDs and labels (PRD §7) | Template PRD | Application constants | MVP |
| DR-04 | Team member list | Display names used for assignment | MVP: fixed demo list (PRD §8). M12: taken from board members (DR-09) | Constants (MVP) → database (M12) | MVP |
| DR-05 | Deliverable anchor | `id` (presentation \| demo \| report \| documentation), `label`, `url` (optional, must be a valid http/https URL) | Entered by the user | localStorage (MVP) → MariaDB `anchor` table (M12) | MVP |
| DR-06 | Due-state settings | Thresholds (more than 2 days / 2 days or less / overdue / done) and a colour for each | Client Q&A and DESIGN.md §2 defaults; later customisable by the user (FR-13) | Application config (MVP) → user settings (M12, optional) | MVP (defaults) |
| DR-07 | User | `id`, `name` (required), `email` (required, unique), `githubHandle` (optional), `passwordHash` (BCrypt; never sent to the client), `createdAt` | Registration form (client Q&A: name, email, GitHub account) | MariaDB `user` table | Non-MVP |
| DR-08 | Board | `id`, `name` (required), `ownerId`, `createdAt` | Created by a logged-in user | MariaDB `board` table | Non-MVP |
| DR-09 | Board membership | `boardId`, `userId`, `addedAt` (unique per board and user) | A board member adds a registered user | MariaDB `board_member` table | Non-MVP |
| DR-10 | Session | `token` (random 256-bit, unguessable), `userId`, `createdAt`, `expiresAt` (7 days) | Issued by the server at login; sent to the browser only in an HttpOnly cookie | MariaDB `user_session` table | Non-MVP |
| DR-11 | Board ownership of data | `boardId` on Task and Anchor | Set by the system from the current board | MariaDB foreign keys | Non-MVP |
| DR-12 | Demo dataset | A demo account, three demo teammates and two demo boards: tasks in every column and due state, of both types, with Markdown and AI context, plus filled anchor links | Written by the developer as seed data (`DemoDataSeeder`), rebuilt on every start-up when the demo is switched on | MariaDB / MySQL (same tables) | MVP |


## 17. Implementation status (traceability)

How each requirement is met in the prototype, so features can be traced back to requirements. "Where" names the part of the app a marker can look at.

**Key:** ✅ implemented · 🔶 implemented, still to be verified · ❌ not implemented (future work)

### Functional

| ID | Status | Where |
|---|---|---|
| FR-01, FR-02 | ✅ | Board with four columns and task counts |
| FR-03, FR-04, FR-05 | ✅ | "+ New task" / click a card → task modal; Delete with confirmation |
| FR-06 | ✅ | Status dropdown on every card and in the modal |
| FR-07 | ✅ | Saved in MariaDB; survives reloads and works across browsers |
| FR-08 | ✅ | Coloured stripe + icon + "Feature"/"Bug" badge |
| FR-09, FR-10 | ✅ | Owner badge; "Hand off to…" dropdown with confirmation message |
| FR-11, FR-12 | ✅ | Due chip with colour, icon and text; card tint |
| FR-13 | ❌ | Colours live in one config (`src/lib/dueStatus.js`) ready for this, but there is no settings screen yet |
| FR-14, FR-15, FR-16 | ✅ | "AI context" section in the task modal; time set by the server |
| FR-17 | ✅ | "Copy" on each card and "Copy as prompt" in the modal |
| FR-18, FR-19 | ✅ | Deliverables bar above the board |
| FR-20 | ✅ | The developer's own data locally; demo boards seeded automatically when `app.demo.enabled=true` (hosted) |
| FR-21 | ✅ | Write / Split / Preview Markdown editor |
| FR-22, FR-23 | ✅ | Log in / Create account screens; Log out in the header |
| FR-24 | ✅ | Board switcher with New / Rename / Delete |
| FR-25, FR-26 | ✅ | Members panel; assignee lists show board members only |
| FR-27 | ✅ | Each board has its own deliverables |
| FR-28 | ✅ | "Try the demo" on the login page of https://vibetracker-8j5a.onrender.com |
| FR-29 | ✅ | Drag cards between columns |

### Non-functional

| ID | Status | Notes |
|---|---|---|
| NFR-01 | 🔶 | Built to WCAG 2.2 AA; run a Lighthouse / axe audit and record the result |
| NFR-02, NFR-03 | ✅ | Contrast ratios measured (DESIGN.md §2); every colour cue has an icon and text |
| NFR-04, NFR-05, NFR-06 | ✅ | Keyboard operation, dialog focus handling and announced messages checked during development |
| NFR-07 | ✅ | Status dropdown is the non-drag alternative |
| NFR-08 | ✅ | Only a 200 ms fade on messages, switched off with reduced motion |
| NFR-09, NFR-10 | ✅ | DESIGN.md followed throughout; one-click copy |
| NFR-11 | 🔶 | Not yet measured with 100 tasks |
| NFR-12 | 🔶 | Tested in Chromium-based browsers (Chrome / Edge); check Firefox |
| NFR-13, NFR-14 | ✅ | BCrypt hashes; every API route except login/register/health checks the session and board membership |
| NFR-15 | ✅ | Hosted at https://vibetracker-8j5a.onrender.com (Render + Aiven MySQL); first load after idle takes about a minute |
| NFR-16 | ✅ | Script tags and `javascript:` links tested and not run |
| NFR-17, NFR-18 | ✅ | Runs on the university laptop with local MariaDB; one instance per team |
| NFR-19 | ✅ | All data access in `src/api.js` (the UI didn't change when storage moved to the server) |
| NFR-20 | ✅ | Only name, email, optional GitHub username and a password hash are stored |
| NFR-21 | ✅ | Days → months → years, with the exact date |

### Data

DR-01 to DR-12 are all stored as described in §16 (tables in `backend/src/main/resources/schema.sql`), except DR-06's *customised* colours, which depend on FR-13.

---

*PRD version: hackathon-starter v1 · maintained by Prof. Dr. Ignacio Alvarez · requirements (§14–16) and status (§17) added by Archie*
