# PAW-PK VPS Deployment Guide

## Architecture Overview

Single VPS deployment where Node.js serves both the API and frontend static files.

```
┌─────────────────────────────────────────┐
│                  VPS                     │
│  ┌─────────┐      ┌──────────────────┐  │
│  │  Nginx  │ ──── │  Node.js (PM2)   │  │
│  │  :80    │      │  :3001           │  │
│  │  :443   │      │  - API routes    │  │
│  └─────────┘      │  - Static files  │  │
│                   └──────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Prerequisites

- VPS with Ubuntu 20.04+ (DigitalOcean, Linode, Hostinger VPS, etc.)
- Domain pointing to your VPS IP
- SSH access to the VPS

---

## Step 1: VPS Initial Setup

```bash
# SSH to your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx and Certbot
apt install -y nginx certbot python3-certbot-nginx

# Verify installations
node --version
npm --version
pm2 --version
nginx -v
```

---

## Step 2: Clone and Setup Project

```bash
# Create project directory
cd /opt
git clone https://github.com/yourusername/PAW-PK.git
cd PAW-PK

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build

cd ..
```

---

## Step 3: Configure Environment

### Backend Environment

```bash
cd /opt/PAW-PK/backend
cp .env.example .env
nano .env
```

Update with your values:
```env
NODE_ENV=production
PORT=3001
BACKEND_PORT=3001

# Your domain (used for CORS - same origin so can be localhost)
FRONTEND_URL=https://yourdomain.com

# Generate with: openssl rand -base64 32
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=7d

# Database
DB_FILE=./pawpk_prod.sqlite3

# Admin credentials for initial setup
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password
```

### Frontend Environment

```bash
cd /opt/PAW-PK/frontend
cp .env.example .env.production
nano .env.production
```

Update the API URL (use relative path since same server):
```env
VITE_API_URL=/api
```

Rebuild frontend with correct config:
```bash
npm run build
```

---

## Step 4: Initialize Database

```bash
cd /opt/PAW-PK/backend
npm run migrate
npm run seed
```

---

## Step 5: Start Backend with PM2

```bash
cd /opt/PAW-PK/backend
pm2 start server.js --name pawpk

# Save PM2 config for auto-restart on reboot
pm2 save
pm2 startup
```

Verify it's running:
```bash
pm2 status
curl http://localhost:3001/api/health
```

---

## Step 6: Configure Nginx

Create nginx config:
```bash
nano /etc/nginx/sites-available/yourdomain.com
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS (after SSL is set up)
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Proxy all requests to Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
ln -sf /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

---

## Step 7: Setup SSL with Let's Encrypt

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically update your nginx config with SSL certificates.

Test auto-renewal:
```bash
certbot renew --dry-run
```

---

## Step 8: Verify Deployment

```bash
# Check services are running
pm2 status
systemctl status nginx

# Test endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com
```

Visit `https://yourdomain.com` in your browser!

---

## Updating the Application

```bash
cd /opt/PAW-PK

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install --production
npm run migrate

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Restart backend
pm2 restart pawpk
```

---

## Troubleshooting

### Check Logs

```bash
# PM2 logs
pm2 logs pawpk --lines 100

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Common Issues

**502 Bad Gateway:**
```bash
pm2 status
pm2 restart pawpk
```

**Permission errors:**
```bash
chown -R www-data:www-data /opt/PAW-PK
```

**Port already in use:**
```bash
lsof -i :3001
kill -9 <PID>
pm2 restart pawpk
```

---

## Quick Commands Reference

```bash
# Restart app
pm2 restart pawpk

# View logs
pm2 logs pawpk

# Reload nginx
systemctl reload nginx

# Renew SSL
certbot renew

# Check disk space
df -h

# Check memory
free -m
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | For CORS (your domain) | `https://yourdomain.com` |
| `JWT_SECRET` | Secret for JWT tokens | `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `ADMIN_EMAIL` | Initial admin email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Initial admin password | `secure-password` |

### Frontend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API URL (relative for same server) | `/api` |
