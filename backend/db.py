# backend/db.py

import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

# MySQL connection configuration
dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "finance_assistant"),
    "auth_plugin": "mysql_native_password"  # required for MySQL 8 default auth
}

# Create a connection pool
connection_pool = pooling.MySQLConnectionPool(
    pool_name="finance_pool",
    pool_size=10,
    pool_reset_session=True,   # resets session variables
    **dbconfig
)

# Function to get a connection from the pool
def get_db_connection():
    return connection_pool.get_connection()
