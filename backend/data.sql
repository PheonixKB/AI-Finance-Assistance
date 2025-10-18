CREATE DATABASE IF NOT EXISTS finance_assistant;
USE finance_assistant;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample user for testing:
INSERT INTO users (username, password_hash)
VALUES ('testuser', '$2b$12$EXAMPLEHASHONLY');
