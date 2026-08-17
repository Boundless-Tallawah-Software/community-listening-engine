from fastapi import FastAPI, HTTPException, Request
import sqlite3
from contextlib import contextmanager
from api.webhooks import router as webhook_router

app = FastAPI(title="Community Listening Engine API")

# Include the Webhook routes into the main application
app.include_router(webhook_router)

@app.get("/health")
async def health_check():
    """Endpoint to verify database and system connectivity."""
    try:
        db_path = "community_listening_engine/data/engine.db"
        conn = sqlite3.connect(db_path)
        # Check if we can read a table
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        conn.close()
        
        if tables:
            return {"status": "healthy", "database": "connected", "tables_found": len(tables)}
        else:
            raise HTTPException(status_code=500, detail="Database initialized but no tables found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Community Listening Engine API is running."}
