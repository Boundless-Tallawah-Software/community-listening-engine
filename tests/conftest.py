import pytest
import sys
import os
from pathlib import Path

@pytest.fixture(scope="session")
def setup_path(request):
    """
    Injects the project root directory into sys.path to allow
    pytest to find modules that are structured as packages.
    The project root is assumed to be two directories up from the tests folder.
    """
    # Determine the root directory of the project
    # __file__ is relative to conftest.py (tests/conftest.py)
    current_dir = Path(__file__).resolve()
    # Go up two levels: tests/ -> / -> project_root
    project_root = current_dir.parent.parent.parent
    
    # Add the project root to the Python path
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    
    print(f"\n[Path Setup] Added {project_root} to sys.path for testing.")
    yield # Yield control to the tests
    
    # Cleanup (optional, but good practice)
    if str(project_root) in sys.path:
        sys.path.remove(str(project_root))

# Optional: Fixture to set up a mock database connection for tests
@pytest.fixture(scope="session")
def db_session():
    # Implement setup logic here to provide a test session/connection
    # Example: engine = create_engine("postgresql://user:pass@host/test_db")
    # yield Session(engine)
    pass
