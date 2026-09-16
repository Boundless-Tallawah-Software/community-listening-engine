# Python Backend

The `api/` and `core/` directories contain the original **Python** implementation of the API and background workers used when the project was running in a Dockerised environment. These modules are no longer the primary entry point but are kept for reference and backward compatibility.

Key modules:
- `api/main.py` – FastAPI application exposing health endpoints and webhook handlers.
- `core/database_manager.py` – SQLite/PostgreSQL abstraction.
- `core/intelligence_service.py` – Basic mock intelligence logic.
- `core/transcription_service.py` – Wrapper around Whisper.

These modules are packaged as a Python package and can still be executed locally (e.g., `python -m api.main`).
