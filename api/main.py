from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
import json
import sqlite3
from contextlib import contextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .webhooks import router as webhook_router
import os

app = FastAPI(title="Community Listening Engine API")

# CORS middleware for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the Webhook routes into the main application with /webhooks prefix
app.include_router(webhook_router, prefix="/webhooks")

@app.get("/health")
async def health_check():
    """Endpoint to verify database and system connectivity."""
    try:
        # Use test database path or fall back to in-memory
        db_path = os.environ.get("DATABASE_PATH", ":memory:")
        conn = sqlite3.connect(db_path)
        # Check if we can read a table
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        conn.close()

        if tables:
            return {"status": "healthy", "database": "connected", "tables_found": len(tables)}
        else:
            return {"status": "healthy", "database": "connected", "tables_found": 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Serve root form at "/"
@app.get("/", include_in_schema=False)
async def root():
    # Redirect root to prospect form
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/prospect", status_code=302)

# Serve prospect form at "/prospect"
@app.get("/prospect", include_in_schema=False)
async def prospect():
    return FileResponse("web/prospect/index.html")

# Serve dashboard at "/dashboard"
@app.get("/dashboard", include_in_schema=False)
async def dashboard():
    return FileResponse("web/dashboard/index.html")

@app.post("/api/prospects", include_in_schema=False)
async def create_prospect(data: dict):
    """API endpoint to create a new prospect/conversation entry."""
    try:
        # Use the DatabaseManager from core module
        from core.database_manager import DatabaseManager

        db_path = os.environ.get("DATABASE_PATH", ":memory:")

        # Get or create prospect using the proper database schema
        # Create a unique identifier from contact info
        contact_info = data.get("email") or data.get("phone")
        source = "Form Submission"

        # Create insights JSON string with all form data
        insights_json = json.dumps(data)

        # Save insight using DatabaseManager
        db_manager = DatabaseManager(db_path)
        db_manager.save_insight(f"prospect-{contact_info}", insights_json)

        # Close database connection
        db_manager.close()

        return {"status": "success", "message": "Prospect created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create prospect: {str(e)}")
