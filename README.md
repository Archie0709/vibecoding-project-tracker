# Vibecoding Project Tracker

**Track the task *and* the prompt that built it.**

A Kanban-style tracker for teams who build software with AI tools. Every task keeps the AI context that produced it (prompt, conversation, bug log) and can be copied back into Claude, ChatGPT or Cursor in one click. Built by Archie (Archie0709) for the UXD Vibecoding Hackathon 2026, starting from the template by Prof. Dr. Ignacio Alvarez.

**Live demo: <https://vibetracker-8j5a.onrender.com>.** Click **Try the demo**; no account is needed. The free server sleeps when idle, so the first visit can take about a minute to load.

- **Requirements:** [`PRD.md`](PRD.md). Functional, non-functional and data requirements are in §14–16, and implementation status in §17.
- **Design system:** [`DESIGN.md`](DESIGN.md), covering colours with contrast checks, type, components and microcopy.

---

## Features

| Feature | Requirement IDs |
|---|---|
| Four-column board: To Do, In Progress, Review, Done | FR-01, FR-02 |
| Add, edit and delete tasks in an accessible modal | FR-03 – FR-05 |
| Move tasks with the status dropdown **or by dragging cards** | FR-06, FR-29 |
| Feature / Bug shown by colour, icon and label | FR-08 |
| Owner badge and one-click "Hand off to…" | FR-09, FR-10 |
| Due-date states (blue / amber / red / grey) with icon and text, e.g. "Overdue by 2 days" | FR-11, FR-12, NFR-21 |
| AI context field, AI tool used, and a "last updated" time set automatically | FR-14 – FR-16 |
| **Copy as prompt**: the task and its context as Markdown, ready to paste into an AI tool | FR-17 |
| Pinned deliverables bar (Presentation, Demo, Report, Documentation) | FR-18, FR-19, FR-27 |
| Markdown in descriptions and context, with Write / Split / Preview views | FR-21 |
| Accounts: register, log in, log out (BCrypt-hashed passwords) | FR-22, FR-23 |
| Multiple boards per user: create, rename, delete, switch | FR-24 |
| Board members: add any user, remove people or leave a board; all members are equal admins | FR-25, FR-26 |
| Tasks, boards and links stored in MariaDB and shared by everyone on a board | FR-07 |

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, `lucide-react` icons, `react-markdown` + `remark-gfm` |
| Backend | Java 21, Spring Boot 3.5 (Web, Data JPA, Validation), Spring Security Crypto (BCrypt) |
| Database | MariaDB (10.6+ / 11.x) locally; MySQL 8 (Aiven) when hosted |
| Hosting | Render (Docker, free plan) |

In development, Vite forwards every `/api/...` request to the backend on port 8080. The browser therefore sees one site, so no CORS setup is needed and the login cookie just works.

---

## Running it locally

### What you need

- **Node.js** 18 or newer (for the frontend)
- **Java 21** (JDK)
- **MariaDB** running locally on port 3306, plus its root password
- **IntelliJ IDEA**, which bundles Maven. Alternatively, install Maven yourself and run `mvn spring-boot:run` from `backend/`.

### 1. Create the database (one time)

Open a query console on your MariaDB server as **root** (for example in IntelliJ's Database window) and run [`backend/db/setup.sql`](backend/db/setup.sql), first replacing `CHANGE_ME` with a password of your choice. This creates:

- a `vibetracker` database
- a `vibetracker` user that can only access that database. The app never runs as root.

### 2. Give the backend the password (one time)

In `backend/src/main/resources/`, copy `application-local.properties.example` to **`application-local.properties`** and put the same password in it:

```properties
spring.datasource.password=your-password-here
```

This file is git-ignored, so the password never reaches GitHub.

### 3. Start the backend

- **IntelliJ:** right-click `backend/pom.xml` and choose **Add as Maven Project** (first time only). Then run `com.vibetracker.VibetrackerApplication`.
- **Command line:** `cd backend` then `mvn spring-boot:run`.

The tables are created automatically on start-up from `schema.sql`, which is safe to re-run. To check it's working, open <http://localhost:8080/api/health>. It should show `"status":"ok"` and every table as `true`.

### 4. Start the frontend

From the project root:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>). Choose **Create an account**: your first board is created for you. To try members and hand-off, register a second account in a private window, then add it to your board via **Members**.

