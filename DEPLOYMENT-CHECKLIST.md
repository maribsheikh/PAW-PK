# 🚀 Pre-Deployment Checklist

## Before Deploying to Production

Use this checklist to ensure everything is ready before deploying to production.

---

## ✅ Local Verification (Complete These First)

### Code & Dependencies
- [x] All dependencies installed (`npm install` in backend and frontend)
- [x] Compression package added to backend
- [x] No uncommitted changes (or commit them now)
- [ ] Code pushed to Git repository
- [ ] All tests passing (if you have tests)

### Environment Configuration
- [x] `backend/.env.example` created
- [x] `frontend/.env.example` created
- [x] `frontend/.env.production` created
- [ ] Reviewed all environment variables needed

### Documentation
- [x] PRODUCTION.md created
- [x] QUICK-REFERENCE.md created
- [x] Implementation plan documented
- [x] Walkthrough completed

### Security
- [x] .gitignore updated (sensitive files excluded)
- [x] Rate limiting configured
- [x] Helmet security headers configured
- [x] CORS properly configured
- [ ] Secrets ready to be changed in production

---

## 📋 Production Server Setup

### Server Access
- [ ] Can SSH to production server: `ssh root@72.62.83.231`
- [ ] Server has Docker installed: `docker --version`
- [ ] Server has Docker Compose installed: `docker-compose --version`
- [ ] Server has Nginx installed: `nginx -v`
- [ ] Server has sufficient disk space: `df -h`

### SSL/HTTPS
- [ ] SSL certificate installed
- [ ] Certificate is valid and not expired
- [ ] HTTPS working on domain
- [ ] Certificate auto-renewal configured (certbot)

### DNS
- [ ] Domain points to server IP
- [ ] www subdomain configured (if needed)
- [ ] api subdomain configured (if needed)
- [ ] DNS propagated (check with `nslookup thepawinternational.com`)

---

## 🔐 Security Configuration

### Secrets & Environment Variables
- [ ] Created production `.env` file from `.env.example`
- [ ] Changed `JWT_SECRET` to strong random value (min 32 chars)
  ```bash
  openssl rand -base64 32
  ```
- [ ] Changed `SESSION_SECRET` to different strong random value
  ```bash
  openssl rand -base64 32
  ```
- [ ] Set `NODE_ENV=production`
- [ ] Set `FRONTEND_URL=https://thepawinternational.com`
- [ ] Configured SMTP settings (if using email)
- [ ] Verified no secrets in Git repository

### Firewall
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled (recommended)
- [ ] Fail2ban installed (recommended)

---

## 🐳 Docker Configuration

### Files Ready
- [x] Dockerfile updated with production optimizations
- [x] docker-compose.prod.yml configured
- [x] .dockerignore file present
- [ ] Nginx config copied to server

### Directories
- [ ] Created `/opt/PAW-PK` directory on server
- [ ] Created `backend/uploads` directory
- [ ] Created `backend/logs` directory
- [ ] Created `backups` directory
- [ ] Set proper permissions

---

## 📦 Deployment Preparation

### Code Repository
- [ ] All changes committed
- [ ] All changes pushed to main branch
- [ ] Repository accessible from production server

### Backup Strategy
- [ ] Backup location identified: `/opt/PAW-PK/backups`
- [ ] Backup script ready: `deploy-production.sh`
- [ ] Tested backup/restore procedure (optional but recommended)
- [ ] Automated backup scheduled (cron job)

### Nginx Configuration
- [ ] Nginx config file reviewed
- [ ] SSL paths correct in nginx config
- [ ] Domain names correct in nginx config
- [ ] Proxy settings correct (port 3001)

---

## 🧪 Testing Plan

### Local Testing (Before Deployment)
- [ ] Backend starts successfully: `npm run prod`
- [ ] Frontend builds successfully: `npm run build`
- [ ] Docker image builds: `docker build -t pawpk-test .`
- [ ] Health endpoint works: `curl http://localhost:3001/api/health`
- [ ] No errors in console

### Post-Deployment Testing
- [ ] Health endpoint accessible externally
- [ ] Frontend loads without errors
- [ ] Products page loads
- [ ] Cart functionality works
- [ ] Admin panel accessible
- [ ] Image uploads work
- [ ] No CORS errors in browser console
- [ ] SSL certificate valid (no warnings)

