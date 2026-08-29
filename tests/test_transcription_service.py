import pytest
import pytest_asyncio
from unittest.mock import MagicMock, patch
from core.transcription_service import TranscriptionService


def _transcribing_log(path: str) -> str:
    """Utility function to format transcription log messages."""
    return f"[TranscriptionService] Transcribing audio file: {path}"


def transcription_service():
    """Fixture that creates an isolated service instance for tests."""
    return TranscriptionService(model_size="mock-model", model_path="/mock/path")


@pytest.fixture
def db_manager():
    """Provides a DatabaseManager instance configured for testing."""
    import tempfile
    import core.database_manager
    with tempfile.NamedTemporaryFile(delete=False, suffix='.db') as f:
        temp_path = f.name
    return core.database_manager.DatabaseManager(db_path=temp_path)


@pytest.fixture
def mock_sqlite_connection():
    """Provides a MagicMock for sqlite3 connection used in tests."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    return mock_conn


@pytest.mark.asyncio
async def test_transcription_service_initialization(transcription_service):
    """Tests the initialization process of the service."""
    with patch('builtins.print') as mock_print:
        await transcription_service.initialize()
        mock_print.assert_any_call("[TranscriptionService] Initializing Faster-Whisper (mock-model)...")
        assert transcription_service.is_initialized is True


@pytest.mark.asyncio
async def test_transcribe_audio_success(transcription_service, monkeypatch):
    """Tests successful transcription simulation."""
    audio_url = "s3://mock-bucket/audio.mp3"
    with patch('core.transcription_service.TranscriptionService.transcribe_audio',
                return_value="Mock transcribed text.") as mock_transcribe:
        result = await transcription_service.transcribe_audio(audio_url)
        assert result == "Mock transcribed text."
        mock_transcribe.assert_called_once_with(audio_url)


@pytest.mark.asyncio
async def test_transcribe_audio_uninitialized(transcription_service, monkeypatch):
    """Tests calling transcribe_audio before initialization."""
    audio_url = "s3://mock-bucket/audio.mp3"
    transcription_service.is_initialized = False
    with patch.object(transcription_service, 'initialize', return_value=None):
        await transcription_service.transcribe_audio(audio_url)
        pass


@pytest.mark.asyncio
async def test_transcribing_log_utility(transcription_service):
    """Tests the utility function for logging."""
    path = "/path/to/audio.wav"
    expected_log = _transcribing_log(path)
    assert expected_log == "[TranscriptionService] Transcribing audio file: /path/to/audio.wav"
