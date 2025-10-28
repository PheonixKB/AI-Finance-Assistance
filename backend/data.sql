-- SQL script to initialize the Finance Assistant Database and its tables.

-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS finance_assistant;
-- Use the newly created or existing database
USE finance_assistant;

-- Table to store user information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for the user
    username VARCHAR(50) UNIQUE NOT NULL, -- Unique username for login and display
    email VARCHAR(255) UNIQUE NOT NULL, -- Unique email address for the user
    password_hash VARCHAR(255) NOT NULL, -- Hashed password for security
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp of user creation
);

-- Table to store chat sessions for each user
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for the chat session
    user_id INT NOT NULL, -- Foreign key linking to the users table
    title VARCHAR(255), -- Title of the chat session
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of session creation
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- If a user is deleted, their sessions are also deleted
);

-- Table to store individual messages within chat sessions
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for the message
    session_id INT NOT NULL, -- Foreign key linking to the chat_sessions table
    sender VARCHAR(50) NOT NULL, -- Sender of the message (e.g., 'user', 'ai')
    text TEXT NOT NULL, -- Content of the message
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of message creation
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE -- If a session is deleted, its messages are also deleted
);

-- Table to store summarized financial data for each user
CREATE TABLE IF NOT EXISTS user_summary (
    user_id INT PRIMARY KEY, -- Foreign key and primary key linking to the users table
    epf_balance INT, -- Employee Provident Fund balance
    credit_score INT, -- User's credit score
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- If a user is deleted, their summary is also deleted
);

-- Table to store user investment details
CREATE TABLE IF NOT EXISTS user_investments (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for the investment
    user_id INT NOT NULL, -- Foreign key linking to the users table
    investment_type VARCHAR(50) NOT NULL, -- Type of investment (e.g., stock, bond, mutual fund)
    name VARCHAR(255) NOT NULL, -- Name of the investment
    quantity DECIMAL(15, 4) NOT NULL, -- Quantity of the investment
    purchase_price DECIMAL(15, 2) NOT NULL, -- Price at which the investment was purchased
    current_price DECIMAL(15, 2), -- Current market price of the investment
    purchase_date DATE, -- Date of purchase
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- If a user is deleted, their investments are also deleted
);

-- Table to store user bank accounts
CREATE TABLE IF NOT EXISTS user_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for the account
    user_id INT NOT NULL, -- Foreign key linking to the users table
    account_name VARCHAR(255) NOT NULL, -- Name given to the account by the user
    bank_name VARCHAR(255) NOT NULL, -- Name of the bank
    account_number VARCHAR(255) NULL, -- Account number (can be null for some account types)
    bank_number VARCHAR(255) NULL, -- Bank identification number (can be null)
    account_type VARCHAR(50), -- Type of account (e.g., savings, checking)
    balance DECIMAL(15, 2) DEFAULT 0.00, -- Current balance of the account
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of account creation
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- If a user is deleted, their accounts are also deleted
);

-- Table to store user transaction details
CREATE TABLE IF NOT EXISTS user_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for the transaction
    user_id INT NOT NULL, -- Foreign key linking to the users table
    account_id INT NOT NULL, -- Foreign key linking to the user_accounts table
    date DATE, -- Date of the transaction
    descr VARCHAR(255), -- Description of the transaction
    amount INT, -- Amount of the transaction
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- If a user is deleted, their transactions are also deleted
    FOREIGN KEY (account_id) REFERENCES user_accounts(id) ON DELETE CASCADE -- If an account is deleted, its transactions are also deleted
);

-- Table to store user permissions for accessing different types of data
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INT PRIMARY KEY, -- Foreign key and primary key linking to the users table
    assets BOOLEAN DEFAULT TRUE, -- Permission to view/manage assets
    liabilities BOOLEAN DEFAULT TRUE, -- Permission to view/manage liabilities
    transactions BOOLEAN DEFAULT TRUE, -- Permission to view/manage transactions
    investments BOOLEAN DEFAULT TRUE, -- Permission to view/manage investments
    epf BOOLEAN DEFAULT TRUE, -- Permission to view/manage EPF data
    creditScore BOOLEAN DEFAULT TRUE, -- Permission to view/manage credit score data
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- If a user is deleted, their permissions are also deleted
);
