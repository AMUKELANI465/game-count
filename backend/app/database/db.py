"""
Very small database access layer built on sqlite3.

Kept deliberately simple for a hackathon prototype: no ORM, just a couple
of helper functions. If a real DATABASE_URL (e.g. Supabase/Postgres) is
provided later, this is the only file that needs to be swapped out - every
other module talks to the database only through the functions below.
"""
import sqlite3
import json
from contextlib import contextmanager
from datetime import datetime, timezone

from app.config import SQLITE_PATH


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def get_conn():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS surveys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_name TEXT NOT NULL,
                survey_date TEXT,
                location TEXT,
                image_path TEXT,
                annotated_image_path TEXT,
                ai_total INTEGER DEFAULT 0,
                verified_total INTEGER DEFAULT 0,
                notes TEXT,
                average_confidence REAL DEFAULT 0,
                processing_time REAL DEFAULT 0,
                status TEXT DEFAULT 'draft',
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS species_counts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
                species TEXT NOT NULL,
                ai_count INTEGER DEFAULT 0,
                verified_count INTEGER DEFAULT 0,
                average_confidence REAL DEFAULT 0
            )
            """
        )


def create_survey(data: dict) -> int:
    now = _now()
    with get_conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO surveys
                (survey_name, survey_date, location, image_path, annotated_image_path,
                 ai_total, verified_total, notes, average_confidence, processing_time,
                 status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.get("survey_name"),
                data.get("survey_date"),
                data.get("location"),
                data.get("image_path"),
                data.get("annotated_image_path"),
                data.get("ai_total", 0),
                data.get("verified_total", 0),
                data.get("notes"),
                data.get("average_confidence", 0),
                data.get("processing_time", 0),
                data.get("status", "draft"),
                now,
                now,
            ),
        )
        survey_id = cur.lastrowid

        for sc in data.get("species_counts", []):
            conn.execute(
                """
                INSERT INTO species_counts (survey_id, species, ai_count, verified_count, average_confidence)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    survey_id,
                    sc["species"],
                    sc.get("ai_count", 0),
                    sc.get("verified_count", sc.get("ai_count", 0)),
                    sc.get("average_confidence", 0),
                ),
            )
        return survey_id


def update_survey(survey_id: int, data: dict) -> bool:
    with get_conn() as conn:
        existing = conn.execute("SELECT id FROM surveys WHERE id = ?", (survey_id,)).fetchone()
        if not existing:
            return False

        fields = [
            "survey_name", "survey_date", "location", "notes",
            "verified_total", "status",
        ]
        updates = {k: v for k, v in data.items() if k in fields}
        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [_now(), survey_id]
            conn.execute(
                f"UPDATE surveys SET {set_clause}, updated_at = ? WHERE id = ?",
                values,
            )

        if "species_counts" in data:
            for sc in data["species_counts"]:
                conn.execute(
                    """
                    UPDATE species_counts SET verified_count = ?
                    WHERE survey_id = ? AND species = ?
                    """,
                    (sc["verified_count"], survey_id, sc["species"]),
                )
        return True


def delete_survey(survey_id: int) -> bool:
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM surveys WHERE id = ?", (survey_id,))
        return cur.rowcount > 0


def _row_to_survey(conn, row) -> dict:
    survey = dict(row)
    species_rows = conn.execute(
        "SELECT species, ai_count, verified_count, average_confidence FROM species_counts WHERE survey_id = ?",
        (row["id"],),
    ).fetchall()
    survey["species_counts"] = [dict(r) for r in species_rows]
    return survey


def get_survey(survey_id: int) -> dict | None:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM surveys WHERE id = ?", (survey_id,)).fetchone()
        if not row:
            return None
        return _row_to_survey(conn, row)


def list_surveys() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM surveys ORDER BY created_at DESC").fetchall()
        return [_row_to_survey(conn, r) for r in rows]
