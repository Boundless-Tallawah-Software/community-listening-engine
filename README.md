# Community Listening Engine

A conversation-to-client system designed to book, guide, and capture workflow conversations with business owners.

## Overview

This project transforms real-world conversations into market evidence for identifying the first paying engagement through:

- **Owner Directory**: Store contact info for identified business owners
- **Outreach Generator**: Generate personalized outreach messages in the founder's natural voice
- **Investigation Guide**: Checklist for 20-minute workflow investigations
- **Conversation Log**: Capture business type, manual process, pain points, and willingness to pay
- **Multi-Channel Input**: WhatsApp integration for receiving text/media inputs
- **Voice Pipeline**: Local transcription (faster-whisper) and intelligence (Ollama)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js (for local development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd community_listening_engine

# Start all services
docker-compose up -d

# Check service health
curl http://localhost:8880/health
```

### Access Points

- **Prospect Form**: http://localhost:8880/prospect
- **Dashboard**: http://localhost:8880/dashboard
- **API Health**: http://localhost:8880/health

## Project Structure

```
community_listening_engine/
├── api/                     # FastAPI application
│   ├── main.py             # API routes
│   ├── webhooks.py         # Webhook handlers
│   └── Dockerfile
├── core/                    # Core business logic
│   ├── database_manager.py # Database operations
│   ├── intelligence_service.py
│   ├── transcription_service.py
│   └── Dockerfile
├── web/                     # Frontend
│   ├── index.html          # Root redirect
│   ├── dashboard/          # Dashboard UI
│   └── prospect/           # Prospect entry form
├── data/                    # Data storage
├── models/                  # Data models
├── tests/                   # Test suite
├── requirements.txt         # Python dependencies
├── docker-compose.yml       # Container orchestration
└── AGENTS.md                # Agent coordination
```

## Development

### Local Development

```bash
# Run API with hot reload
cd api
uvicorn api.main:app --host 0.0.0.0 --port 8880 --reload

# Run tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

### API Endpoints

```bash
# Health check
curl http://localhost:8880/health

# Submit prospect data
curl -X POST http://localhost:8880/api/prospects \
  -H "Content-Type: application/json" \
  -d '{
    "owner_name": "John Smith",
    "business_type": "Restaurant",
    "email": "john@restaurant.com",
    "phone": "+1234567890",
    "industry": "Hospitality",
    "manual_process": "Manual customer tracking",
    "pain_point": "Losing customers during peak hours",
    "willingness_to_pay": "$100-$500"
  }'
```

## Configuration

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/communitydb
DATABASE_PATH=/app/data/community.db
API_KEY=your_api_key_here
```

### Docker Compose Services

- **database**: PostgreSQL database (port 5432)
- **api-service**: FastAPI application (port 8880)
- **worker-service**: Background processing

## Features in Progress

### Phase 1 (MVP)
- ✅ Prospect entry form
- ✅ Frontend design system
- ✅ WhatsApp webhook infrastructure
- 🔄 Database persistence
- 🔄 Dashboard UI integration

### Phase 2 (Outreach & Intelligence)
- [ ] Owner Directory CRUD operations
- [ ] Outreach message generation
- [ ] Investigation Guide UI
- [ ] Local transcription integration

### Phase 3 (Voice Pipeline)
- [ ] Audio storage system
- [ ] Whisper transcription
- [ ] Ollama intelligence extraction
- [ ] Voice note upload UI

## Design System

**Digital Atelier** - Corporate/Modern design with:
- Primary: Navy #002366
- Secondary: Gold #FFD100
- Tertiary: Green #009639
- Typography: Literata (headlines), Hanken Grotesk (body)

## Testing

```bash
# Run all tests
pytest

# Run with specific test file
pytest tests/test_api.py

# Run with coverage
pytest --cov=. --cov-report=html
```

## Documentation

- [Build Plan](./PLANS/Build%20Plan%20-%20Community%20Listening%20Engine.md)
- [Database Schema](./PLANS/db-schema-sqlite-20260813.md)
- [Docker Implementation](./PLANS/Community_Listening_Engine_Docker_Containerization_Plan.md)
- [Agent Coordination](./AGENTS.md)

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, refer to the implementation logs in the `IMPLEMENTATIONS/` folder.