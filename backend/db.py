# backend/db.py

from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

dbconfig = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER") or os.getenv("DB_USERNAME", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "finance_assistant"),
    "auth_plugin": "mysql_native_password"
}

_pool = None

def _get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="finance_pool",
            pool_size=10,
            pool_reset_session=True,
            **dbconfig
        )
    return _pool

def get_db_connection():
    return _get_pool().get_connection()