---

## 📊 Monitoring Setup

### Health Monitoring
- [ ] Health endpoint configured: `/api/health`
- [ ] Docker health check configured
- [ ] Uptime monitoring service configured (optional)

### Logging
- [ ] Application logs configured
- [ ] Nginx logs accessible
- [ ] Docker logs accessible
- [ ] Log rotation configured

### Error Tracking
- [ ] Error tracking service configured (optional - Sentry, etc.)
- [ ] Email notifications for critical errors (optional)

---

## 🚀 Deployment Steps

### 1. Prepare Server
```bash
# SSH to server
ssh root@72.62.83.231

# Clone repository (first time only)
cd /opt
git clone <your-repo-url> PAW-PK
cd PAW-PK

# Create directories
mkdir -p backend/uploads backend/logs backups
```

### 2. Configure Environment
```bash
# Create .env file
cp backend/.env.example backend/.env
nano backend/.env

# IMPORTANT: Change these values:
# - JWT_SECRET
# - SESSION_SECRET
# - FRONTEND_URL
```

### 3. Configure Nginx
```bash
# Copy nginx config
sudo cp nginx-config/default.conf /etc/nginx/sites-available/pawpk
sudo ln -s /etc/nginx/sites-available/pawpk /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Deploy Application
```bash
# Option A: Automated (recommended)
sudo bash deploy-production.sh

# Option B: Manual
docker-compose -f docker-compose.prod.yml up -d --build
```

### 5. Verify Deployment
```bash
# Check container
docker ps | grep pawpk-app

# Check health
curl http://localhost:3001/api/health

# Check externally
curl https://api.thepawinternational.com/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs --tail 50
```

### 6. Browser Testing
- [ ] Open https://thepawinternational.com
- [ ] Press F12 → Check Console (no CORS errors)
- [ ] Test product browsing
- [ ] Test cart operations
- [ ] Test admin login (if applicable)
- [ ] Check Network tab (verify single CORS header)

---

## 🔄 Post-Deployment

### Immediate (First Hour)
- [ ] Monitor logs for errors
- [ ] Test all critical functionality
- [ ] Verify no CORS errors
- [ ] Check SSL certificate
- [ ] Test from different browsers
- [ ] Test from mobile device

### First Day
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups are working
- [ ] Test rollback procedure (optional)
- [ ] Document any issues

### First Week
- [ ] Review logs daily
- [ ] Monitor uptime
- [ ] Check disk space usage
- [ ] Optimize based on real usage
- [ ] Update documentation if needed

---

## 🆘 Emergency Procedures

### Rollback Plan
```bash
cd /opt/PAW-PK
git log --oneline -10
git checkout <previous-commit-hash>
docker-compose -f docker-compose.prod.yml up -d --build
```

### Emergency Contacts
- Server IP: 72.62.83.231
- SSH: `ssh root@72.62.83.231`
- Project: `/opt/PAW-PK`

### Quick Fixes
- **Container won't start**: Check logs, verify .env file
- **CORS errors**: Verify FRONTEND_URL, restart Nginx
- **High memory**: Restart container
- **Database locked**: Stop container, check permissions, restart

---

## 📝 Final Checklist Before Going Live

- [ ] All items above completed
- [ ] Secrets changed from defaults
- [ ] SSL certificate valid
- [ ] Backups configured
- [ ] Monitoring in place
- [ ] Team notified of deployment
- [ ] Rollback plan understood
- [ ] Emergency procedures documented

---

## ✅ You're Ready!

Once all items are checked, you're ready to deploy to production!

**Deployment Command:**
```bash
ssh root@72.62.83.231
cd /opt/PAW-PK
sudo bash deploy-production.sh
```

**Good luck with your deployment! 🚀**

---

## 📞 Need Help?

Refer to:
- [PRODUCTION.md](./PRODUCTION.md) - Deployment guide
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Common commands
- [walkthrough.md](./walkthrough.md) - Complete changes overview
- [implementation_plan.md](./implementation_plan.md) - Technical details
