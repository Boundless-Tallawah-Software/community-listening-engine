import sys
import os
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
import uuid
from datetime import datetime
from core.transcription_service import TranscriptionService
from core.intelligence_service import IntelligenceService
from core.database_manager import DatabaseManager

# Initialize router before using it in decorators
router = APIRouter()

# Use a persistent file-based database path for the API
# If DATABASE_PATH environment variable is set, use it, otherwise use a temp file
api_db_path = os.getenv("DATABASE_PATH", "/tmp/community_listening_db.sqlite")
db_manager = DatabaseManager(db_path=api_db_path)

@router.post("/whatsapp")
async def handle_whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint to receive incoming WhatsApp messages via a webhook provider.
    Supports both text and audio (voice note) payloads.
    """
    payload = await request.json()

    # 1. Extract basic identity and message content
    message_id = payload.get("id", str(uuid.uuid4()))
    sender_number = payload.get("from")
    message_type = payload.get("api_type") # Using 'api_type' to match test script
    content = payload.get("body", "")

    if not sender_number:
        raise HTTPException(status_code=400, detail="Missing sender identity.")

    # 2. Persist the interaction immediately to ensure durability
    db_manager.save_interaction(sender_number, message_type, content)

    # 3. Orchestrate the pipeline in the background to avoid blocking the webhook response
    if message_type == "text":
        background_tasks.add_task(process_text_message, sender_number, content)
    elif message_type == "audio":
        audio_url = payload.get("audio_url")
        if audio_url:
            background_tasks.add_task(process_audio_message, sender_number, audio_url)

    return {"status": "accepted", "message_id": message_id}

async def process_text_message(sender: str, text: str):
    """Pipeline for text-based processing."""
    # 1. Trigger Intelligence Service to extract data from text
    intelligence = IntelligenceService()
    insights = await intelligence.extract_insights(text)

    # 2. Persist insights and link to analytics
    db_manager.save_insight(sender, str(insights))
    print(f"[PIPELINE] Processed text from {sender}: {insights}")

async def process_audio_message(sender: str, audio_url: str):
    """Pipeline for audio-based processing (Transcription -> Intelligence)."""
    # 1. Trigger Transcription Service
    transcriber = TranscriptionService()
    transcript = await transcriber.transcribe_audio(audio_url)

    # 2. Pass transcript to Intelligence Service
    intelligence = IntelligenceService()
    insights = await intelligence.extract_insights(transcript)

    # 3. Persist results

    db_manager.save_interaction(sender, "transint", transcript)
    db_manager.save_insight(sender, str(insights))
    print(f"[PIPELINE] Processed audio from {sender}. Transcript: {transcript[:50]}...")
    print(f"[PIPELINE] Extracted insights: {insights}")

@router.get("/stats")
async def get_webhook_stats():
    """Internal endpoint to monitor ingestion health."""
    return {"recent_logs": db_manager.get_recent_logs()}
