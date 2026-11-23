"""SQLite relational database layer with normalized schema and indexes."""

import sqlite3
from contextlib import contextmanager
from typing import Iterator

from .config import DB_PATH


SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reg_no TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'warden', 'technician', 'admin')),
    hostel_block TEXT,
    room_no TEXT,
    specialty TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hostel_blocks (
    block_code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    floors INTEGER NOT NULL,
    total_rooms INTEGER NOT NULL,
    warden_name TEXT NOT NULL,
    accent_color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    student_id INTEGER NOT NULL,
    block_code TEXT NOT NULL,
    floor INTEGER NOT NULL,
    room_no TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('Urgent', 'High', 'Medium', 'Low')),
    sla_hours INTEGER NOT NULL DEFAULT 24,
    triage_score INTEGER NOT NULL DEFAULT 50,
    triage_reason TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK(status IN (
        'Submitted', 'Acknowledged', 'Assigned', 'In Progress',
        'Awaiting Parts', 'Resolved', 'Reopened'
    )),
    technician_name TEXT NOT NULL DEFAULT 'Unassigned',
    visit_slot TEXT NOT NULL DEFAULT '10:00 AM – 12:00 PM',
    delay_reason TEXT NOT NULL DEFAULT '',
    staff_note TEXT NOT NULL DEFAULT '',
    has_photo INTEGER NOT NULL DEFAULT 0,
    student_confirmed INTEGER NOT NULL DEFAULT 0,
    rating INTEGER CHECK(rating IS NULL OR (rating >= 1 AND rating <= 5)),
    feedback_comment TEXT NOT NULL DEFAULT '',
    reopen_reason TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (block_code) REFERENCES hostel_blocks(block_code)
);

CREATE TABLE IF NOT EXISTS complaint_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    event_type TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    complaint_id TEXT NOT NULL,
    notif_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS spare_parts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_threshold INTEGER NOT NULL DEFAULT 5,
    unit TEXT NOT NULL DEFAULT 'pcs',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS preventive_checks (
    id TEXT PRIMARY KEY,
    block_code TEXT NOT NULL,
    task TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cp5_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_code TEXT NOT NULL,
    task_code TEXT NOT NULL,
    outcome TEXT NOT NULL,
    duration TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_complaints_block ON complaints(block_code);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_events_complaint ON complaint_events(complaint_id);
"""


def get_connection(db_path: str | None = None) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path or DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def db_session(db_path: str | None = None) -> Iterator[sqlite3.Connection]:
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path: str | None = None) -> None:
    with db_session(db_path) as conn:
        conn.executescript(SCHEMA_SQL)
