package com.vibetracker.demo;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.vibetracker.board.BoardDtos.BoardResponse;
import com.vibetracker.board.BoardService;
import com.vibetracker.model.User;
import com.vibetracker.repository.BoardRepository;
import com.vibetracker.repository.UserRepository;
import com.vibetracker.task.TaskDtos.TaskRequest;
import com.vibetracker.task.TaskService;

/**
 * Showcase sample data (FR-20, DR-12), only when app.demo.enabled=true.
 *
 * On every start-up it (re)creates a demo account, three demo teammates and two demo
 * boards full of example tasks, so the marker can see every feature and state without
 * registering (FR-28). The demo boards are wiped and rebuilt each time, so the hosted
 * demo returns to a clean state after each restart. Real users' data is never touched:
 * only boards created by the demo accounts are reset.
 *
 * Due dates are relative to today, so every due-date colour always shows.
 */
@Component
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    public static final String DEMO_EMAIL = "demo@example.com";

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository users;
    private final BoardRepository boards;
    private final BoardService boardService;
    private final TaskService taskService;
    private final String demoPassword;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DemoDataSeeder(UserRepository users,
                          BoardRepository boards,
                          BoardService boardService,
                          TaskService taskService,
                          @Value("${app.demo.password:try-the-demo}") String demoPassword) {
        this.users = users;
        this.boards = boards;
        this.boardService = boardService;
        this.taskService = taskService;
        this.demoPassword = demoPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        User alex = demoUser("Alex Morgan", DEMO_EMAIL, "alexmorgan-dev", demoPassword);
        User priya = demoUser("Priya Shah", "priya@example.com", "priya-codes", null);
        User jordan = demoUser("Jordan Lee", "jordan@example.com", null, null);
        User sam = demoUser("Sam Okafor", "sam@example.com", "samokafor", null);

        // Reset: remove boards the demo accounts created (tasks, links and members cascade).
        for (User demo : List.of(alex, priya, jordan, sam)) {
            boards.deleteAll(boards.findAllByOwnerId(demo.getId()));
        }
        boards.flush();

        seedMainBoard(alex, priya, jordan, sam);
        seedSideBoard(alex);
        log.info("Demo data ready: log in with {} or use 'Try the demo'.", DEMO_EMAIL);
    }

    /** Finds or creates a demo user. A null password gives an unguessable one (teammates can't log in). */
    private User demoUser(String name, String email, String github, String password) {
        User user = users.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setName(name);
        user.setEmail(email);
        user.setGithubHandle(github);
        String secret = password != null ? password : randomSecret();
        user.setPasswordHash(encoder.encode(secret));
        return users.save(user);
    }

    private void seedMainBoard(User alex, User priya, User jordan, User sam) {
        BoardResponse board = boardService.createBoard(alex, "Vibecoding Tracker (demo)");
        Long id = board.id();
        for (User member : List.of(priya, jordan, sam)) {
            boardService.addMember(alex, id, member.getId());
        }

        boardService.updateAnchor(alex, id, "demo", "https://github.com/Archie0709/vibecoding-project-tracker");
        boardService.updateAnchor(alex, id, "documentation", "https://github.com/Archie0709/vibecoding-project-tracker#readme");
        boardService.updateAnchor(alex, id, "report", "https://docs.google.com/document/");
        // Presentation is left empty on purpose, to show the empty-slot state.

        task(alex, id, "Set up the Spring Boot backend", """
                REST API for boards, tasks and members.

                - Spring Boot 3 + Spring Data JPA
                - MariaDB schema in `schema.sql`
                - Health check at `/api/health`""",
                "feature", "done", alex, -3, -9,
                "Claude", """
                ## Prompt used
                Create a Spring Boot 3 project with JPA entities for User, Board, Task and Anchor.
                Use MariaDB and a schema.sql file instead of ddl-auto. Keep controllers thin.""");

        task(alex, id, "Login page doesn't show an error for a wrong password", """
                Steps: enter a real email with the wrong password → nothing happens.

                **Expected:** "Email or password is incorrect." under the form.""",
                "bug", "done", jordan, -1, -6, null, null);

        task(alex, id, "Drag and drop cards between columns", """
                Mouse users can drag a card to another column.
                The status dropdown must stay as the keyboard alternative (WCAG 2.5.7).""",
                "feature", "review", priya, 1, -4,
                "Cursor", """
                Use native HTML drag and drop (no library).
                Highlight the column under the pointer; fade the card being dragged.""");

        task(alex, id, "Contrast too low on the Done badge when hovered", """
                Grey text on the hovered card measured **4.21:1** (needs 4.5:1).
                Try an outline-only chip instead of a filled one.""",
                "bug", "review", sam, 3, -2, null, null);

        task(alex, id, "Due date shows a day early in the evening", """
                Dates like `2026-10-25` are parsed as UTC by `new Date()`,
                so in the UK after 11pm the card shows the previous day.""",
                "bug", "in-progress", sam, -2, -5,
                "ChatGPT", """
                ## Bug log
                ```
                input:    dueDate = "2026-10-25"
                local:    Sat Oct 24 2026 23:30 (BST)
                shown:    "Due 24 Oct"   <- wrong
                ```
                Ask: parse YYYY-MM-DD as a *local* date without changing the stored format.""");

        task(alex, id, "Copy a task as a prompt for the AI", """
                One click copies the task and its context as Markdown,
                ready to paste into Claude, ChatGPT or Cursor.""",
                "feature", "in-progress", alex, 0, -3,
                "Claude", """
                Output format:
                1. `# Task:` title
                2. facts (type, status, owner, due)
                3. description, then this context
                Use the Clipboard API with a textarea fallback and show a toast.""");

        task(alex, id, "Record the 30-second demo video", """
                Show: board → open a task → copy prompt → paste into an AI tool.""",
                "feature", "todo", jordan, 2, -1, null, null);

        task(alex, id, "Write the accessibility section of the report", """
                Cover contrast checks, colour + icon + text for every status,
                keyboard use and the dropdown alternative to dragging.""",
                "feature", "todo", priya, 6, -1, null, null);

        task(alex, id, "Markdown preview breaks very wide tables", """
                | Column | Problem |
                |---|---|
                | Preview | Overflows the modal |

                Wrap tables in a horizontally scrollable container.""",
                "bug", "todo", null, null, 0, null, null);

        task(alex, id, "Plan the final presentation", """
                - [x] Pick the three features to show
                - [ ] Draft slides
                - [ ] Rehearse with a timer""",
                "feature", "todo", alex, 40, 0, null, null);
    }

    private void seedSideBoard(User alex) {
        BoardResponse board = boardService.createBoard(alex, "Side project (demo)");
        Long id = board.id();
        task(alex, id, "Pick a name for the side project", "", "feature", "todo", alex, 10, 0, null, null);
        task(alex, id, "Try the new AI coding agent", "Compare it with the current tool on one small task.",
                "feature", "in-progress", alex, 4, -2, "Other", "Notes go here as the experiment runs.");
        task(alex, id, "Old prototype crashes on start-up", "", "bug", "done", alex, -10, -20, null, null);
    }

    private void task(User actor, Long boardId, String title, String description, String type, String status,
                      User assignee, Integer dueInDays, int createdDaysAgo, String tool, String context) {
        LocalDate today = LocalDate.now();
        taskService.create(actor, boardId, new TaskRequest(
                title,
                description,
                type,
                status,
                assignee == null ? null : assignee.getId(),
                dueInDays == null ? null : today.plusDays(dueInDays),
                context,
                tool,
                today.plusDays(createdDaysAgo)));
    }

    private String randomSecret() {
        byte[] bytes = new byte[24];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
