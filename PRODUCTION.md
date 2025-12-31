# PAW-PK E-Commerce Platform - Production Deployment

## 🚀 Quick Start

This application is now production-ready with all necessary security, performance, and deployment optimizations.

### Prerequisites

- Docker and Docker Compose
- Nginx (for reverse proxy)
- SSL certificates
- Domain pointing to your server

### First-Time Setup

1. **Clone the repository** (on production server):
   ```bash
   cd /opt
   git clone <your-repo-url> PAW-PK
   cd PAW-PK
   ```

2. **Configure environment variables**:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   nano backend/.env  # Edit with your production values
   
   # IMPORTANT: Change these values:
   # - JWT_SECRET (use a long random string)
   # - SESSION_SECRET (use a different long random string)
   # - SMTP settings (if using email)
   ```

3. **Create necessary directories**:
   ```bash
   mkdir -p backend/uploads
   mkdir -p backend/logs
   mkdir -p backups
   ```

4. **Set up Nginx**:
   ```bash
   sudo cp nginx-config/default.conf /etc/nginx/sites-available/pawpk
   sudo ln -s /etc/nginx/sites-available/pawpk /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Build and start**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

6. **Verify deployment**:
   ```bash
   curl http://localhost:3001/api/health
   ```

---

## 📦 What's Included

### Security Features
- ✅ CORS properly configured (no duplicate headers)
- ✅ Rate limiting on all API endpoints
- ✅ Stricter rate limiting on auth endpoints
- ✅ Helmet security headers (CSP, HSTS, etc.)
- ✅ Non-root Docker user
- ✅ Request size limits
- ✅ Environment variable validation

### Performance Optimizations
- ✅ Gzip compression
- ✅ Code splitting and minification
- ✅ Optimized Docker multi-stage build
- ✅ Static asset caching
- ✅ Production build removes console.log

### Deployment Features
- ✅ Docker health checks
- ✅ Automatic container restart
- ✅ Volume persistence (uploads, database, logs)
- ✅ Structured logging
- ✅ Graceful shutdown handling

---

## 🔄 Updating Production

```bash
# SSH to server
ssh root@72.62.83.231

# Navigate to project
cd /opt/PAW-PK

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Watch logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 📊 Monitoring

### Check Application Health
```bash
curl http://localhost:3001/api/health
```

### View Logs
```bash
# Container logs
docker-compose -f docker-compose.prod.yml logs -f

# Application logs
tail -f backend/logs/app.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check Container Status
```bash
docker ps
docker stats pawpk-app
```

---

## 🔧 Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in backend/.env matches your domain
- Check Nginx configuration is updated
- Clear browser cache

### Container Won't Start
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Verify .env file exists
- Check disk space: `df -h`

### Database Issues
- Check file permissions
- Verify database file isn't corrupted
- Run migrations: `docker exec pawpk-app npm run migrate`

---

## 💾 Backup

### Manual Backup
```bash
# Backup database
cp backend/pawpk_production.sqlite3 backups/pawpk_$(date +%Y%m%d_%H%M%S).sqlite3

# Backup uploads
tar -czf backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
```

### Automated Backup (Cron)
```bash
# Add to crontab (crontab -e)
0 2 * * * cd /opt/PAW-PK && cp backend/pawpk_production.sqlite3 backups/pawpk_$(date +\%Y\%m\%d).sqlite3
```

---

## 📚 Documentation

- **[Implementation Plan](./implementation_plan.md)** - Detailed changes and deployment guide
- **[CORS Fix Guide](./fix-cors-deployment.md)** - How the CORS issue was resolved
- **[Production Testing Guide](./production-testing-guide.md)** - Testing procedures

---

## 🔐 Security Checklist

Before going live:
- [ ] Changed JWT_SECRET to a strong random value
- [ ] Changed SESSION_SECRET to a strong random value
- [ ] SSL certificate installed and working
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Database backups automated
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Rate limiting tested
- [ ] CORS tested from production domain

---

## 📞 Support

For issues:
1. Check logs first
2. Review documentation
3. Test in local environment
4. Check GitHub issues

---

## 🎯 Production URLs

- **Frontend**: https://thepawinternational.com
- **API**: https://api.thepawinternational.com/api
- **Health Check**: https://api.thepawinternational.com/api/health

---

## 📝 Environment Variables Reference

### Required
- `NODE_ENV` - Set to "production"
- `PORT` / `BACKEND_PORT` - Port number (default: 3001)
- `FRONTEND_URL` - Your frontend domain
- `JWT_SECRET` - Secret for JWT tokens (MUST CHANGE)
- `SESSION_SECRET` - Secret for sessions (MUST CHANGE)

### Optional
- `DATABASE_URL` - Database file path
- `SMTP_*` - Email configuration
- `RATE_LIMIT_*` - Rate limiting settings
- `MAX_FILE_SIZE` - Upload size limit

See `backend/.env.example` for full list.

---

## 🚨 Emergency Procedures

### Rollback
```bash
cd /opt/PAW-PK
git log --oneline -10
git checkout <previous-commit-hash>
docker-compose -f docker-compose.prod.yml up -d --build
```

### Restore Database
```bash
cp backups/pawpk_YYYYMMDD_HHMMSS.sqlite3 backend/pawpk_production.sqlite3
docker-compose -f docker-compose.prod.yml restart
```

---

**Your application is production-ready! 🎉**
