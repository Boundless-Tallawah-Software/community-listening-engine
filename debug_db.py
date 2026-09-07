#!/usr/bin/env python3
import sqlite3
from core.database_manager import DatabaseManager

# Test database initialization
db = DatabaseManager(db_path=":memory:")
print("✓ Database manager initialized")

# Check tables
conn = sqlite3.connect(db.db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print(f"Tables found: {[t[0] for t in tables]}")
conn.close()

# Test operations
print("\nTesting get_or_create_prospect...")
prospect_id = db.get_or_create_prospect("555-1234", "Facebook")
print(f"✓ Prospect ID: {prospect_id}")

print("\nTesting save_interaction...")
db.save_interaction("555-9999", "WhatsApp", "Hello")

print("\nTesting save_insight...")
db.save_insight(prospect_id, '{"intent": "purchase", "urgency": "high"}')

print("\n✓ All operations completed successfully")