import httpx
import pytest
from fastapi.testclient import TestClient
from community_listening_engine.api.main import app

client = TestClient(app)

def test_health_check():
    """Verify the API is alive and reporting status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()

def test_whatsapp_webhook_text_success():
    """Test text-based WhatsApp webhook ingestion."""
    payload = {
        "id": "test_msg_123",
        "from": "+1234567890",
        "api_type": "text",
        "body": "Hello, this is a test message."
    }
    response = client.post("/webhooks/whatsapp", json=payload)
    assert response.status_code == 200
    assert response.json()["message_id"] == "test_msg_123"
    assert response.json()["status"] == "accepted"

def test_whatsapp_webhook_audio_success():
    """Test audio-based WhatsApp webhook ingestion."""
    payload = {
        "id": "test_audio_456",
        "from": "+0987654321",
        "api_type": "audio",
        "audio_url": "http://example.com/voice_note.mp3"
    }
    response = client.post("/webhooks/whatsapp", json=payload)
    assert response.status_code == 200
    assert response.json()["message_id"] == "test_audio_456"

def test_webhook_missing_identity():
    """Test error handling for missing sender identity."""
    payload = {
        "id": "bad_msg",
        "api_type": "text",
        "body": "Where is the sender?"
    }
    response = client.post("/webpoints/whatsapp", json=payload) # Intentionally wrong path to check routing or 404, but let's test actual error logic on correct path
    # Testing error logic on correct path:
    response = client.post("/webhooks/whatsapp", json={"id": "no_from"})
    assert response.status_code == 400
    assert "Missing sender identity" in response.json()["detail"]

if __name__ == "__main__":
    # Run tests manually if script is executed
    pytest.main([__file__])
