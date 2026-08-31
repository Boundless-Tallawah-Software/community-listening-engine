import sqlite3
import json
from typing import List, Dict, Optional
from threading import local

_thread_local = local()

class DatabaseManager:
    """Manages database operations for the community listening engine."""

    def __init__(self, db_path: str = ":memory:"):
        """
        Initialize the database manager.

        Args:
            db_path: Path to the SQLite database file or ":memory:" for in-memory database
        """
        self.db_path = db_path

    def _get_connection(self):
        """Get or create a connection for the current thread."""
        if not hasattr(_thread_local, 'conn') or _thread_local.conn is None:
            _thread_local.conn = sqlite3.connect(self.db_path)
            cursor = _thread_local.conn.cursor()

            # Create tables if they don't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS prospects (
                    id TEXT PRIMARY KEY,
                    contact_info TEXT NOT NULL,
                    source TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    prospect_id TEXT NOT NULL,
                    sender_number TEXT NOT NULL,
                    message_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (prospect_id) REFERENCES prospects (id)
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS insights (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    prospect_id TEXT NOT NULL,
                    insight_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (prospect_id) REFERENCES prospects (id)
                )
            """)

            _thread_local.conn.commit()

        return _thread_local.conn

    def get_or_create_prospect(self, contact_info: str, source: str = "Unknown") -> str:
        """
        Get an existing prospect or create a new one.

        Args:
            contact_info: The contact information (phone number, email, etc.)
            source: The source channel (WhatsApp, Facebook, Email, etc.)

        Returns:
            The prospect ID
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # Try to find existing prospect
        cursor.execute(
            "SELECT id FROM prospects WHERE contact_info = ? AND source = ?",
            (contact_info, source)
        )
        result = cursor.fetchone()

        if result:
            prospect_id = result[0]
        else:
            # Create new prospect
            cursor.execute(
                "INSERT INTO prospects (id, contact_info, source) VALUES (?, ?, ?)",
                (f"prospect-{contact_info}-{source}", contact_info, source)
            )
            prospect_id = f"prospect-{contact_info}-{source}"
            conn.commit()

        return prospect_id

    def save_interaction(
        self,
        sender_number: str,
        message_type: str,
        content: str
    ) -> None:
        """
        Save a conversation interaction.

        Args:
            sender_number: The sender's phone number
            message_type: The type of message (WhatsApp, Email, etc.)
            content: The message content
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # Get or create prospect
        prospect_id = self.get_or_create_prospect(sender_number, message_type)

        # Save interaction
        cursor.execute(
            """INSERT INTO interactions (prospect_id, sender_number, message_type, content)
               VALUES (?, ?, ?, ?)""",
            (prospect_id, sender_number, message_type, content)
        )

        conn.commit()

    def save_insight(self, prospect_id: str, insight_json: str) -> None:
        """
        Save an intelligence insight for a prospect.

        Args:
            prospect_id: The prospect ID
            insight_json: JSON string containing the insight data
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """INSERT INTO insights (prospect_id, insight_json)
               VALUES (?, ?)""",
            (prospect_id, insight_json)
        )

        conn.commit()

    def get_recent_analytics(self, limit: int = 10) -> List[Dict]:
        """
        Get recent analytics data.

        Args:
            limit: Maximum number of records to return

        Returns:
            List of analytics records
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT i.id, i.prospect_id, i.sender_number, i.message_type, i.content, i.created_at
            FROM interactions i
            ORDER BY i.created_at DESC
            LIMIT ?
        """, (limit,))

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "prospect_id": row[1],
                "sender_number": row[2],
                "message_type": row[3],
                "content": row[4],
                "created_at": row[5]
            }
            for row in rows
        ]

    def get_recent_logs(self, limit: int = 10) -> List[Dict]:
        """
        Get recent conversation logs.

        Args:
            limit: Maximum number of records to return

        Returns:
            List of recent logs
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT i.id, i.prospect_id, i.sender_number, i.message_type, i.content, i.created_at
            FROM interactions i
            ORDER BY i.created_at DESC
            LIMIT ?
        """, (limit,))

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "prospect_id": row[1],
                "sender_number": row[2],
                "message_type": row[3],
                "content": row[4],
                "created_at": row[5]
            }
            for row in rows
        ]

    def get_logs_by_prospect(self, prospect_id: str) -> List[Dict]:
        """
        Get all logs for a specific prospect.

        Args:
            prospect_id: The prospect ID

        Returns:
            List of logs for the prospect
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT i.id, i.prospect_id, i.sender_number, i.message_type, i.content, i.created_at
            FROM interactions i
            WHERE i.prospect_id = ?
            ORDER BY i.created_at DESC
        """, (prospect_id,))

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "prospect_id": row[1],
                "sender_number": row[2],
                "message_type": row[3],
                "content": row[4],
                "created_at": row[5]
            }
            for row in rows
        ]

    def close(self):
        """Close the database connection for the current thread."""
        if hasattr(_thread_local, 'conn') and _thread_local.conn is not None:
            _thread_local.conn.close()
            _thread_local.conn = None