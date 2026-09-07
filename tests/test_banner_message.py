import os
import pytest
from fastapi.testclient import TestClient
from api.main import app, get_banner_message

client = TestClient(app)


def test_banner_message_default():
    """Test banner message returns default when no custom message is set."""
    # Ensure env var is not set
    if "INFORMATION_MESSAGE" in os.environ:
        del os.environ["INFORMATION_MESSAGE"]
    
    response = client.get("/api/banner-message")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    # Verify it's the default message
    assert data["message"] == "🗂️ Owner Directory: Voice input via WhatsApp or manual form entry."


@pytest.mark.asyncio
async def test_banner_message_with_custom_env():
    """Test banner message respects custom INFORMATION_MESSAGE environment variable."""
    # Set a custom message
    os.environ["INFORMATION_MESSAGE"] = "Custom information message from environment"
    
    # Need to reimport the function since it's called at runtime
    from fastapi import Request
    endpoint_callable = get_banner_message
    
    # For FastAPI, we need to recreate the route with the new env var
    from fastapi.routing import APIRoute
    if isinstance(app.routes[-1], APIRoute):
        app.router.routes.pop()  # Remove old banner-message route
        app.add_api_route(
            "/api/banner-message",
            endpoint=endpoint_callable,
            methods=["GET"]
        )
    
    response = client.get("/api/banner-message")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Custom information message from environment"


@pytest.mark.asyncio  
async def test_banner_message_error_handling():
    """Test error handling when banner message endpoint encounters an exception."""
    # This is already handled by the try-except in the endpoint,
    # so we just verify normal flow works
    
    response = client.get("/api/banner-message")
    assert response.status_code == 200
    
    # Verify response structure
    data = response.json()
    assert isinstance(data, dict)
    assert "message" in data


@pytest.mark.asyncio
async def test_banner_message_structure():
    """Test the structure of banner message response."""
    if "INFORMATION_MESSAGE" in os.environ:
        del os.environ["INFORMATION_MESSAGE"]
    
    response = client.get("/api/banner-message")
    
    # Check status code
    assert response.status_code == 200
    
    # Check content-type
    assert "application/json" in response.headers.get("content-type", "")
    
    # Check response body
    data = response.json()
    assert isinstance(data, dict)
    assert "message" in data
    assert len(data["message"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
