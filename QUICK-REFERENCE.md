# PAW-PK Quick Reference Card

## 🚀 Deployment Commands

### Deploy to Production
```bash
# Automated deployment (recommended)
sudo bash deploy-production.sh

# Manual deployment
cd /opt/PAW-PK
git pull origin main
sudo cp nginx-config/default.conf /etc/nginx/sites-available/default.conf
sudo nginx -t && sudo systemctl reload nginx
docker-compose -f docker-compose.prod.yml up -d --build
```

### Check Status
```bash
# Container status
docker ps
docker stats pawpk-app

# Health check
curl http://localhost:3001/api/health
curl https://api.thepawinternational.com/api/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs --tail 100
```

---

## 🔧 Common Operations

### Restart Application
```bash
cd /opt/PAW-PK
docker-compose -f docker-compose.prod.yml restart
```

### Rebuild Container
```bash
cd /opt/PAW-PK
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Update Environment Variables
```bash
nano /opt/PAW-PK/backend/.env
docker-compose -f docker-compose.prod.yml restart
```

### View Logs
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail 100
```

---

## 💾 Backup & Restore

### Create Backup
```bash
# Database
cp /opt/PAW-PK/backend/pawpk_production.sqlite3 \
   /opt/PAW-PK/backups/pawpk_$(date +%Y%m%d_%H%M%S).sqlite3

# Uploads
tar -czf /opt/PAW-PK/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz \
    -C /opt/PAW-PK/backend uploads/
```

### Restore Backup
```bash
# Database
cp /opt/PAW-PK/backups/pawpk_YYYYMMDD_HHMMSS.sqlite3 \
   /opt/PAW-PK/backend/pawpk_production.sqlite3
docker-compose -f docker-compose.prod.yml restart

# Uploads
tar -xzf /opt/PAW-PK/backups/uploads_YYYYMMDD_HHMMSS.tar.gz \
    -C /opt/PAW-PK/backend
```

---

## 🔄 Rollback

### Rollback to Previous Version
```bash
cd /opt/PAW-PK

# Find previous commit
git log --oneline -10

# Rollback
git checkout <commit-hash>
docker-compose -f docker-compose.prod.yml up -d --build
```

### Rollback Nginx Config
```bash
sudo cp /etc/nginx/sites-available/default.conf.backup.YYYYMMDD \
       /etc/nginx/sites-available/default.conf
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check .env file exists
ls -la /opt/PAW-PK/backend/.env

# Check disk space
df -h

# Check ports
netstat -tulpn | grep 3001
```

### CORS Errors
```bash
# Check FRONTEND_URL in .env
grep FRONTEND_URL /opt/PAW-PK/backend/.env

# Check Nginx config
sudo nginx -t
cat /etc/nginx/sites-available/default.conf | grep -A 10 "location /api"

# Restart both
sudo systemctl reload nginx
docker-compose -f docker-compose.prod.yml restart
```

### High Memory Usage
```bash
# Check memory
docker stats pawpk-app

# Restart container
docker-compose -f docker-compose.prod.yml restart

# Check for memory leaks in logs
docker-compose -f docker-compose.prod.yml logs | grep -i "memory\|heap"
```

### Database Locked
```bash
# Stop container
docker-compose -f docker-compose.prod.yml down

# Check file permissions
ls -la /opt/PAW-PK/backend/pawpk_production.sqlite3

# Start container
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 Monitoring

### Check Health
```bash
# Local
curl http://localhost:3001/api/health | jq

# External
curl https://api.thepawinternational.com/api/health | jq
```

### Check Disk Usage
```bash
# Overall
df -h

# Project directory
du -sh /opt/PAW-PK/*

# Uploads
du -sh /opt/PAW-PK/backend/uploads

# Logs
du -sh /opt/PAW-PK/backend/logs
```

### Check Docker Resources
```bash
# Images
docker images

# Containers
docker ps -a

# Volumes
docker volume ls

# Clean up
docker system prune -a
```

---

## 🔐 Security

### Update Secrets
```bash
# Generate new secret
openssl rand -base64 32

# Update .env
nano /opt/PAW-PK/backend/.env
# Change JWT_SECRET and SESSION_SECRET

# Restart
docker-compose -f docker-compose.prod.yml restart
```

### Check SSL Certificate
```bash
# Certificate info
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew
```

### View Failed Login Attempts
```bash
docker-compose -f docker-compose.prod.yml logs | grep -i "auth\|login\|failed"
```

---

## 📊 Performance

### Check Response Times
```bash
# Health endpoint
time curl http://localhost:3001/api/health

# Products endpoint
time curl http://localhost:3001/api/products
```

### Check Compression
```bash
curl -I https://api.thepawinternational.com/api/products \
  -H "Accept-Encoding: gzip"
# Look for: Content-Encoding: gzip
```

### Check Rate Limiting
```bash
# Send multiple requests
for i in {1..20}; do
  curl http://localhost:3001/api/products
  echo ""
done
# Should see rate limit message after ~10 requests
```

---

## 🛠️ Maintenance

### Update Dependencies
```bash
cd /opt/PAW-PK/backend
npm audit
npm audit fix

cd /opt/PAW-PK/frontend
npm audit
npm audit fix

# Rebuild
cd /opt/PAW-PK
docker-compose -f docker-compose.prod.yml up -d --build
```

### Clean Old Logs
```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs --tail 0

# Application logs
find /opt/PAW-PK/backend/logs -name "*.log" -mtime +7 -delete

# Nginx logs
sudo logrotate -f /etc/logrotate.d/nginx
```

### Clean Old Backups
```bash
# Keep last 7 days
find /opt/PAW-PK/backups -name "*.sqlite3" -mtime +7 -delete
find /opt/PAW-PK/backups -name "*.tar.gz" -mtime +7 -delete
```

---

## 📞 Emergency Contacts

- **Server IP**: 72.62.83.231
- **SSH**: `ssh root@72.62.83.231`
- **Project Path**: `/opt/PAW-PK`
- **Nginx Config**: `/etc/nginx/sites-available/default.conf`

---

## 🔗 Important URLs

- **Frontend**: https://thepawinternational.com
- **API**: https://api.thepawinternational.com/api
- **Health**: https://api.thepawinternational.com/api/health
- **Admin**: https://thepawinternational.com/admin

---

## 📝 Quick Checks After Deployment

```bash
# 1. Container running
docker ps | grep pawpk-app

# 2. Health check
curl http://localhost:3001/api/health

# 3. Nginx status
sudo systemctl status nginx

# 4. Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail 50 | grep -i error

# 5. Test frontend
curl -I https://thepawinternational.com

# 6. Test API
curl https://api.thepawinternational.com/api/products | jq '. | length'
```

---

**Keep this file handy for quick reference!**
