-- Vibecoding Project Tracker — database schema (PRD §16 data requirements DR-01 – DR-11).
-- Runs on every start-up; IF NOT EXISTS makes it safe to re-run.
-- utf8mb4 so emoji and any language can be stored. DATETIME(6) values are stored in UTC.

-- DR-07 User
CREATE TABLE IF NOT EXISTS app_user (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  github_handle  VARCHAR(39)  NULL,            -- GitHub's maximum username length
  password_hash  VARCHAR(100) NOT NULL,        -- BCrypt hash, never the password itself
  created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uq_app_user_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DR-08 Board
CREATE TABLE IF NOT EXISTS board (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  owner_id    BIGINT       NOT NULL,
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_board_owner FOREIGN KEY (owner_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DR-09 Board membership (all members are equal admins)
CREATE TABLE IF NOT EXISTS board_member (
  board_id  BIGINT      NOT NULL,
  user_id   BIGINT      NOT NULL,
  added_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (board_id, user_id),
  CONSTRAINT fk_member_board FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE,
  CONSTRAINT fk_member_user  FOREIGN KEY (user_id)  REFERENCES app_user (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DR-01 / DR-02 / DR-11 Task
CREATE TABLE IF NOT EXISTS task (
  id                  BIGINT       NOT NULL AUTO_INCREMENT,
  board_id            BIGINT       NOT NULL,
  title               VARCHAR(120) NOT NULL,
  description         TEXT         NULL,
  type                VARCHAR(20)  NOT NULL DEFAULT 'feature',
  status              VARCHAR(20)  NOT NULL DEFAULT 'todo',
  assignee_id         BIGINT       NULL,
  due_date            DATE         NULL,
  created_date        DATE         NOT NULL,
  context             MEDIUMTEXT   NULL,       -- long AI conversations / logs (up to 16 MB)
  context_tool        VARCHAR(40)  NULL,
  context_updated_at  DATETIME(6)  NULL,
  PRIMARY KEY (id),
  KEY idx_task_board (board_id),
  CONSTRAINT fk_task_board    FOREIGN KEY (board_id)    REFERENCES board (id)    ON DELETE CASCADE,
  CONSTRAINT fk_task_assignee FOREIGN KEY (assignee_id) REFERENCES app_user (id) ON DELETE SET NULL,
  CONSTRAINT ck_task_type   CHECK (type IN ('feature', 'bug')),
  CONSTRAINT ck_task_status CHECK (status IN ('todo', 'in-progress', 'review', 'done'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DR-05 / DR-11 Deliverable anchor (one row per slot per board)
CREATE TABLE IF NOT EXISTS anchor (
  id        BIGINT        NOT NULL AUTO_INCREMENT,
  board_id  BIGINT        NOT NULL,
  slot      VARCHAR(20)   NOT NULL,
  label     VARCHAR(50)   NOT NULL,
  url       VARCHAR(2048) NULL,
  PRIMARY KEY (id),
  CONSTRAINT uq_anchor_board_slot UNIQUE (board_id, slot),
  CONSTRAINT fk_anchor_board FOREIGN KEY (board_id) REFERENCES board (id) ON DELETE CASCADE,
  CONSTRAINT ck_anchor_slot CHECK (slot IN ('presentation', 'demo', 'report', 'documentation'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DR-10 Session (login token)
CREATE TABLE IF NOT EXISTS user_session (
  token       VARCHAR(64) NOT NULL,            -- random, unguessable
  user_id     BIGINT      NOT NULL,
  created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  expires_at  DATETIME(6) NOT NULL,
  PRIMARY KEY (token),
  KEY idx_session_user (user_id),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
