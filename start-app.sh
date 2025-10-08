#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to clean up on exit
cleanup() {
    echo -e "\n\n${YELLOW}Shutting down...${NC}"
    
    # Kill frontend
    echo -e "${YELLOW}Stopping frontend...${NC}"
    if lsof -ti:3000 > /dev/null 2>&1; then
        kill -9 $(lsof -ti:3000)
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    fi
    
    # Stop backend containers
    echo -e "${YELLOW}Stopping backend containers...${NC}"
    cd "$(dirname "$0")/backend" && docker compose down
    echo -e "${GREEN}✓ Backend stopped${NC}"
    
    echo -e "${GREEN}Cleanup complete!${NC}"
    exit 0
}

# Trap Ctrl+C (SIGINT) and call cleanup function
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting Development Environment${NC}"
echo -e "${BLUE}========================================${NC}"

# Kill any process running on port 3000
echo -e "\n${YELLOW}Checking for processes on port 3000...${NC}"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing process on port 3000...${NC}"
    kill -9 $(lsof -ti:3000)
    echo -e "${GREEN}✓ Port 3000 cleared${NC}"
else
    echo -e "${GREEN}✓ Port 3000 is free${NC}"
fi

# Backend: Stop and rebuild Docker containers
echo -e "\n${YELLOW}Setting up backend...${NC}"
cd backend || { echo "Backend directory not found!"; exit 1; }

echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose down

echo -e "${YELLOW}Building and starting containers...${NC}"
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend containers started${NC}"
else
    echo -e "${RED}✗ Failed to start backend${NC}"
    exit 1
fi

# Frontend: Install dependencies and start dev server
echo -e "\n${YELLOW}Setting up frontend...${NC}"
cd ../frontend || { echo "Frontend directory not found!"; exit 1; }

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ npm install failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Starting frontend dev server...${NC}"
echo -e "${GREEN}Press Ctrl+C to stop everything${NC}"
echo -e "${GREEN}========================================${NC}\n"

npm run dev