-- One-off database setup. Run this ONCE as root (e.g. in IntelliJ's Database console).
-- It creates the database and a dedicated app user, so the backend never runs as root
-- (principle of least privilege).
--
-- Replace CHANGE_ME with a password of your choice, and put the same password in
-- backend/src/main/resources/application-local.properties (that file is git-ignored).

CREATE DATABASE IF NOT EXISTS vibetracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'vibetracker'@'localhost' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON vibetracker.* TO 'vibetracker'@'localhost';
FLUSH PRIVILEGES;
