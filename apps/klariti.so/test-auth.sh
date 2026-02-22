#!/bin/bash

# Authentication System Test Script
# This script helps verify that the authentication system is working correctly

echo "🔐 Klariti Authentication System Test"
echo "======================================"
echo ""

# API Configuration
API_BASE="http://127.0.0.1:8081"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "Test 1: Checking if backend API is running on $API_BASE..."
if curl -s http://127.0.0.1:8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo -e "${YELLOW}  Please start the backend: cd api-klariti && uvicorn main:app --reload --port 8081${NC}"
fi
echo ""

# Test 2: Check if frontend is running
echo "Test 2: Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is NOT running${NC}"
    echo -e "${YELLOW}  Please start the frontend: cd klariti.so && npm run dev${NC}"
fi
echo ""

# Test 3: Test auth endpoints
echo "Test 3: Testing auth endpoints..."
AUTH_ME=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE/me)
if [ "$AUTH_ME" = "401" ] || [ "$AUTH_ME" = "403" ]; then
    echo -e "${GREEN}✓ /me endpoint is responding (returns 401 as expected without token)${NC}"
elif [ "$AUTH_ME" = "000" ]; then
    echo -e "${RED}✗ Cannot reach /me endpoint${NC}"
else
    echo -e "${YELLOW}⚠ /me returned status: $AUTH_ME${NC}"
fi
echo ""

# Test 4: Check if login endpoint exists
echo "Test 4: Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_BASE/login)
if [ "$LOGIN_RESPONSE" = "422" ]; then
    echo -e "${GREEN}✓ /login endpoint exists (returns 422 as expected without credentials)${NC}"
elif [ "$LOGIN_RESPONSE" = "000" ]; then
    echo -e "${RED}✗ Cannot reach /login endpoint${NC}"
else
    echo -e "${YELLOW}⚠ /login returned status: $LOGIN_RESPONSE${NC}"
fi
echo ""

# Test 5: Check for required files
echo "Test 5: Checking for required files..."
FILES=(
    "klariti.so/src/contexts/AuthContext.tsx"
    "klariti.so/src/components/ProtectedRoute.tsx"
    "klariti.so/src/app/auth/page.tsx"
    "klariti.so/src/config/api.ts"
    "klariti.so/.env.local"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
    else
        echo -e "${RED}✗ $file is missing${NC}"
        ALL_FILES_EXIST=false
    fi
done
echo ""

# Test 6: Check npm packages
echo "Test 6: Checking npm packages..."
cd klariti.so
if npm list js-cookie > /dev/null 2>&1; then
    echo -e "${GREEN}✓ js-cookie is installed${NC}"
else
    echo -e "${RED}✗ js-cookie is NOT installed${NC}"
    echo -e "${YELLOW}  Run: npm install js-cookie${NC}"
fi

if npm list @types/js-cookie > /dev/null 2>&1; then
    echo -e "${GREEN}✓ @types/js-cookie is installed${NC}"
else
    echo -e "${RED}✗ @types/js-cookie is NOT installed${NC}"
    echo -e "${YELLOW}  Run: npm install --save-dev @types/js-cookie${NC}"
fi
cd ..
echo ""

# Final Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Make sure both servers are running"
echo "2. Visit http://localhost:3000/playground"
echo "3. You should be redirected to login"
echo "4. Login with your credentials"
echo "5. You should see the dashboard"
echo ""
echo "For more information, see:"
echo "  - QUICKSTART.md"
echo "  - AUTHENTICATION.md"
echo "  - AUTHENTICATION_FLOW.md"
echo ""