### Sample data (optional)

To get a ready-made demo board instead of typing tasks in by hand, add this line to `application-local.properties` and restart the backend:

```properties
app.demo.enabled=true
```

- **What you get:** a demo account (**Alex Morgan**, `demo@example.com`, password `try-the-demo`) with three demo teammates and two boards. The tasks cover every column, type, due-date state and AI tool, with Markdown and AI context filled in.
- **Try the demo button:** the login page shows **Try the demo**, which logs straight in without registering.
- **Resetting:** the demo boards are rebuilt on every restart. Only boards created by the demo accounts are reset; your own boards and tasks are never touched.

### Troubleshooting

| Problem | Fix |
|---|---|
| "Can't reach the server" screen | The backend isn't running. Start step 3 and press **Try again**. |
| `Access denied for user 'vibetracker'@'localhost'` | The password in `application-local.properties` doesn't match the one in `setup.sql`. Run `ALTER USER 'vibetracker'@'localhost' IDENTIFIED BY '…';` as root. |
| `Unknown database 'vibetracker'` | Step 1 hasn't been run. |
| Banner: "You have N tasks saved in this browser" | Tasks from before the database existed. **Import** puts them on the open board; **Discard** removes them. |

---

## Hosting (showcase and marking)

The app is hosted as **one Render web service** (free plan) that serves the built React app and the API from the same address, with a **free Aiven MySQL** database. MySQL runs the same `schema.sql` as MariaDB. Vercel isn't used because it can't run the Java backend. Splitting the frontend and backend across two sites would also stop the login cookie working, because browsers block cross-site cookies.

### 1. Database: Aiven (free, no credit card)

