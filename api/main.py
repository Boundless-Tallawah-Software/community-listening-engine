from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
import json
import sqlite3
from contextlib import contextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .webhooks import router as webhook_router
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

# Determine if we're running in production mode
# In development/test, this defaults to False unless explicitly set
production_mode = os.environ.get("SERVER_MODE") == "production"

app = FastAPI(title="Community Listening Engine API")

# Serve static files in production only, or always if files exist
if (os.path.exists("static") and not production_mode) or \
   (os.path.exists("./static")):
    app.mount("/static", StaticFiles(directory="./static"), name="static")

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
    return FileResponse("dashboard/index.html")

# Serve thank you page at "/thank-you"
@app.get("/thank-you", include_in_schema=False)
async def thank_you_page():
    """Display thank you page after successful submission."""
    return FileResponse("web/thank-you/index.html")

def send_prospect_confirmation_email(email: str, data: dict) -> bool:
    """Send confirmation email to prospect."""
    try:
        smtp_server = os.environ.get("SMTP_SERVER", "localhost")
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        smtp_username = os.environ.get("SMTP_USERNAME", "")
        smtp_password = os.environ.get("SMTP_PASSWORD", "")

        if not smtp_username or not smtp_password:
            # Skip email if credentials not configured
            return True

        # Create email message
        msg = MIMEMultipart("alternative")
        msg["From"] = smtp_username
        msg["To"] = email
        msg["Subject"] = "Conversation Submitted - Community Listening Engine"

        email_body = f"""
Thank you for submitting your conversation details to the Community Listening Engine!

Your submission has been successfully recorded in our system. 

Business Type: {data.get('business_type')}
Industry: {data.get('industry')}
{f'Phone: {data.get("phone")}' if data.get("phone") else ''}

We'll be in touch soon with personalized information relevant to your business.

Best regards,
Community Listening Engine Team
"""

        msg.attach(MIMEText(email_body, "plain"))

        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Email sending failed (non-critical): {str(e)}")
        return False

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

        # Send confirmation email if email is provided
        if data.get("email"):
            send_prospect_confirmation_email(data.get("email"), data)

        return {"status": "success", "message": "Prospect created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create prospect: {str(e)}")
