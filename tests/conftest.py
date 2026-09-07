import pytest
import sys
import os
import sqlite3
from pathlib import Path

@pytest.fixture(scope="session")
def setup_path(request):
    """
    Injects the project root directory into sys.path to allow
    pytest to find modules that are structured as packages.
    The project root is assumed to be three directories up from the tests folder.
    """
    # Determine the root directory of the project
    # __file__ is relative to conftest.py (tests/conftest.py)
    current_dir = Path(__file__).resolve()
    # Go up two levels: tests/ -> project_root
    project_root = current_dir.parent.parent
    
    # Add the project root to the Python path
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    
    # Set database path to a writable location
    os.environ["DATABASE_PATH"] = str(project_root / "data" / "engine.db")
    
    print(f"\n[Path Setup] Added {project_root} to sys.path for testing.")
    yield # Yield control to the tests
    
    # Cleanup (optional, but good practice)
    if str(project_root) in sys.path:
        sys.path.remove(str(project_root))

# Optional: Fixture to set up a mock database connection for tests
@pytest.fixture(scope="session")
def db_session():
    """Provides a DatabaseManager instance configured for testing."""
    import tempfile
    import core.database_manager
    with tempfile.NamedTemporaryFile(delete=False, suffix='.db') as f:
        temp_path = f.name
    yield core.database_manager.DatabaseManager(db_path=temp_path)

# Function-level DatabaseManager fixture for tests that need a fresh DB each time
@pytest.fixture(scope="function")
def db_manager():
    """Provides a DatabaseManager instance configured for testing."""
    import tempfile
    # Create a unique file-based database for each test to avoid SQLite isolation issues
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix='.db') as f:
        temp_path = f.name
    db_mgr = core.database_manager.DatabaseManager(db_path=temp_path)
    yield db_mgr
    # Cleanup the temporary database
    try:
        import os
        os.unlink(temp_path)
    except:
        pass

# Async transcription service fixture for pytest-asyncio
@pytest.fixture
async def transcription_service():
    """Provides an isolated TranscriptionService instance for async tests."""
    from core.transcription_service import TranscriptionService
    service = TranscriptionService(model_size="mock-model", model_path="/mock/path")
    service.is_initialized = True
    yield service
    await service._cleanup()

