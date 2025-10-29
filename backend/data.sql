-- SQL script to initialize the Finance Assistant Database and its tables.

-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS finance_assistant;
-- Use the newly created or existing database
USE finance_assistant;

-- Table to store user information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    ai_query_count INT DEFAULT 0,
    last_query_date DATE DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table to store chat sessions for each user
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table to store individual messages within chat sessions
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Table to store summarized financial data for each user
CREATE TABLE IF NOT EXISTS user_summary (
    user_id INT PRIMARY KEY,
    epf_balance INT,
    credit_score INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table to store user investment details
CREATE TABLE IF NOT EXISTS user_investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    investment_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL,
    purchase_price DECIMAL(15, 2) NOT NULL,
    current_price DECIMAL(15, 2),
    purchase_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table to store user bank accounts
CREATE TABLE IF NOT EXISTS user_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NULL,
    bank_number VARCHAR(255) NULL,
    account_type VARCHAR(50),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table to store user transaction details
CREATE TABLE IF NOT EXISTS user_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    date DATE,
    descr VARCHAR(255),
    amount INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);

-- Table to store user permissions
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

-- Table to store detailed financial profile for each user
CREATE TABLE IF NOT EXISTS user_finance_profile (
    user_id INT PRIMARY KEY,
    salary DECIMAL(15, 2),
    monthly_debt_payments DECIMAL(15, 2),
    housing_cost DECIMAL(15, 2),
    transportation_cost DECIMAL(15, 2),
    food_cost DECIMAL(15, 2),
    other_expenses DECIMAL(15, 2),
    savings_goal DECIMAL(15, 2),
    risk_tolerance VARCHAR(50),
    investment_experience VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- NEW TABLE: user_finance_summary
-- Stores monthly-level financial insights, used for the dashboard (React UI)
CREATE TABLE IF NOT EXISTS user_finance_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    monthly_spending DECIMAL(15, 2) DEFAULT 0.00, -- Total spending for the month
    savings_current DECIMAL(15, 2) DEFAULT 0.00,  -- Current saved amount
    savings_goal DECIMAL(15, 2) DEFAULT 0.00,     -- Goal for savings
    ai_optimization DECIMAL(5, 2) DEFAULT 0.00,   -- Percentage optimization (AI insights)
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, month_year) -- Ensure one record per month per user
);
