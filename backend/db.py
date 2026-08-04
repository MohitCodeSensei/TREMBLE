import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import mysql.connector
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL")
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT", "5432")

def is_postgres():
    if DATABASE_URL and ("postgres" in DATABASE_URL or "5432" in str(DATABASE_URL) or "supabase" in str(DATABASE_URL)):
        return True
    if DB_HOST and ("supabase" in DB_HOST or "postgres" in str(DB_HOST) or DB_PORT == "5432"):
        return True
    return False

def init_tables():
    conn = get_db()
    if not conn:
        return
    try:
        cur = conn.cursor()
        if conn.is_pg:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    profile_picture_url TEXT
                );
                CREATE TABLE IF NOT EXISTS liked_songs (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    track_id VARCHAR(255) NOT NULL,
                    track_data JSONB NOT NULL,
                    UNIQUE(user_id, track_id)
                );
                CREATE TABLE IF NOT EXISTS listening_history (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    track_id VARCHAR(255) NOT NULL,
                    track_data JSONB NOT NULL,
                    play_count INT DEFAULT 1,
                    listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS user_playlists (
                    id SERIAL PRIMARY KEY,
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    tracks JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            cur.close()
            print("Supabase PostgreSQL tables verified/initialized.")
    except Exception as e:
        print("Database initialization note:", e)
    finally:
        conn.close()

class DBCursorWrapper:
    def __init__(self, raw_cur, is_pg, conn):
        self.raw_cur = raw_cur
        self.is_pg = is_pg
        self.conn = conn
        self.lastrowid = None

    def execute(self, sql, params=None):
        query = sql
        if self.is_pg:
            # Adapt MySQL INSERT IGNORE to Postgres ON CONFLICT DO NOTHING
            if "INSERT IGNORE INTO liked_songs" in query:
                query = query.replace(
                    "INSERT IGNORE INTO liked_songs (user_id, track_id, track_data) VALUES (%s, %s, %s)",
                    "INSERT INTO liked_songs (user_id, track_id, track_data) VALUES (%s, %s, %s) ON CONFLICT (user_id, track_id) DO NOTHING"
                )
            elif "INSERT IGNORE" in query:
                query = query.replace("INSERT IGNORE INTO", "INSERT INTO") + " ON CONFLICT DO NOTHING"

            # Adapt lastrowid capturing via RETURNING id
            if "INSERT INTO users" in query and "RETURNING id" not in query:
                query = query + " RETURNING id"
            elif "INSERT INTO user_playlists" in query and "RETURNING id" not in query:
                query = query + " RETURNING id"

            if params is not None:
                self.raw_cur.execute(query, params)
            else:
                self.raw_cur.execute(query)

            if "RETURNING id" in query:
                row = self.raw_cur.fetchone()
                if row:
                    self.lastrowid = row['id'] if isinstance(row, dict) else row[0]
        else:
            if params is not None:
                self.raw_cur.execute(query, params)
            else:
                self.raw_cur.execute(query)
            self.lastrowid = getattr(self.raw_cur, 'lastrowid', None)

    def fetchone(self):
        return self.raw_cur.fetchone()

    def fetchall(self):
        return self.raw_cur.fetchall()

    def close(self):
        try:
            self.raw_cur.close()
        except Exception:
            pass

class DBConnectionWrapper:
    def __init__(self, raw_conn, is_pg=True):
        self.raw_conn = raw_conn
        self.is_pg = is_pg

    def cursor(self, dictionary=True, buffered=True):
        if self.is_pg:
            cur = self.raw_conn.cursor(cursor_factory=RealDictCursor)
            return DBCursorWrapper(cur, is_pg=True, conn=self.raw_conn)
        else:
            cur = self.raw_conn.cursor(dictionary=dictionary, buffered=buffered)
            return DBCursorWrapper(cur, is_pg=False, conn=self.raw_conn)

    def commit(self):
        self.raw_conn.commit()

    def close(self):
        try:
            self.raw_conn.close()
        except Exception:
            pass

def get_db():
    if is_postgres():
        try:
            url = DATABASE_URL
            if url:
                conn = psycopg2.connect(url, connect_timeout=5)
            else:
                conn = psycopg2.connect(
                    host=DB_HOST or 'localhost',
                    user=DB_USER or 'postgres',
                    password=DB_PASSWORD or '',
                    dbname=DB_NAME or 'postgres',
                    port=int(DB_PORT) if DB_PORT else 5432,
                    connect_timeout=5
                )
            return DBConnectionWrapper(conn, is_pg=True)
        except Exception as e:
            print("PostgreSQL Database connection failed:", e)
            return None
    else:
        try:
            conn = mysql.connector.connect(
                host=DB_HOST or '127.0.0.1',
                user=DB_USER or 'root',
                password=DB_PASSWORD or '',
                database=DB_NAME or 'tremble_db',
                connection_timeout=2
            )
            return DBConnectionWrapper(conn, is_pg=False)
        except Exception as e:
            print("MySQL Database connection failed:", e)
            return None
