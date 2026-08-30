-- backend/data.sql
-- SQL script to initialize the Finance Assistant Database with BIGINT-safe schema.

CREATE DATABASE IF NOT EXISTS finance_assistant;
USE finance_assistant;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    ai_query_count INT DEFAULT 0,
    last_query_date DATE DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    sender ENUM('user', 'ai') NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    INDEX (session_id)
);

-- Summarized Financial Data
CREATE TABLE IF NOT EXISTS user_summary (
    user_id BIGINT PRIMARY KEY,
    epf_balance DECIMAL(15,2) DEFAULT 0.00,
    credit_score INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Investments
CREATE TABLE IF NOT EXISTS user_investments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    investment_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
    purchase_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    current_price DECIMAL(15, 2) DEFAULT 0.00,
    purchase_date DATE DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id)
);

-- Bank Accounts
CREATE TABLE IF NOT EXISTS user_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(20) UNIQUE,

    ifsc_code VARCHAR(20),
    account_type VARCHAR(50),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS user_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    category VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    transaction_type ENUM('credit', 'debit') DEFAULT 'debit',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES user_accounts(id) ON DELETE CASCADE,
    INDEX (user_id),
    INDEX (account_id)
);

-- User Goals
CREATE TABLE IF NOT EXISTS user_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_progress DECIMAL(15, 2) DEFAULT 0.00,
    deadline DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id)
);

-- Permissions
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id BIGINT PRIMARY KEY,
    assets BOOLEAN DEFAULT TRUE,
    liabilities BOOLEAN DEFAULT TRUE,
    transactions BOOLEAN DEFAULT TRUE,
    investments BOOLEAN DEFAULT TRUE,
    epf BOOLEAN DEFAULT TRUE,
    credit_score BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Detailed Profile
CREATE TABLE IF NOT EXISTS user_finance_profile (
    user_id BIGINT PRIMARY KEY,
    salary DECIMAL(15, 2) DEFAULT 0.00,
    monthly_debt_payments DECIMAL(15, 2) DEFAULT 0.00,
    housing_cost DECIMAL(15, 2) DEFAULT 0.00,
    transportation_cost DECIMAL(15, 2) DEFAULT 0.00,
    food_cost DECIMAL(15, 2) DEFAULT 0.00,
    other_expenses DECIMAL(15, 2) DEFAULT 0.00,
    savings_goal DECIMAL(15, 2) DEFAULT 0.00,
    risk_tolerance VARCHAR(50) DEFAULT 'medium',
    investment_experience VARCHAR(50) DEFAULT 'beginner',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Monthly Dashboard Summary
CREATE TABLE IF NOT EXISTS user_finance_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    month_year CHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    monthly_spending DECIMAL(15, 2) DEFAULT 0.00,
    savings_current DECIMAL(15, 2) DEFAULT 0.00,
    savings_goal DECIMAL(15, 2) DEFAULT 0.00,
    ai_optimization DECIMAL(5, 2) DEFAULT 0.00,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, month_year),
    INDEX (user_id)
);