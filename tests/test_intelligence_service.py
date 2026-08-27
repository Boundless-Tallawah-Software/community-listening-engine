import pytest
import pytest_asyncio
import httpx
import json
from unittest.mock import MagicMock, patch
from core.intelligence_service import IntelligenceService

# Fixture to provide a fresh IntelligenceService instance for each test
@pytest.fixture
def intelligence_service():
    # Use a mock URL to prevent actual network calls during unit testing
    return IntelligenceService(model_name="mock-model", ollama_url="http://mock-ollama:11434")

# Fixture to mock the httpx.AsyncClient for all tests
@pytest_asyncio.fixture(autouse=True)
def mock_httpx_client():
    with patch('httpx.AsyncClient') as MockAsyncClient:
        # Mock the client context manager
        mock_client_instance = MockAsyncClient.return_value.__aenter__.return_value
        yield mock_client_instance

@pytest.mark.asyncio
async def test_intelligence_service_initialization_success(intelligence_service, mock_httpx_client):
    """Tests successful initialization when Ollama is reachable."""
    # Mock the tags endpoint response to simulate success
    mock_client_instance = mock_httpx_client
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_client_instance.get.return_value = mock_response
    
    await intelligence_service.initialize()
    
    # Assert that the connection was attempted
    mock_client_instance.get.assert_called_once_with("http://mock-ollama:11434/api/tags", timeout=2.0)
    # Assert that the service believes it is initialized
    assert intelligence_service.is_initialized is True

@pytest.mark.asyncio
async def test_intelligence_service_initialization_failure(intelligence_service, mock_httpx_client):
    """Tests initialization failure (e.g., network error) and fallback."""
    # Mock the tags endpoint to fail (e.g., connection error)
    mock_client_instance = mock_httpx_client
    mock_client_instance.get.side_effect = httpx.ConnectError("Connection refused")
    
    await intelligence_service.initialize()
    
    # Assert that the service still runs (is_initialized is True due to fallback logic)
    assert intelligence_service.is_initialized is True

@pytest.mark.asyncio
async def test_extract_insights_success(intelligence_service, mock_httpx_client):
    """Tests successful extraction of insights from Ollama."""
    raw_text = "I need a faster solution because the current cost is too high."
    
    # Mock the POST request for insight extraction
    mock_client_instance = mock_httpx_client
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"response": json.dumps({"pain_points": ["Cost", "Speed"], "needs": ["Faster solution"], "sentiment": "Negative", "metadata": {}})}
    mock_client_instance.post.return_value = mock_response

    insights = await intelligence_service.extract_insights(raw_text)

    # Assertions
    assert isinstance(insights, dict)
    assert "pain_points" in insights
    assert insights["pain_points"] == ["Cost", "Speed"]
    mock_client_instance.post.assert_called_once()

@pytest.mark.asyncio
async def test_extract_insights_fallback(intelligence_service, mock_httpx_client):
    """Tests the fallback mechanism when Ollama is unreachable."""
    raw_text = "The service is slow and the cost is prohibitive."
    
    # Force the service into fallback mode by mocking the internal check
    with patch.object(intelligence_service, '_is_ollama_reachable', return_value=False):
        insights = await intelligence_service.extract_insights(raw_text)

    # Assertions
    assert isinstance(insights, dict)
    # Check if the fallback logic correctly identified pain points
    assert "Price sensitivity detected" in insights["pain_points"]
    assert insights["metadata"]["mode"] == "safety-mock"

@pytest.mark.asyncio
async def test_run_prompt_success(intelligence_service, mock_httpx_client):
    """Tests running a general prompt against Ollama."""
    prompt = "Summarize the key takeaways from this meeting."
    
    # Mock the POST request for general prompt generation
    mock_client_instance = mock_httpx_client
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"response": "The key takeaways are X, Y, and Z."}
    mock_client_instance.post.return_value = mock_response

    result = await intelligence_service.run_prompt(prompt)

    # Assertions
    assert result == "The key takeaways are X, Y, and Z."
    mock_client_instance.post.assert_called_once()

@pytest.mark.asyncio
async def test_run_prompt_fallback(intelligence_service, mock_httpx_client):
    """Tests running a general prompt when Ollama is unreachable."""
    prompt = "Summarize the key takeaways from this meeting."
    
    # Force the service into fallback mode
    with patch.object(intelligence_service, '_is_ollama_reachable', return_value=False):
        result = await intelligence_service.run_prompt(prompt)

    # Assertions
    assert result == "Standard response from local LLM (Fallback Mode)."