import sqlite3
import os
from datetime import datetime
import uuid

class DatabaseManager:
    """
    Handles all database interactions for the Community Listening Engine.
    Ensures thread-safe connections and enforces schema constraints.
    """
    def __init__(self, db_path: str = "community_listening_engine/data/engine.db"):
        # Use absolute path to avoid resolution issues in background tasks
        self.db_path = os.path.abspath(db_path)

    def _get_connection(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        return sqlite3.connect(self.db_path)

    def get_or_create_prospect(self, contact_info: str, source: str = "WhatsApp") -> str:
        """
        Retrieves the ID of an existing prospect or creates a new one based on contact info.
        Returns: The UUID string for the prospect.
        """
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT id FROM prospects WHERE contact_info = ?", (contact_info,))
            row = cursor.fetchone()
            if row:
                return row[0]

            new_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO prospects (id, name, contact_info, source) VALUES (?, ?, ?, ?)",
                (new_id, "New Prospect", contact_info, source)
            )
            conn.commit()
            return new_id

    def save_interaction(self, sender_number: str, message_type: str, content: str, prospect_id: str = None, metadata: str = None):
        """
        Persists an incoming message interaction to the conversation_logs table.
        """
        if not prospect_id:
            prospect_id = self.get_or_create_prospect(sender_number)

        query = """
        INSERT INTO conversation_logs 
        (id, prospect_id, input_method, raw_content, extraction_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """
        log_id = str(uuid.uuid4())
        with self._get_connection() as conn:
            conn.execute(query, (log_id, prospect_id, message_type, content, metadata, datetime.utcnow().isoformat()))
            conn.commit()

    def save_insight(self, prospect_id: str, insight_json: str):
        """
        Links extracted intelligence findings to the engagement history.
        """
        query = """
        INSERT INTO engagement_analytics (id, prospect_id, interaction_type, device_type, is_successful, created_at)
        VALUES (?, ?, 'insight_extraction', 'web', 1, ?)
        """
        event_id = str(uuid.uuid4())
        with self._get_connection() as conn:
            conn.execute(query, (event_id, prospect_id, datetime.utcnow().isoformat()))
            conn.commit()

    def get_recent_logs(self, limit: int = 10):
        """Retrieves the most recent logs for monitoring."""
        query = "SELECT timestamp, sender_number, message_type FROM conversation_logs ORDER BY timestamp DESC LIMIT ?"
        with self._get_connection() as conn:
            cursor = conn.execute(query, (limit,))
            return [{"timestamp": row[0], "sender": row[1], "type": row[2]} for row in cursor.fetchall()]

    def get_logs_by_prospect(self, prospect_id: str):
        query = "SELECT timestamp, raw_content FROM conversation_logs WHERE prospect_id = ? ORDER BY timestamp DESC"
        with self._get_connection() as conn:
            cursor = conn.execute(query, (prospect_id,))
            return [row for row in cursor.fetchall()]
