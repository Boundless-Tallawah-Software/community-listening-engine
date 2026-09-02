  from fastapi import FastAPI, HTTPException, Request, FileResponse
  import sqlite3
  from contextlib import contextmanager
  from fastapi.staticfiles import StaticFiles
  from .webhooks import router as webhook_router
  import os
  
  app = FastAPI(title="Community Listening Engine API")

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

@app.get("/", include_in_schema=False)
async def root():
    # Serve the main index.html file for the UI on port 8880
    return FileResponse("web/index.html")
