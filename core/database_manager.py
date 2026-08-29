import sqlite3
import os

class DatabaseManager:
    def _init_schema(self):
        if self.db_path != ":memory:":
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with self._get_connection() as conn:
            conn.execute("""CREATE TABLE IF NOT EXISTS prospects (id TEXT PRIMARY KEY, name TEXT DEFAULT "New Prospect", contact_info TEXT UNIQUE NOT NULL, source TEXT DEFAULT "WhatsApp")""")
            conn.execute("""CREATE TABLE IF NOT EXISTS conversation_logs (id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL, sender_number TEXT NOT NULL, input_method TEXT NOT NULL, raw_content TEXT NOT NULL, extraction_json TEXT, timestamp TEXT DEFAULT CURRENT_TIMESTAMP)""")
            conn.execute("""CREATE TABLE IF NOT EXISTS engagement_analytics (id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL, interaction_type TEXT NOT NULL, device_type TEXT NOT NULL, is_successful INTEGER DEFAULT 1, timestamp TEXT DEFAULT CURRENT_TIMESTAMP)""")
            conn.commit()

    def __init__(self, db_path: str = "community_listening_engine/data/engine.db"):
        self.db_path = os.path.abspath(db_path)
        self._init_schema()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def get_or_create_prospect(self, contact_info: str, source: str = "WhatsApp") -> str:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT id FROM prospects WHERE contact_info = ?", (contact_info,))
            result = cursor.fetchone()
            if result:
                return result["id"]
            new_id = str(__import__("uuid").uuid4())
            conn.execute("INSERT INTO prospects (id, name, contact_info, source) VALUES (?, ?, ?, ?)", (new_id, "New Prospect", contact_info, source))
            conn.commit()
            return new_id

    def save_interaction(self, sender_number: str, message_type: str, content: str, metadata: str = None, prospect_id: str = None):
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT id FROM prospects WHERE contact_info = ?", (sender_number,))
            result = cursor.fetchone()
            if not result:
                prospect_id = self.get_or_create_prospect(sender_number)
            else:
                prospect_id = result["id"]
            conn.execute("INSERT INTO conversation_logs (id, prospect_id, sender_number, input_method, raw_content, extraction_json) VALUES (?, ?, ?, ?, ?, ?)", (str(__import__("uuid").uuid4()), prospect_id, sender_number, message_type, content, metadata or ""))
            conn.commit()

    def save_insight(self, prospect_id: str, insight_json: str):
        with self._get_connection() as conn:
            conn.execute("INSERT INTO engagement_analytics (id, prospect_id, interaction_type, device_type, is_successful) VALUES (?, ?, 'insight_extraction', 'web', 1)", (str(__import__("uuid").uuid4()), prospect_id))
            conn.commit()

    def get_recent_logs(self, limit: int = 10):
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT timestamp, sender_number, input_method, raw_content FROM conversation_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
            results = cursor.fetchall()
            return [{"timestamp": row["timestamp"], "sender_number": row["sender_number"], "message_type": row["input_method"], "raw_content": row["raw_content"]} for row in results]

    def get_recent_analytics(self, limit: int = 10):
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT timestamp, prospect_id, interaction_type, device_type, is_successful FROM engagement_analytics ORDER BY timestamp DESC LIMIT ?", (limit,))
            results = cursor.fetchall()
            return [{"timestamp": row["timestamp"], "prospect_id": row["prospect_id"], "interaction_type": row["interaction_type"], "device_type": row["device_type"], "is_successful": row["is_successful"]} for row in results]

    def get_logs_by_prospect(self, prospect_id: str):
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT timestamp, raw_content FROM conversation_logs WHERE prospect_id = ? ORDER BY timestamp DESC", (prospect_id,))
            results = cursor.fetchall()
            return [{"timestamp": row["timestamp"], "raw_content": row["raw_content"]} for row in results]