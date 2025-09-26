#!/usr/bin/env bash
set -euo pipefail

# Run unit tests for Tasks service inside Docker
# Usage: ./scripts/test-unit.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

docker-compose build --build-arg INSTALL_DEV=true tasks
docker-compose run --rm \
  -e ENV=test \
  tasks python -m pytest -q

echo "✅ Unit tests passed"


