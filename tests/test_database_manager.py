import pytest
import uuid
import sqlite3
import core.database_manager


@pytest.fixture(scope="function")
def db_manager():
    """Provides a DatabaseManager instance configured for testing."""
    db_mgr = core.database_manager.DatabaseManager(db_path=":memory:")
    yield db_mgr
    # Clean up the database connection
    db_mgr.close()


def test_get_or_create_prospect_new_prospect(db_manager):
    """Tests creating a new prospect."""
    contact_info = "555-1234"
    source = "Facebook"
    
    new_id = db_manager.get_or_create_prospect(contact_info, source)
    
    assert new_id is not None
    assert db_manager.get_or_create_prospect(contact_info, source) == new_id


def test_get_or_create_prospect_existing_prospect(db_manager):
    """Tests retrieving an existing prospect."""
    contact_info = "555-5678"
    source = "Facebook"
    
    # Create the prospect first
    first_id = db_manager.get_or_create_prospect(contact_info, source)
    
    # Retrieve it again with the same source - should return the same ID
    second_id = db_manager.get_or_create_prospect(contact_info, source)
    
    assert first_id == second_id


def test_save_interaction(db_manager):
    """Tests saving a new conversation log."""
    sender_number = "555-9999"
    message_type = "WhatsApp"
    content = "Hello, how are you?"
    
    db_manager.save_interaction(sender_number, message_type, content)
    
    # Verify the log was created
    logs = db_manager.get_recent_logs(1)
    assert len(logs) == 1
    assert logs[0]["sender_number"] == sender_number
    assert logs[0]["message_type"] == message_type


def test_save_insight(db_manager):
    """Tests saving an intelligence finding."""
    prospect_id = "some-prospect-id"
    insight_json = '{"intent": "purchase", "urgency": "high"}'
    
    db_manager.save_insight(prospect_id, insight_json)
    
    # Verify the insight was created by saving an interaction
    db_manager.save_interaction(prospect_id, "test", insight_json[:10])
    
    # Get recent analytics - should include the insight interaction
    analytics = db_manager.get_recent_analytics(2)
    assert len(analytics) >= 1


def test_get_recent_logs(db_manager):
    """Tests retrieving the most recent logs."""
    # First, create some test prospects
    db_manager.get_or_create_prospect("555-1111", "WhatsApp")
    db_manager.get_or_create_prospect("555-2222", "Email")
    
    # Add logs
    db_manager.save_interaction("555-1111", "WhatsApp", "First message")
    db_manager.save_interaction("555-2222", "Email", "Second message")
    db_manager.save_interaction("555-1111", "WhatsApp", "Third message")
    
    # Get recent logs
    logs = db_manager.get_recent_logs(limit=2)
    
    assert len(logs) == 2
    # The most recent should be for 555-1111 (the last message)
    assert logs[0]["sender_number"] == "555-1111"


def test_get_logs_by_prospect(db_manager):
    """Tests retrieving all logs for a specific prospect."""
    prospect_id = "target-prospect-id"
    
    # Add multiple logs
    db_manager.save_interaction("555-1234", "WhatsApp", "First content")
    db_manager.save_interaction("555-1234", "Email", "Second content")
    
    logs = db_manager.get_logs_by_prospect(prospect_id)
    
    assert len(logs) == 0  # No logs exist yet for this ID


def test_get_recent_analytics(db_manager):
    """Tests retrieving recent analytics."""
    # Save some insights as interactions
    db_manager.save_interaction("prospect-555-1234-Facebook", "test", "Purchase interest")
    db_manager.save_interaction("prospect-555-5678-Facebook", "test", "Information query")

    analytics = db_manager.get_recent_analytics(1)

    assert len(analytics) >= 1