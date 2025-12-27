# PAW-PK Deployment Guide

## Architecture Overview

- **Frontend**: Deployed on Hostinger at `https://thepawinternational.com`
- **Backend API**: Deployed on VPS at `https://api.thepawinternational.com`

## Prerequisites

### VPS Requirements
- Node.js 18+ installed
- Nginx installed
- Certbot for SSL certificates
- PM2 or Docker for process management

### DNS Configuration
Ensure these DNS records are configured:
- `thepawinternational.com` → Hostinger IP
- `www.thepawinternational.com` → Hostinger IP  
- `api.thepawinternational.com` → Your VPS IP

---

## Backend Deployment (VPS)

### 1. Clone and Setup

```bash
# SSH to your VPS
ssh root@your-vps-ip

# Clone repository
cd /opt
git clone git@github.com:maribsheikh/PAW-PK.git
cd PAW-PK/backend

# Install dependencies
npm install --production

# Create environment file
cp .env.production .env

# Edit .env and set a strong JWT_SECRET
nano .env
```

### 2. Configure Nginx

```bash
# Copy nginx config
sudo cp /opt/PAW-PK/nginx-config/api.thepawinternational.com.conf /etc/nginx/sites-available/

# Enable the site
sudo ln -sf /etc/nginx/sites-available/api.thepawinternational.com.conf /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Get SSL certificate
sudo certbot certonly --nginx -d api.thepawinternational.com

# Reload nginx
sudo systemctl reload nginx
```

### 3. Run Backend with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the backend
cd /opt/PAW-PK/backend
pm2 start server.js --name pawpk-backend

# Save PM2 config for auto-restart
pm2 save
pm2 startup
```

### 4. Verify Backend

```bash
# Test locally
curl http://localhost:3001/api/health

# Test via nginx
curl https://api.thepawinternational.com/api/health

# Test CORS
curl -I -X OPTIONS https://api.thepawinternational.com/api/products \
  -H "Origin: https://thepawinternational.com" \
  -H "Access-Control-Request-Method: GET"
```

---

## Frontend Deployment (Hostinger)

### 1. Build for Production

```bash
# On your local machine
cd PAW-PK/frontend

# Ensure production env is set
cat .env.production
# Should contain: VITE_API_URL=https://api.thepawinternational.com/api

# Build
npm run build

# The dist/ folder contains your production build
```

### 2. Upload to Hostinger

Option A: **FTP Upload**
- Connect via FTP to Hostinger
- Upload contents of `frontend/dist/` to `public_html/`

Option B: **Hostinger File Manager**
- Zip the `dist/` folder
- Upload to Hostinger via File Manager
- Extract to `public_html/`

Option C: **Git Deployment**
- Setup Git deployment on Hostinger
- Push and let it build automatically

### 3. Configure Hostinger .htaccess

Create `public_html/.htaccess` for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle SPA routing - serve index.html for all routes
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# Enable CORS for assets (optional)
<IfModule mod_headers.c>
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

---

## Troubleshooting

### Issue: Frontend can't reach Backend API

**Symptoms**: 
- Direct API calls work: `curl https://api.thepawinternational.com/api/products`
- Browser console shows CORS errors

**Solutions**:

1. **Check CORS headers on VPS**:
```bash
curl -I -X OPTIONS https://api.thepawinternational.com/api/products \
  -H "Origin: https://thepawinternational.com" \
  -H "Access-Control-Request-Method: GET"
```
Should return:
```
Access-Control-Allow-Origin: https://thepawinternational.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Credentials: true
```

2. **Verify nginx CORS config**:
```bash
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/api.thepawinternational.com.conf | grep -A5 "Access-Control"
```

3. **Check backend logs**:
```bash
pm2 logs pawpk-backend
# Look for "CORS blocked origin:" messages
```

4. **Verify SSL certificates**:
```bash
curl -v https://api.thepawinternational.com/api/health 2>&1 | grep -i ssl
```

### Issue: Mixed Content Errors

If frontend is HTTPS but calling HTTP API:
- Ensure `VITE_API_URL` uses `https://`
- Rebuild frontend and redeploy

### Issue: 502 Bad Gateway

Backend not running:
```bash
pm2 status
pm2 restart pawpk-backend
```

### Issue: Images not loading

1. Check image paths in database
2. Verify `/uploads/` and `/images/` directories exist on VPS
3. Check nginx alias paths match actual file locations

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend origin for CORS | `https://thepawinternational.com` |
| `JWT_SECRET` | Secret for JWT tokens | `random-strong-secret` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

### Frontend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.thepawinternational.com/api` |

---

## Quick Commands

```bash
# VPS - Restart backend
pm2 restart pawpk-backend

# VPS - View logs
pm2 logs pawpk-backend --lines 100

# VPS - Reload nginx
sudo systemctl reload nginx

# Local - Build frontend
cd frontend && npm run build

# Local - Test production build locally
cd frontend && npm run preview
```

