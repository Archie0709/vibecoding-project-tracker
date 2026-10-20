package com.vibetracker.health;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET /api/health — quick check that the API is up and can reach MariaDB.
 * Open http://localhost:8080/api/health in a browser after starting the backend.
 */
@RestController
public class HealthController {

    private static final List<String> TABLES =
            List.of("app_user", "board", "board_member", "task", "anchor", "user_session");

    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("database", jdbc.queryForObject("SELECT VERSION()", String.class));

        Map<String, Boolean> tables = new LinkedHashMap<>();
        for (String table : TABLES) {
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
                    Integer.class, table);
            tables.put(table, count != null && count > 0);
        }
        result.put("tables", tables);
        return result;
    }
}
