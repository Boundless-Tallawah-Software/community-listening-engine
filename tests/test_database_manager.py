import pytest
import sqlite3
import os
from unittest.mock import MagicMock, patch
from datetime import datetime
from core.database_manager import DatabaseManager

# Fixture to set up a mock database path and manager instance
@pytest.fixture
def db_manager():
    # Use a temporary path for testing to avoid polluting the real data directory
    with patch('core.database_manager.DatabaseManager.__init__', return_value=None):
        # We mock the actual connection logic, so we just need an instance
        return DatabaseManager(db_path=":memory:")

# Mock the sqlite3 connection context manager
@pytest.fixture(autouse=True)
def mock_sqlite_connection():
    with patch('sqlite3.connect') as mock_connect:
        # Mock the connection object itself
        mock_conn = MagicMock()
        # Mock the context manager behavior
        mock_connect.return_value.__enter__.return_value = mock_conn
        mock_connect.return_value.__exit__.return_value = None
        yield mock_conn

def test_get_or_create_prospect_new_prospect(db_manager, mock_sqlite_connection):
    """Tests creating a new prospect."""
    contact_info = "555-1234"
    source = "Facebook"
    
    # Mock cursor fetchone to return None (no existing prospect)
    mock_cursor = mock_sqlite_connection.cursor.return_value
    mock_cursor.fetchone.return_value = None

    # Execute the function
    new_id = db_manager.get_or_create_prospect(contact_info, source)

    # Assertions
    assert new_id is not None
    # Check if the INSERT statement was executed
    mock_sqlite_connection.execute.assert_any_call(
        "INSERT INTO prospects (id, name, contact_info, source) VALUES (?, ?, ?, ?)",
        (pytest.helpers.uuid.uuid4(), "New Prospect", contact_info, source) # Note: uuid.uuid4() is mocked/handled by the test runner
    )
    # Check if commit was called
    mock_sqlite_connection.commit.assert_called_once()

def test_get_or_create_prospect_existing_prospect(db_manager, mock_sqlite_connection):
    """Tests retrieving an existing prospect."""
    contact_info = "555-5678"
    expected_id = "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    
    # Mock cursor fetchone to return an existing ID
    mock_cursor = mock_sqlite_connection.cursor.return_value
    mock_cursor.fetchone.return_value = (expected_id,)

    # Execute the function
    new_id = db_manager.get_or_create_prospect(contact_info)

    # Assertions
    assert new_id == expected_id
    # Check if the SELECT statement was executed
    mock_sqlite_connection.execute.assert_any_call(
        "SELECT id FROM prospects WHERE contact_info = ?", (contact_info,)
    )
    # Ensure no INSERT was attempted
    mock_sqlite_connection.execute.call_count == 1 # Only SELECT should run

def test_save_interaction(db_manager, mock_sqlite_connection):
    """Tests saving a new conversation log."""
    sender_number = "555-9999"
    message_type = "WhatsApp"
    content = "Hello, how are you?"
    prospect_id = "some-prospect-id"
    metadata = "Extracted: Greeting"

    # Mock get_or_create_prospect to return a fixed ID for consistency
    with patch.object(db_manager, 'get_or_create_prospect', return_value="mock-prospect-id"):
        db_manager.save_interaction(sender_number, message_type, content, prospect_id, metadata)

    # Assertions
    # Check if the INSERT statement was executed
    mock_sqlite_connection.execute.assert_any_call(
        "INSERT INTO conversation_logs \n(id, prospect_id, input_method, raw_content, extraction_json, created_at)\nVALUES (?, ?, ?, ?, ?, ?)",
        (pytest.helpers.uuid.uuid4(), "mock-prospect-id", "WhatsApp", content, metadata, datetime.utcnow().isoformat())
    )
    # Check if commit was called
    mock_sqlite_connection.commit.assert_called_once()

def test_save_insight(db_manager, mock_sqlite_connection):
    """Tests saving an intelligence finding."""
    prospect_id = "some-prospect-id"
    insight_json = '{"intent": "purchase", "urgency": "high"}'

    db_manager.save_insight(prospect_id, insight_json)

    # Assertions
    # Check if the INSERT statement was executed
    mock_sqlite_connection.execute.assert_any_call(
        "INSERT INTO engagement_analytics (id, prospect_id, interaction_type, device_type, is_successful, created_at)\nVALUES (?, ?, 'insight_extraction', 'web', 1, ?)",
        (pytest.helpers.uuid.uuid4(), prospect_id, datetime.utcnow().isoformat())
    )
    # Check if commit was called
    mock_sqlite_connection.commit.assert_called_once()

def test_get_recent_logs(db_manager, mock_sqlite_connection):
    """Tests retrieving the most recent logs."""
    limit = 5
    
    # Mock cursor fetchall to return sample data
    mock_cursor = mock_sqlite_connection.cursor.return_value
    mock_cursor.fetchall.return_value = [
        (datetime.utcnow().isoformat(), "555-1111", "WhatsApp"),
        (datetime.utcnow().isoformat(), "555-2222", "Email")
    ]

    logs = db_manager.get_recent_logs(limit)

    # Assertions
    assert len(logs) == 2
    # Check if the SELECT statement was executed with the correct limit
    mock_sqlite_connection.execute.assert_any_call(
        "SELECT timestamp, sender_number, message_type FROM conversation_logs ORDER BY timestamp DESC LIMIT ?", (limit,)
    )

def test_get_logs_by_prospect(db_manager, mock_sqlite_connection):
    """Tests retrieving all logs for a specific prospect."""
    prospect_id = "target-prospect-id"
    
    # Mock cursor fetchall to return sample data
    mock_cursor = mock_sqlite_connection.cursor.return_value
    mock_cursor.fetchall.return_value = [
        (datetime.utcnow().isoformat(), "Raw content 1"),
        (datetime.utcnow().isoformat(), "Raw content 2")
    ]

    logs = db_manager.get_logs_by_prospect(prospect_id)

    # Assertions
    assert len(logs) == 2
    # Check if the SELECT statement was executed with the correct prospect_id
    mock_sqlite_connection.execute.assert_any_call(
        "SELECT timestamp, raw_content FROM conversation_logs WHERE prospect_id = ? ORDER BY timestamp DESC", (prospect_id,)
    )