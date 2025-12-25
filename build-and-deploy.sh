#!/bin/bash

echo "=== Building Frontend for Production ==="
echo ""

cd /Users/macbookpro/Documents/PAW\ PK/frontend

echo "1. Installing dependencies..."
npm install

echo ""
echo "2. Building production bundle..."
npm run build

echo ""
echo "3. Verifying build..."
if [ -d "dist" ]; then
    echo "✓ Frontend build successful"
    echo "  Build size: $(du -sh dist | cut -f1)"
    echo "  Files created: $(find dist -type f | wc -l)"
else
    echo "✗ Build failed - dist directory not found"
    exit 1
fi

echo ""
echo "4. Building Docker image..."
cd /Users/macbookpro/Documents/PAW\ PK
docker build --no-cache -t pawpk-app:latest .

echo ""
echo "=== Build Complete ==="
echo ""
echo "To deploy to production:"
echo "  1. Push code to git"
echo "  2. SSH to server: ssh root@72.62.83.231"
echo "  3. Pull latest: cd /opt/PAW-PK && git pull origin main"
echo "  4. Rebuild and restart: docker-compose -f docker-compose.prod.yml up -d --build"
