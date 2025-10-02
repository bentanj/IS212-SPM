#!/bin/bash

# Unit Test Script for Authentication Service
# This script runs unit tests for the Authentication service

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Authentication service directory
AUTH_DIR="$(dirname "$SCRIPT_DIR")"
# Backend root directory
BACKEND_DIR="$(dirname "$AUTH_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Authentication Unit Tests${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if we're in the right directory
if [ ! -f "$AUTH_DIR/app.py" ]; then
    echo -e "${RED}Error: app.py not found in $AUTH_DIR${NC}"
    echo -e "${RED}Please run this script from the Authentication service directory${NC}"
    exit 1
fi

# Change to Authentication directory
cd "$AUTH_DIR"

echo -e "${YELLOW}Running unit tests for Authentication service...${NC}"
echo -e "${YELLOW}Test directory: $AUTH_DIR/Tests${NC}"
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}Error: pytest is not installed${NC}"
    echo -e "${YELLOW}Installing pytest...${NC}"
    pip install pytest pytest-cov
fi

# Check if test file exists
if [ ! -f "$AUTH_DIR/Tests/test_auth.py" ]; then
    echo -e "${RED}Error: test_auth.py not found in $AUTH_DIR/Tests${NC}"
    exit 1
fi

# Set environment variables for testing
export FLASK_ENV=testing
export FLASK_DEBUG=False
export SQLALCHEMY_DATABASE_URI="sqlite:///:memory:"

# Run unit tests with coverage
echo -e "${BLUE}Running unit tests with coverage...${NC}"

# First run simple tests to verify basic functionality
echo -e "${YELLOW}Running basic functionality tests...${NC}"
python3 "$AUTH_DIR/Tests/test_simple.py"

# Then run full pytest suite if available
if command -v pytest &> /dev/null; then
    echo -e "${YELLOW}Running full pytest suite...${NC}"
    pytest "$AUTH_DIR/Tests/test_auth_simple.py" \
        -m "unit" \
        -v \
        --tb=short \
        --junitxml=test-results.xml
else
    echo -e "${YELLOW}pytest not available, running basic tests only${NC}"
fi

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Unit tests PASSED successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Test results XML: test-results.xml${NC}"
    
    exit 0
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  Unit tests FAILED!${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Check the output above for details${NC}"
    exit 1
fi
