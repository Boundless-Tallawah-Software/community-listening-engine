# AGENTS.md - Community Listening Engine

## 🎯 Project Overview

This repository contains the **Community Listening Engine**, an AI-powered system designed to:
- Process and analyze community feedback from multiple channels  
- Transcribe conversations (voice/text)
- Store and manage intelligence data
- Provide APIs for consuming insights

---

## 🏗️ Repository Structure

```
.
├── AGENTS.md                    # This file - Agent coordination guide
├── Community Listening Engine/  # Main application module
│   └── PLANS/                   # Generated plans and strategies
├── api/                         # API endpoints and webhooks
│   ├── main.py                 # API server entry point
│   ├── webhooks.py             # Webhook handlers
│   └── Dockerfile              # Container build instructions
├── core/                        # Core business logic
│   ├── database_manager.py     # Database operations
│   ├── intelligence_service.py # AI intelligence processing
│   └── transcription_service.py # Transcription functionality
│   └── Dockerfile
├── models/                      # Data models (currently empty)
├── web/                         # Web interface/components
├── data/                        # Data files and storage
├── tests/                       # Test suite
├── requirements.txt             # Python dependencies
├── docker-compose.yml           # Container orchestration
└── .gitignore                   # Git ignore rules
```

---

## 🤖 Agent Roles & Responsibilities

### 1. **Builder Agent** 🔨
**Primary Domain**: Build systems, Docker, deployments

**Permissions**:
- ✅ Read/write to `api/`, `core/`, `web/` Dockerfiles
- ✅ Run build commands via builder tools
- ✅ Manage `docker-compose.yml` updates
- ✅ Handle dependency resolution in `requirements.txt`
- ❌ Cannot modify source logic directly (unless elevated)

**Key Tasks**:
- Container image builds and optimizations
- Deployment pipeline maintenance
- Environment variable management
- Infrastructure as code updates

---

### 2. **Dev Agent** 💻
**Primary Domain**: Feature development, bug fixes, enhancements

**Permissions**:
- ✅ Full read/write to `api/`, `core/`, `web/` source files
- ✅ Modify logic in `database_manager.py`, `intelligence_service.py`, `transcription_service.py`
- ✅ Create/update models in `models/` directory
- ✅ Write unit tests in `tests/`
- ✅ Update documentation and comments
- ❌ Cannot modify Dockerfiles or compose files (use Builder Agent)

**Key Tasks**:
- Implementing new API endpoints in `api/main.py`
- Enhancing intelligence algorithms in `core/intelligence_service.py`
- Improving transcription accuracy in `core/transcription_service.py`
- Writing and maintaining tests
- Bug fixes across all modules

---

### 3. **Review Agent** 🔍
**Primary Domain**: Code quality, security, best practices

**Permissions**:
- ✅ Read-only access to entire repository
- ✅ Analyze code patterns and complexity
- ✅ Check for security vulnerabilities
- ✅ Validate test coverage
- ❌ Cannot make any write changes (must recommend to Dev/Builder Agents)

**Key Tasks**:
- Pre-commit code reviews
- Security scanning before merges
- Performance optimization suggestions
- Documentation completeness checks
- API contract validation

---

### 4. **Data Agent** 📊
**Primary Domain**: Data processing, analytics, insights

**Permissions**:
- ✅ Read/write to `data/` directory
- ✅ Create sample data for testing
- ✅ Process transcription outputs
- ❌ Cannot modify core business logic directly
- ❌ Cannot make permanent production changes

**Key Tasks**:
- Loading initial datasets
- Processing batch transcriptions
- Creating analytics reports
- Managing test fixtures

---

## 🔐 Security & Access Control

### Read-Only Operations (All Agents)
```
✅ Reading any file
✅ Running code analysis tools
✅ Viewing logs and debug output
✅ Fetching dependency info
```

### Write Operations Required for:
| Action | Required Agent(s) | Notes |
|--------|-------------------|---------|
| Modify source code | Dev Agent | Must follow coding standards |
| Update Docker configuration | Builder Agent | Container optimization only |
| Add new models | Dev + Review Agent | Requires review workflow |
| Modify test files | Dev Agent | Keep coverage >80% |
| Process data files | Data Agent | Temporary writes OK |

### Prohibited Operations 🔴
```
❌ Direct database modifications without approval
❌ Writing to secrets/credentials files  
❌ External API calls outside defined scope
❌ Deleting repository content
❌ Modifying `.gitignore` structure
```

---

## 🛠️ Tool Usage Guidelines

### Build Tools (Builder Agent)
```bash
# Allowed commands for Builder Agent
docker build -f api/Dockerfile -t listening-engine:api .
docker build -f core/Dockerfile -t listening-engine:core .  
docker-compose up --build
docker-compose down

# NOT allowed without explicit approval:
docker push to external registries
docker rm production containers
```

### API Development (Dev Agent)
```python
# Standard workflow for new endpoints
1. Dev Agent creates endpoint stub in api/main.py
2. Dev Agent adds type hints and docstrings  
3. Review Agent validates implementation
4. Builder Agent updates Dockerfile if needed
5. Test suite created and validated
```

