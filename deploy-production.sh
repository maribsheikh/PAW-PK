#!/bin/bash

# Production Deployment Script for PAW-PK
# This script automates the deployment process

set -e  # Exit on error

echo "=================================="
echo "PAW-PK Production Deployment"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/PAW-PK"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Backup current state
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"

if [ -f "$PROJECT_DIR/backend/pawpk_production.sqlite3" ]; then
    cp "$PROJECT_DIR/backend/pawpk_production.sqlite3" \
       "$BACKUP_DIR/pawpk_production_$TIMESTAMP.sqlite3"
    echo -e "${GREEN}✓ Database backed up${NC}"
fi

if [ -d "$PROJECT_DIR/backend/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" \
        -C "$PROJECT_DIR/backend" uploads/
    echo -e "${GREEN}✓ Uploads backed up${NC}"
fi

# Step 2: Pull latest code
echo ""
echo -e "${YELLOW}Step 2: Pulling latest code...${NC}"
cd "$PROJECT_DIR"
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "Current commit: $CURRENT_COMMIT"

git pull origin main
NEW_COMMIT=$(git rev-parse HEAD)
echo "New commit: $NEW_COMMIT"

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    echo -e "${YELLOW}No new changes to deploy${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Step 3: Check environment file
echo ""
echo -e "${YELLOW}Step 3: Checking environment configuration...${NC}"
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    echo -e "${RED}✗ backend/.env file not found!${NC}"
    echo "Please create it from backend/.env.example"
    exit 1
fi
echo -e "${GREEN}✓ Environment file exists${NC}"

# Step 4: Update Nginx configuration
echo ""
echo -e "${YELLOW}Step 4: Updating Nginx configuration...${NC}"
if [ -f "/etc/nginx/sites-available/default.conf" ]; then
    cp /etc/nginx/sites-available/default.conf \
       /etc/nginx/sites-available/default.conf.backup.$TIMESTAMP
    echo -e "${GREEN}✓ Nginx config backed up${NC}"
fi

cp "$PROJECT_DIR/nginx-config/default.conf" \
   /etc/nginx/sites-available/default.conf

# Test Nginx configuration
if nginx -t 2>/dev/null; then
    echo -e "${GREEN}✓ Nginx configuration valid${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo -e "${RED}✗ Nginx configuration invalid${NC}"
    echo "Restoring backup..."
    cp /etc/nginx/sites-available/default.conf.backup.$TIMESTAMP \
       /etc/nginx/sites-available/default.conf
    exit 1
fi

# Step 5: Build and deploy Docker container
echo ""
echo -e "${YELLOW}Step 5: Building and deploying Docker container...${NC}"
cd "$PROJECT_DIR"

# Stop current container
docker-compose -f docker-compose.prod.yml down
echo -e "${GREEN}✓ Stopped current container${NC}"

# Build new image
echo "Building new Docker image (this may take a few minutes)..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start new container
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓ Started new container${NC}"

# Step 6: Wait for container to be healthy
echo ""
echo -e "${YELLOW}Step 6: Waiting for container to be healthy...${NC}"
sleep 5

for i in {1..30}; do
    if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Container is healthy${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Container failed to become healthy${NC}"
        echo "Checking logs..."
        docker-compose -f docker-compose.prod.yml logs --tail 50
        exit 1
    fi
    
    echo -n "."
    sleep 2
done

# Step 7: Verify deployment
echo ""
echo -e "${YELLOW}Step 7: Verifying deployment...${NC}"

# Check health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi

# Check container status
if docker ps | grep -q pawpk-app; then
    echo -e "${GREEN}✓ Container is running${NC}"
else
    echo -e "${RED}✗ Container is not running${NC}"
fi

# Step 8: Cleanup old backups (keep last 7 days)
echo ""
echo -e "${YELLOW}Step 8: Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -name "*.sqlite3" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
echo -e "${GREEN}✓ Old backups cleaned${NC}"

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "Deployment Details:"
echo "  - Timestamp: $TIMESTAMP"
echo "  - Previous commit: $CURRENT_COMMIT"
echo "  - New commit: $NEW_COMMIT"
echo "  - Backup location: $BACKUP_DIR"
echo ""
echo "Next Steps:"
echo "  1. Test the website: https://thepawinternational.com"
echo "  2. Check for errors in browser console (F12)"
echo "  3. Test critical functionality (products, cart, etc.)"
echo "  4. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Rollback if needed:"
echo "  git checkout $CURRENT_COMMIT"
echo "  docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
