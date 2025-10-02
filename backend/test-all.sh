#!/usr/bin/env bash
set -euo pipefail

# Run unit and integration tests for all backend services following the Tasks layout
# Usage: ./test-all.sh

SCRIPT_PATH="${BASH_SOURCE[0]}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"

echo "==> Backend root: $BACKEND_DIR"

ran_any_unit=false
ran_any_integration=false

# Load backend-level .env so pre-checks see DB_* vars
set +u
if [ -f "$BACKEND_DIR/.env" ]; then
  echo "Loading env from $BACKEND_DIR/.env"
  set -a
  # shellcheck disable=SC1090
  . "$BACKEND_DIR/.env"
  set +a
fi
set -u

shopt -s nullglob
for service_dir in "$BACKEND_DIR"/*/ ; do
  [ -d "$service_dir" ] || continue

  service_name="$(basename "$service_dir")"

  # Skip non-service folders
  if [ ! -d "$service_dir/Scripts" ] && [ ! -d "$service_dir/scripts" ]; then
    continue
  fi

  # Check for Scripts (capital S) first, then scripts (lowercase s)
  if [ -d "$service_dir/Scripts" ]; then
    unit_script="$service_dir/Scripts/test-unit.sh"
    integ_script="$service_dir/Scripts/test-integration.sh"
  else
    unit_script="$service_dir/scripts/test-unit.sh"
    integ_script="$service_dir/scripts/test-integration.sh"
  fi

  if [ -x "$unit_script" ]; then
    echo -e "\n=== [${service_name}] Running unit tests ==="
    if [ -d "$service_dir/Scripts" ]; then
      (cd "$service_dir" && ./Scripts/test-unit.sh)
    else
      (cd "$service_dir" && ./scripts/test-unit.sh)
    fi
    ran_any_unit=true
  else
    echo "[${service_name}] No unit test script found, skipping"
  fi

  if [ -x "$integ_script" ]; then
    missing_env=false
    for v in DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME; do
      if [ -z "${!v-}" ]; then
        echo "[${service_name}] Skipping integration: missing $v"
        missing_env=true
      fi
    done

    if [ "$missing_env" = false ]; then
      echo -e "\n=== [${service_name}] Running integration tests ==="
      if [ -d "$service_dir/Scripts" ]; then
        (cd "$service_dir" && ./Scripts/test-integration.sh)
      else
        (cd "$service_dir" && ./scripts/test-integration.sh)
      fi
      ran_any_integration=true
    fi
  else
    echo "[${service_name}] No integration test script found, skipping"
  fi
done

if [ "$ran_any_unit" = false ] && [ "$ran_any_integration" = false ]; then
  echo "No services with test scripts were found under $BACKEND_DIR"
  exit 0
fi

echo -e "\n✅ All applicable unit${ran_any_integration:+ and integration} tests passed across services"

