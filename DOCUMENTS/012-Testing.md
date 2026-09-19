# Testing Guide

## Test Suite Overview

This project includes a comprehensive test suite covering the Core business logic, API endpoints, and Service layer components.

### Test Coverage
- **Database Manager**: 7 tests covering prospect management, interactions, and analytics
- **Intelligence Service**: 6 tests for Ollama integration and fallback mechanisms
- **Transcription Service**: 4 tests for audio processing pipelines
- **API Layer**: 4 tests for webhook handlers and health checks

**Total: 21 tests** - All passing ✅

## Running Tests

### Run All Tests
```bash
pytest tests/ -v
```

### Individual Test Suites

#### API Tests
```bash
pytest tests/test_api.py -v
```

Tests verify:
- `/health` endpoint responds correctly
- WhatsApp webhook handles text messages
- Audio webhook processing flows
- Error handling for missing sender identity

#### Database Manager Tests
```bash
pytest tests/test_database_manager.py -v
```

Tests verify:
- `get_or_create_prospect()` creates new and fetches existing
- `save_interaction()` logs properly
- `save_insight()` stores intelligence findings
- `get_recent_logs()` retrieves conversation history
- `get_logs_by_prospect()` filters correctly
- `get_recent_analytics()` returns analytics data

#### Intelligence Service Tests
```bash
pytest tests/test_intelligence_service.py -v
```

Tests verify:
- Initialization succeeds when Ollama is reachable
- Graceful degradation on connection failures
- Insight extraction with proper JSON parsing
- Fallback mechanisms for offline mode
- Custom prompt execution via `run_prompt()`

#### Transcription Service Tests
```bash
pytest tests/test_transcription_service.py -v
```

Tests verify:
- Service initialization
- Audio transcription success path
- Handling uninitialized state
- Utility logging functions

### Coverage Report
```bash
pytest --cov=. --cov-report=html --cov-report=term-missing
```

## Static File Handling

The API handles static files conditionally to support both development and production:

### Environment Variables

```env
# Set to 'production' to require explicit static files in ./static
# Default: development mode (serves any existing ./static)
export SERVER_MODE=production
```

### Development Mode (Default)
- Serves files from `./static` if they exist
- Gracefully skips mounting if directory missing
- Tests always pass without requiring `./static`

### Production Mode
- Requires static files to be present in `./static`
- Enables production hardening features (if added later)

## Test Fixtures

See `tests/conftest.py` for:
- Database fixtures using temporary SQLite files
- Transcription service mock setup
- HTTPx client mocking for intelligence tests

## Test Best Practices

1. **Use function-scoped fixtures** to isolate test state
2. **Mock external dependencies** (Ollama, transcription APIs)
3. **Test edge cases** and error paths explicitly
4. **Keep tests fast** by using in-memory databases where possible
5. **Verify both success and failure modes**

## CI/CD Integration

Tests run automatically on push to main branch before merge.

To add custom pre-commit checks:

```yaml
# .github/workflows/test.yml example
steps:
  - run: pytest tests/ -v --cov
  - assert: all 21 tests pass
    threshold: > 80% coverage for new code
```

## Troubleshooting

### Test Collection Error
If `test_api.py` fails to import:
- Ensure `api/main.py` is correct (no syntax errors)
- Static files optional in dev, handled gracefully

### Database Isolation Issues
Tests use temporary SQLite files. If tests share state unexpectedly:
- Check that conftest fixtures are properly scoped
- Each function-scoped fixture creates a fresh DB instance

### Mock Setup Failures
The intelligence and transcription tests use async mocking:
- Verify `unittest.mock.patch` targets correct module paths
- Async fixtures work with pytest-asyncio mode=STRICT

## Next Steps

1. Add new features → Update corresponding service logic
2. Write unit tests for new functionality
3. Run full test suite to verify no regressions
4. Check coverage before merging
