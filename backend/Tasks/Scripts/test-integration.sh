#!/usr/bin/env bash
set -euo pipefail

# Run integration tests for Tasks service inside Docker
# Requires DB_* env secrets configured in your environment or docker-compose overrides
# Usage: ./scripts/test-integration.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

# Load backend-level .env if present and export vars
set +u
if [ -f "$BACKEND_DIR/.env" ]; then
  echo "Loading env from $BACKEND_DIR/.env"
  set -a
  # shellcheck disable=SC1090
  . "$BACKEND_DIR/.env"
  set +a
fi
set -u

docker-compose build --build-arg INSTALL_DEV=true tasks
docker-compose run --rm \
  -e ENV=test \
  -e RUN_INTEGRATION=true \
  -e DB_USER \
  -e DB_PASSWORD \
  -e DB_HOST \
  -e DB_PORT \
  -e DB_NAME \
  tasks python -m pytest -q -m integration

echo "✅ Integration tests passed"


