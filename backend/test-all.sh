#!/usr/bin/env bash
set -euo pipefail

# Run unit and integration tests for all backend services matching CI behavior
# Usage: ./test-all.sh [--integration]

SCRIPT_PATH="${BASH_SOURCE[0]}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"

echo "==> Backend root: $BACKEND_DIR"

# Parse arguments
RUN_INTEGRATION=false
if [[ "${1:-}" == "--integration" ]]; then
  RUN_INTEGRATION=true
  echo "==> Integration tests enabled"
fi

ran_any_unit=false
ran_any_integration=false

# Set up test environment variables (matching CI)
export ENV=test
export FLASK_ENV=test

# Set dummy DB credentials for unit tests (matching CI)
export DB_USER="${DB_USER:-test_user}"
export DB_PASSWORD="${DB_PASSWORD:-test_password}"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5432}"
export DB_NAME="${DB_NAME:-testdb}"

# Load backend-level .env if present (for real DB credentials when running integration)
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
has_real_db=false
if [ "$RUN_INTEGRATION" = true ]; then
  missing_env=false
  for v in DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME; do
    if [ -z "${!v-}" ]; then
      echo "Warning: Missing $v for integration tests"
      missing_env=true
    fi
  done
  if [ "$missing_env" = false ]; then
    has_real_db=true
    echo "==> Real DB credentials found, integration tests will run"
  else
    echo "==> Missing DB credentials, integration tests will be skipped"
  fi
fi

shopt -s nullglob
for service_dir in "$BACKEND_DIR"/*/ ; do
  [ -d "$service_dir" ] || continue

  service_name="$(basename "$service_dir")"

  # Skip non-service folders
  if [ ! -d "$service_dir/Scripts" ] && [ ! -d "$service_dir/scripts" ]; then
    continue
  fi

  echo -e "\n=== [${service_name}] Running tests ==="

  # Change to service directory
  cd "$service_dir"

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

  # Run unit tests (matching CI command)
  echo "Running unit tests for $service_name..."
  if pytest -q --maxfail=1 --disable-warnings --junitxml=pytest-report.xml; then
    echo "✅ Unit tests passed for $service_name"
    ran_any_unit=true
  else
    code=$?
    if [ "$code" -eq 5 ]; then
      echo "No tests collected for $service_name. Skipping as success."
      echo '<testsuite name="pytest" tests="0"/>' > pytest-report.xml
      ran_any_unit=true
    else
      echo "❌ Unit tests failed for $service_name"
      exit $code
    fi
  fi

  # Run integration tests if requested and DB credentials are available
  if [ "$RUN_INTEGRATION" = true ] && [ "$has_real_db" = true ]; then
    echo "Running integration tests for $service_name..."
    export RUN_INTEGRATION=true
    if pytest -q -m integration --maxfail=1 --disable-warnings --junitxml=pytest-report-integration.xml; then
      echo "✅ Integration tests passed for $service_name"
      ran_any_integration=true
    else
      echo "❌ Integration tests failed for $service_name"
      exit 1
    fi
  elif [ "$RUN_INTEGRATION" = true ]; then
    echo "⚠️  Integration tests skipped for $service_name (no real DB credentials)"
  fi

  # Return to backend directory
  cd "$BACKEND_DIR"
done

if [ "$ran_any_unit" = false ]; then
  echo "No services with tests were found under $BACKEND_DIR"
  exit 0
fi

echo -e "\n✅ All applicable unit${ran_any_integration:+ and integration} tests passed across services"

