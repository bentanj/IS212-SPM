#!/usr/bin/env bash
set -euo pipefail

# Integration Test Script for Authentication Service (matching CI behavior)
# Usage: ./test-integration.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTH_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$(dirname "$AUTH_DIR")"

echo "==> Authentication Integration Tests"

# Change to Authentication directory
cd "$AUTH_DIR"

# Activate virtual environment if it exists
if [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source "$BACKEND_DIR/venv/bin/activate"
else
    echo "Warning: Virtual environment not found. Using system Python."
fi

# Check if pytest is available
if ! command -v pytest >/dev/null 2>&1; then
    echo "Error: pytest is not available. Please install it manually."
    exit 1
fi

# Set up test environment variables (matching CI)
export ENV=test
export FLASK_ENV=test

# Load backend-level .env if present (for real DB credentials)
set +u
if [ -f "$BACKEND_DIR/.env" ]; then
  echo "Loading env from $BACKEND_DIR/.env"
  set -a
  # shellcheck disable=SC1090
  . "$BACKEND_DIR/.env"
  set +a
fi
set -u

# Check if we have real DB credentials for integration tests
missing_env=false
for v in DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME; do
  if [ -z "${!v-}" ]; then
    echo "Warning: Missing $v for integration tests"
    missing_env=true
  fi
done

if [ "$missing_env" = false ]; then
  echo "==> Real DB credentials found, running integration tests"
  export RUN_INTEGRATION=true
  
  # Run integration tests (matching CI command)
  echo "Running integration tests..."
  if pytest -q -m integration --maxfail=1 --disable-warnings --junitxml=pytest-report-integration.xml; then
    echo "✅ Integration tests passed"
  else
    echo "❌ Integration tests failed"
    exit 1
  fi
else
  echo "==> Missing DB credentials, integration tests will be skipped"
  echo "⚠️  Integration tests skipped (no real DB credentials)"
fi