1. Sign up at [aiven.io](https://aiven.io) and create a **MySQL** service on the **Free** plan.
2. When it's running, open its **Overview** page and note the **Host**, **Port**, **User** (`avnadmin`), **Password** and **Database** (`defaultdb`).

### 2. App: Render (free)

1. Push the repo to GitHub, including `Dockerfile` and `render.yaml`.
2. Sign in at [render.com](https://render.com) with GitHub. Choose **New → Blueprint** and pick this repository. Render reads `render.yaml`.
3. Fill in the three secret values when asked:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED`
   - `SPRING_DATASOURCE_USERNAME` = `avnadmin`
   - `SPRING_DATASOURCE_PASSWORD` = the Aiven password
4. Click **Apply**. The first build takes several minutes. When it says **Live**, open `https://<your-service>.onrender.com/api/health` to check the database is connected. Then open the site and click **Try the demo**.

`render.yaml` also switches on the demo data (`APP_DEMO_ENABLED=true`) and secure cookies (`APP_AUTH_COOKIE_SECURE=true`, because the site is HTTPS). Every push to `main` redeploys automatically.

**Before a showcase or marking:**
- **Wake the site:** the free service sleeps after 15 minutes without visitors, and the first visit afterwards takes about a minute. Open it a minute early.
- **Check the database:** Aiven may power off a free database that hasn't been used for a while. Check in the Aiven console that it's running.
- **Fresh demo:** each restart puts the demo boards back to a clean state.

## Project structure

```
.
├── PRD.md, DESIGN.md          requirements and design system
├── Dockerfile, render.yaml    hosting: one container for the app + API (Render)
├── index.html, vite.config.js, tailwind.config.js
├── src/                       React frontend
│   ├── api.js                 the ONLY place that talks to the backend (data layer)
│   ├── App.jsx                login gate → header, board bar → board view
│   ├── components/            Board, Column, TaskCard, TaskModal, MarkdownEditor,
│   │                          AnchorBoard, BoardBar, MembersPanel, AuthScreen, Modal, Toast…
│   ├── hooks/                 useAuth, useBoards, useTasks, useMembers, useAnchors
│   └── lib/                   constants, dates, due-date rules, prompt builder, Markdown helpers
└── backend/                   Spring Boot REST API
    ├── db/setup.sql           one-off database + user setup
    └── src/main/
        ├── java/com/vibetracker/
        │   ├── auth/          register / login / logout, session cookie, login check
        │   ├── board/         boards, deliverable links, members
        │   ├── task/          tasks
        │   ├── user/          list of users
        │   ├── demo/          showcase sample data (only when app.demo.enabled=true)
        │   ├── model/         JPA entities
        │   ├── repository/    Spring Data repositories
        │   └── common/        error handling
        └── resources/
            ├── schema.sql     database tables (DR-01 – DR-11)
            └── application.properties
```

## REST API

Every route except register, login, logout, demo and health requires a logged-in session. Board routes also require you to be a member of that board; otherwise they answer 404.

| Method & path | Purpose |
|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | Accounts |
| `GET /api/users` | Everyone with an account (for adding members) |
| `GET/POST /api/boards` · `PATCH/DELETE /api/boards/{id}` | Boards |
| `GET/POST /api/boards/{id}/members` · `DELETE /api/boards/{id}/members/{userId}` | Members |
| `GET /api/boards/{id}/anchors` · `PUT /api/boards/{id}/anchors/{slot}` | Deliverable links |
| `GET/POST /api/boards/{id}/tasks` · `PUT/DELETE /api/boards/{id}/tasks/{taskId}` · `POST /api/boards/{id}/tasks/import` | Tasks |
| `GET /api/auth/demo` · `POST /api/auth/demo` | Is the demo on? / log in as the demo account |
| `GET /api/health` | Server and database check |

---

## Accessibility

Built to WCAG 2.2 AA (NFR-01 – NFR-08). Details and contrast measurements are in [`DESIGN.md`](DESIGN.md).

- **Colour is never the only cue:** task type and due state always have an icon and text too. Feature/Bug use violet and coral rather than green and red.
- **Contrast:** every text colour is at least 4.5:1 on every surface, and input borders at least 3:1.
- **Keyboard:**
  - Everything works with the keyboard, with a visible focus ring and a "Skip to board" link.
  - Dialogs keep focus inside, close with Esc and return focus to where you were.
  - Dragging cards is optional: the status dropdown does the same job (WCAG 2.5.7).
- **Screen readers:** confirmation messages are announced, and controls have specific names, e.g. "Hand off "Fix login" to".
- **Motion:** respects reduced-motion settings.

## Security

- **Passwords:** hashed with BCrypt (Spring Security's built-in encoder) and never stored or returned in plain text.
- **Login sessions:** random 256-bit tokens stored server-side and sent in an `HttpOnly`, `SameSite=Lax` cookie. Logging out ends the session on the server.
- **Login errors:** the same message for a wrong email or a wrong password, so accounts can't be discovered.
- **Validation:** all input is validated on the server, and the database has CHECK constraints and foreign keys.
- **Safe content:** Markdown is rendered without raw HTML. Links must be `http(s)`, so `javascript:` links are rejected.

## Known limitations / future work

- **Customisable due-date colours (FR-13):** the colours are already in one config file, but there's no settings screen yet.
- **Free hosting:** the site sleeps when idle, so the first visit afterwards is slow. Demo data is shared by every visitor until the next restart.
- **Live updates:** a teammate's changes appear after a page refresh, not live.
- **Screen size:** desktop layout only (mobile was out of scope).

---

## Milestones

| # | Tag | What it covers |
|---|---|---|
| 1 | `git-linked` | Repository linked to the hackathon portal |
| 2 | `prd-done` | PRD reviewed, plus functional, non-functional and data requirements |
| 3 | `design-done` | Design system and colour tokens |
| 4 | `data-model` | Four-column board with the data layer |
| 5 | `crud-modal` | Add / edit / delete |
| 6 | `tag-style` | Feature vs bug styling |
| 7 | `task-owner` | Owner badge and hand-off |
| 8 | `due-tint` | Due-date states |
| 9 | `task-context` | AI context field |
| 10 | `copy-context` | Copy as prompt |
| 11 | `project-deliverables` | Deliverables bar |
| 12 | `secret-sauce` | Markdown, Spring Boot + MariaDB backend, accounts, multiple boards, members, drag and drop (commits 12a–12g) |
| 13 | `pitch-ready` | README, demo data, final documentation, hosting setup |

## Use of AI tools

This prototype was built with **Claude (Anthropic)** used as an AI pair-programmer in an agent workflow, as permitted for the prototype in the module brief. The developer set the requirements, design direction and every decision. Claude was used to:

- plan the milestone order
- generate and edit the frontend and backend code
- structure the developer's requirements into the PRD tables
- check colour contrast
- test the interface in a browser before each change was handed over

Each milestone was reviewed, run and committed by the developer.
