#!/usr/bin/env python3
import sqlite3

# Test basic SQLite in-memory database
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)")
cursor.execute("INSERT INTO test VALUES (1, 'test')")
conn.commit()

# Test from another connection
conn2 = sqlite3.connect(":memory:")
cursor2 = conn2.cursor()
try:
    cursor2.execute("SELECT * FROM test")
    result = cursor2.fetchall()
    print(f"✓ Can access tables from new connection: {result}")
except Exception as e:
    print(f"✗ Cannot access tables from new connection: {e}")
    # Check if table exists
    cursor2.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor2.fetchall()
    print(f"Tables in second connection: {[t[0] for t in tables]}")

conn.close()
conn2.close()