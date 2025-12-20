#!/bin/bash

# SQL Server Database Setup Script
# This script helps set up the database and seed products

echo "🚀 Setting up PAW PK Database..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating default .env..."
    cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

DB_HOST=localhost
DB_PORT=1433
DB_NAME=pawpk_dev
DB_USER=sa
DB_PASSWORD=
DB_ENCRYPT=false

UPLOAD_DIR=./uploads
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Created .env file. Please update DB_PASSWORD with your SQL Server password."
    echo "Press Enter to continue after updating .env..."
    read
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Running database migrations..."
npm run migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
    
    echo "🌱 Seeding database with products..."
    npm run seed
    
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded successfully!"
        echo ""
        echo "🎉 Setup complete!"
        echo ""
        echo "📝 Next steps:"
        echo "1. Start the backend: npm run dev"
        echo "2. Visit http://localhost:5173 to see your products"
        echo "3. Admin login: admin@pawpk.com / admin123"
    else
        echo "❌ Seeding failed. Please check the error above."
    fi
else
    echo "❌ Migrations failed. Please check your SQL Server connection and credentials."
fi

