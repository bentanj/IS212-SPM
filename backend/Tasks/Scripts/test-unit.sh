#!/usr/bin/env bash
set -euo pipefail

# Unit Test Script for Tasks Service (matching CI behavior)
# Usage: ./test-unit.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Tasks Unit Tests"

# Change to Tasks directory
cd "$TASKS_DIR"

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
export DB_USER="${DB_USER:-test_user}"
export DB_PASSWORD="${DB_PASSWORD:-test_password}"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5432}"
export DB_NAME="${DB_NAME:-testdb}"

# Run unit tests (matching CI command)
echo "Running unit tests..."
if pytest -q --maxfail=1 --disable-warnings --junitxml=pytest-report.xml; then
  echo "✅ Unit tests passed"
else
  code=$?
  if [ "$code" -eq 5 ]; then
    echo "No tests collected. Skipping as success."
    echo '<testsuite name="pytest" tests="0"/>' > pytest-report.xml
  else
    echo "❌ Unit tests failed"
    exit $code
  fi
fi