### Transcription Service (Dev/Data Agents)
- Process audio files from `data/` directory
- Output structured transcripts to `models/` or `data/processed/`
- Log processing metrics for analytics
- Handle rate limiting gracefully

---

## 🔄 Collaboration Workflows

### Feature Development Lifecycle
```
1. Dev Agent proposes feature → Creates ticket/PR description
2. Review Agent assesses impact → Provides feedback  
3. Dev Agent implements changes → Updates source code
4. Builder Agent prepares deployment artifacts → Builds containers
5. Data Agent validates data integrity → Processes samples
6. All agents review before merge → Human approval if needed
```

### Bug Fix Workflow
```
1. Review Agent identifies bug → Creates issue report
2. Dev Agent creates fix branch → Implements patch  
3. Builder Agent tests in container → Validates deployment
4. Data Agent ensures no data corruption → Verifies integrity
5. Merge after validation passes → All agents sign off
```

### Emergency Hotfixes
- **Authorized**: Dev Agent with Review Agent approval
- **Process**: Minimal change, rapid deploy, thorough post-mortem
- **Requirement**: Document all changes in PLANS/ directory

---

## 📋 Response Format Standards

All agent responses should follow this structure:

```markdown
## Context
[Brief description of current situation]

## Analysis  
[Technical assessment and implications]

## Plan
1. [Immediate action step]
2. [Secondary considerations]
3. [Long-term implications]

## Action Required
- [Specific task to execute]
- @Agent: [Which agent should act]

## Request (if needed)
- [User approval required for]
- [What information is blocking progress]
```

---

## 🧪 Testing Requirements

### Pre-Merge Checklist
- [ ] All new code has corresponding tests in `tests/`
- [ ] Tests pass with `docker-compose run --build core`
- [ ] No deprecation warnings in logs
- [ ] API contract maintained
- [ ] Documentation updated if needed

### Test Coverage Targets
- Unit tests: 80%+ coverage
- Integration tests: Critical paths covered
- E2E tests: User-facing workflows tested

---

## 📦 Deployment Guidelines

### Environment Variables (Managed by Builder)
```env
# .env.example template location
DATABASE_URL=postgresql://...
API_KEY=***
SECRET_KEY=***
TRANScription_ENDPOINT=https://api.transcribe.io/v1
WEBHOOK_URL=https://yourdomain.com/api/webhooks
```

### Deployment Checklist
- [ ] Code reviewed and merged to main
- [ ] Tests passing in CI/CD pipeline
- [ ] Docker images built with new tags
- [ ] `.gitignore` doesn't include sensitive data
- [ ] Rollback plan documented

---

## 📝 Documentation Standards

### What Gets Documented
- New API endpoints (OpenAPI/Swagger)
- Database schema changes
- Model definitions and relationships  
- Configuration parameters
- Webhook event specifications

### Where Documentation Lives
- Inline code comments (Python docstrings)
- API endpoint README files
- Configuration documentation in config files
- Architecture overview in README.md

---

## 🔗 External Integrations

### Allowed External Services
```
✅ Transcription APIs (listed in requirements.txt)
✅ Database connections (via secure env vars)
✅ Logging services (configured in docker-compose)
❌ Social media direct scraping (requires explicit approval)
❌ Storage to external SaaS without audit trail
```

### Rate Limiting & Quotas
- All external API calls must implement retry logic
- Must handle 429 responses gracefully
- Log all external failures for analysis
- Include fallback mechanisms

---

## 🧰 Quick Reference Commands

### For Dev Agents
```bash
# Start development environment
docker-compose up -d --build

# Run tests
docker-compose run core pytest

# View specific service logs  
docker-compose logs api/last 100

# Check code style
docker-compose run --build core black --check .
```

### For Builder Agents  
```bash
# Build all services
docker-compose build

# Deploy to staging
docker-compose -f docker-compose-staging.yml up -d

# Cleanup old images
docker system prune -f
```

### For Data Agents
```bash
# Process pending transcriptions  
python scripts/process_queue.py

# Generate analytics report
python core/intelligence_service.py --report daily_summary

# Load sample data
python scripts/load_sample_data.py
```

---

## 🎯 Agent Priority Matrix

| Scenario | Primary Agent | Supporting Agents | Action Required |
|----------|--------------|-------------------|------------------|
| New feature request | Dev | Review, Data, Builder | Full workflow |
| Bug in core logic | Dev | Review, Data | Quick fix if critical |
| API endpoint addition | Dev | Review, Builder | Standard PR flow |
| Docker optimization | Builder | Dev (if code changes) | Build test only |
| Transcription improvement | Dev/Data | Review | A/B testing recommended |
| Security vulnerability | All agents read-only | None | Human escalation |

---

## 🚨 Escalation Path

### When to Escalate
1. **Critical bugs** → All agents + human review immediately
2. **Security issues** → Builder + Dev + human approval  
3. **Data corruption risk** → Data + Review + rollback plan ready
4. **Deployment blocks** → Builder identifies resolution path
5. **Ambiguous requirements** → Any agent tags @human for clarification

### Communication Channels
- Use Git commits with descriptive messages
- Create issues for non-trivial changes
- Update PLANS/ directory with design decisions
- Document trade-offs in PR descriptions

---

*Generated for Community Listening Engine repository | Last updated: [auto-generated]*