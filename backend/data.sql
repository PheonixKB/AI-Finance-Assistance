-- Finanace Assistant Database
CREATE DATABASE IF NOT EXISTS finance_assistant;
USE finance_assistant;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- User finance summary data (one row per user)
CREATE TABLE IF NOT EXISTS user_finance (
    user_id INT PRIMARY KEY,
    cash INT,
    bank INT,
    loans INT,
    credit_card INT,
    mutual_funds INT,
    stocks INT,
    epf_balance INT,
    credit_score INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User transactions
CREATE TABLE IF NOT EXISTS user_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE,
    descr VARCHAR(255),
    amount INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User permissions for data access
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INT PRIMARY KEY,
    assets BOOLEAN DEFAULT TRUE,
    liabilities BOOLEAN DEFAULT TRUE,
    transactions BOOLEAN DEFAULT TRUE,
    investments BOOLEAN DEFAULT TRUE,
    epf BOOLEAN DEFAULT TRUE,
    creditScore BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
