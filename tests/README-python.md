# Test Suites

The `tests/` folder contains both Python and TypeScript test files.  The legacy Python tests can be executed with `pytest`, while the TypeScript tests for the Cloudflare workers are run via Jest.

Typical commands:

```bash
# Run Python tests only
pytest tests/test_*_python.py

# Run TypeScript / Jest tests
npm run test
```
