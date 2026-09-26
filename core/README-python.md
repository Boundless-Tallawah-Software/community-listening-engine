# Core Python Utilities

The `core/` directory contains Python modules that provide shared services such as database access, transcription via Whisper, and simple intelligence extraction.  They are used by the legacy background workers.

Modules:
- `database_manager.py` – Handles SQLite/​PostgreSQL connections.
- `intelligence_service.py` – A stub for analyzing text.
- `transcription_service.py` – Calls into Whisper for audio transcription.

These files are not part of the Cloudflare worker stack but are retained for compatibility.
