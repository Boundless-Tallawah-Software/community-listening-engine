# WhatsApp Webhook Implementation Plan

## Current Status

✅ **Basic Infrastructure Ready:**
- Webhook handler exists in `api/webhooks.py`
- Transcription service (`core/transcription_service.py`) - Faster-Whisper interface
- Intelligence service (`core/intelligence_service.py`) - Ollama integration
- Database manager - Data persistence
- Router registered in `api/main.py`

## Implementation Roadmap

### Phase 1: WhatsApp API Integration (Current Focus)

**Required Components:**

1. **WhatsApp Gateway Service**
   - Integrate Twilio WhatsApp API or Meta Business API
   - Webhook configuration for receiving messages
   - Message delivery confirmations
   - Error handling and retries

2. **Message Processing Pipeline**
   ```python
   Incoming WhatsApp Message → Authentication Check → Type Detection
   → Immediate Storage → Background Processing (Text/Audio)
   → Transcription → Intelligence Extraction → Data Storage
   → Response Generation
   ```

3. **Security & Authentication**
   - Webhook verification tokens
   - Message integrity checks
   - Rate limiting per sender
   - Fraud detection

### Phase 2: Audio Processing Enhancement

**Current Limitations:**
- Audio transcription uses mock implementation
- No actual file downloading from URLs
- Missing faster-whisper model initialization

**Required Actions:**
1. Install faster-whisper dependencies
   ```bash
   pip install faster-whisper
   ```
2. Implement audio download and storage
3. Configure model initialization
4. Add audio file cleanup (retention policy)

### Phase 3: Frontend Integration

**Dashboard Enhancements:**
1. Show recent WhatsApp conversations
2. Display transcribed transcripts
3. Show extracted insights (pain points, sentiment)
4. Link WhatsApp messages to prospects

**New API Endpoints:**
- `GET /api/whatsapp/messages` - List recent messages
- `GET /api/whatsapp/message/{id}` - Get specific message
- `GET /api/whatsapp/transcripts` - List transcripts
- `GET /api/whatsapp/insights` - AI insights summary

### Phase 4: Production Features

**WhatsApp-Specific:**
- Outbound message sending
- Scheduled message delivery
- Message templates
- Contact management

**System Features:**
- Persistent database for WhatsApp data
- Media storage (audio files)
- Export conversation reports
- Analytics dashboard

## Technical Architecture

### Current Flow
```
User sends WhatsApp → Webhook endpoint → Save to DB → Process in background
```

### Enhanced Flow
```
User sends WhatsApp → Twilio API → Webhook handler
→ Verify token → Store message → Check message type
→ Text: Run intelligence extraction
→ Audio: Download → Transcribe → Intelligence extraction
→ Save all data → Send response
```

## Required Dependencies

```txt
# core/requirements.txt
fast-whisper>=0.10.0
twilio>=8.0.0
python-decouple>=3.8
```

## Configuration Needed

```env
# .env
WHATSAPP_TWILIO_ACCOUNT_SID=your_sid
WHATSAPP_TWILIO_AUTH_TOKEN=your_token
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp
WHATSAPP_NUMBER=+1yourwhatsapp
OLLAMA_URL=http://localhost:11434
AUDIO_STORAGE_PATH=/app/data/audio/
MAX_AUDIO_RETENTION_DAYS=7
```

## Testing Strategy

### Unit Tests
- Webhook request parsing
- Message type detection
- Data storage operations

### Integration Tests
- WhatsApp API mock responses
- Transcription service integration
- Intelligence extraction pipeline

### End-to-End Tests
- Complete message flow from WhatsApp → Database → Insights

## Known Gaps

1. **Twilio Integration**: Not yet configured
2. **Authentication**: Webhook verification not implemented
3. **Audio Handling**: Mock implementation, needs real file processing
4. **Frontend Dashboard**: No WhatsApp UI components
5. **Media Storage**: No audio file management system
6. **Testing**: No webhook integration tests

## Priority Order

1. **High Priority:**
   - Install and configure Twilio WhatsApp API
   - Implement webhook authentication
   - Move transcription from mock to real implementation

2. **Medium Priority:**
   - Add audio file download and storage
   - Implement dashboard WhatsApp conversation view
   - Add basic WhatsApp analytics

3. **Low Priority:**
   - Outbound message templates
   - Advanced message scheduling
   - Multi-language support

## Next Steps

### Immediate Actions Required:
1. Add fast-whisper to requirements.txt
2. Set up Twilio account and get credentials
3. Configure webhook verification token
4. Test webhook endpoint with simulated messages
5. Move from mock to real transcription

### Development Sequence:
1. ✅ Webhook handler (already exists)
2. ⏳ Twilio integration (pending)
3. ⏳ Audio processing (needs implementation)
4. ⏳ Dashboard integration (pending)
5. ⏳ Analytics and reporting (pending)