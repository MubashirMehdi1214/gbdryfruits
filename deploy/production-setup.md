# 🚀 Production Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [SSL Certificate Setup](#ssl-certificate-setup)
5. [Payment Gateway Configuration](#payment-gateway-configuration)
6. [Application Deployment](#application-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Hardening](#security-hardening)
9. [Performance Optimization](#performance-optimization)
10. [Backup & Recovery](#backup--recovery)

---

## 🔧 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04 LTS or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Network**: Stable internet connection with static IP

### Software Requirements
- **Node.js**: v18.x or higher
- **MongoDB**: v6.0 or higher
- **Nginx**: v1.20 or higher
- **PM2**: Latest version
- **Git**: v2.30 or higher
- **SSL Certificate**: Valid certificate (Let's Encrypt or commercial)

### Domain Requirements
- **Primary Domain**: gbdryfruits.com
- **API Subdomain**: api.gbdryfruits.com
- **CDN Subdomain**: cdn.gbdryfruits.com (optional)

---

## ⚙️ Environment Configuration

### 1. Create Production Environment File

Create `/var/www/gbdryfruits/.env.production`:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://gbdryfruits.com
BACKEND_URL=https://api.gbdryfruits.com
CORS_ORIGINS=https://gbdryfruits.com,https://www.gbdryfruits.com

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gbdryfruits_prod?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/gbdryfruits.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/gbdryfruits.com/privkey.pem
SSL_CA_PATH=/etc/letsencrypt/live/gbdryfruits.com/chain.pem

# Payment Gateway Configuration
JAZZCASH_ENABLED=true
JAZZCASH_MERCHANT_ID=your_production_merchant_id
JAZZCASH_PASSWORD=your_production_password
JAZZCASH_INTEGRITY_SALT=your_production_salt

EASYPAISA_ENABLED=true
EASYPAISA_STORE_ID=your_production_store_id
EASYPAISA_API_KEY=your_production_api_key
EASYPAISA_SECRET_KEY=your_production_secret_key

STRIPE_ENABLED=true
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

PAYPAL_ENABLED=true
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret

COD_ENABLED=true

# Notification Configuration
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@gbdryfruits.com
SMTP_PASS=your_app_password

SMS_NOTIFICATIONS_ENABLED=true
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15017122961
TWILIO_WHATSAPP_NUMBER=+14155238886

# Fraud Detection
FRAUD_DETECTION_ENABLED=true
FRAUD_WEBHOOK_URL=https://api.gbdryfruits.com/webhooks/fraud

# Analytics & Monitoring
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=your_sentry_dsn

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# File Upload Configuration
UPLOAD_PATH=/var/www/gbdryfruits/uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Set File Permissions

```bash
sudo chmod 600 /var/www/gbdryfruits/.env.production
sudo chown www-data:www-data /var/www/gbdryfruits/.env.production
```

---

## 🗄️ Database Setup

### 1. MongoDB Production Setup

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list and install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Configure MongoDB for production
sudo nano /etc/mongod.conf
```

MongoDB configuration (`/etc/mongod.conf`):

```yaml
# Storage
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Security
security:
  authorization: enabled

# Process management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Set operations
setParameter:
  enableMajorityReadConcern: false
```

### 2. Create Database User

```bash
# Connect to MongoDB
mongosh

# Switch to admin database
use admin

# Create admin user
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Switch to application database
use gbdryfruits_prod

# Create application user
db.createUser({
  user: "gbdryfruits",
  pwd: "app_password",
  roles: ["readWrite"]
})
```

### 3. Enable MongoDB Authentication

```bash
# Restart MongoDB with authentication
sudo systemctl restart mongod
```

---

## 🔒 SSL Certificate Setup

### 1. Install Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d gbdryfruits.com -d api.gbdryfruits.com -d www.gbdryfruits.com

# Set up auto-renewal
sudo crontab -e
```

Add to crontab:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Verify SSL Certificate

```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

---

## 💳 Payment Gateway Configuration

### 1. JazzCash Production Setup

```bash
# Update JazzCash credentials in production environment
# Contact JazzCash merchant support for production credentials
# Update webhook URL: https://api.gbdryfruits.com/api/payments/jazzcash/verify
```

### 2. EasyPaisa Production Setup

```bash
# Update EasyPaisa credentials in production environment
# Contact EasyPaisa business support for production credentials
# Update callback URL: https://api.gbdryfruits.com/api/payments/easypaisa/callback
```

### 3. Stripe Production Setup

```bash
# Activate Stripe account for production
# Update webhook endpoint: https://api.gbdryfruits.com/api/payments/stripe/webhook
# Configure webhook events:
# - payment_intent.succeeded
# - payment_intent.payment_failed
# - payment_intent.canceled
```

### 4. PayPal Production Setup

```bash
# Switch PayPal account to live mode
# Update webhook URL: https://api.gbdryfruits.com/api/payments/paypal/webhook
# Configure webhook events:
# - PAYMENT.AUTHORIZATION.CREATED
# - PAYMENT.AUTHORIZATION.VOIDED
# - PAYMENT.SALE.COMPLETED
```

---

## 🚀 Application Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/gbdryfruits
cd /var/www/gbdryfruits

# Clone repository (replace with your actual repository)
sudo git clone https://github.com/yourusername/gbdryfruits.git .

# Set ownership
sudo chown -R www-data:www-data /var/www/gbdryfruits
```

### 2. Install Dependencies

```bash
# Navigate to backend directory
cd /var/www/gbdryfruits/backend

# Install production dependencies
sudo -u www-data npm ci --production

# Install PM2 globally
sudo npm install -g pm2
```

### 3. Create PM2 Configuration

Create `/var/www/gbdryfruits/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'gbdryfruits-api',
      script: './server-integrated.js',
      cwd: '/var/www/gbdryfruits/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/gbdryfruits-error.log',
      out_file: '/var/log/pm2/gbdryfruits-out.log',
      log_file: '/var/log/pm2/gbdryfruits-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
```

### 4. Start Application with PM2

```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown www-data:www-data /var/log/pm2

# Start application
sudo -u www-data pm2 start ecosystem.config.js --env production

# Save PM2 configuration
sudo -u www-data pm2 save

# Setup PM2 startup script
sudo pm2 startup ubuntu -u www-data --hp /var/www/gbdryfruits
```

### 5. Configure Nginx

Create `/etc/nginx/sites-available/gbdryfruits`:

```nginx
# Frontend server
server {
    listen 80;
    server_name gbdryfruits.com www.gbdryfruits.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gbdryfruits.com www.gbdryfruits.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/gbdryfruits.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gbdryfruits.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/gbdryfruits.com/chain.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://api.paypal.com;" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Frontend files
    root /var/www/gbdryfruits/frontend;
    index index.html;
    
    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API subdomain
server {
    listen 80;
    server_name api.gbdryfruits.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.gbdryfruits.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/gbdryfruits.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gbdryfruits.com/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    # API proxy
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### 6. Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gbdryfruits /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Monitoring & Logging

### 1. Setup Application Monitoring

Install monitoring tools:

```bash
# Install Node.js monitoring
sudo npm install -g @pm2/io

# Start PM2 monitoring
sudo -u www-data pm2 io

# Install system monitoring
sudo apt-get install htop iotop nethogs
```

### 2. Configure Log Rotation

Create `/etc/logrotate.d/gbdryfruits`:

```
/var/log/pm2/gbdryfruits-*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        sudo -u www-data pm2 reloadLogs
    endscript
}
```

### 3. Setup Error Tracking

```bash
# Install Sentry for error tracking
cd /var/www/gbdryfruits/backend
sudo -u www-data npm install @sentry/node

# Update application to include Sentry
# Add SENTRY_DSN to environment variables
```

---

## 🛡️ Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt-get install ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt-get install fail2ban

# Configure Fail2Ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Add custom rules for API protection
sudo nano /etc/fail2ban/jail.local
```

Add to jail.local:
```ini
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600
```

### 3. Database Security

```bash
# Configure MongoDB security
sudo nano /etc/mongod.conf

# Enable authentication and bind to localhost
# Restart MongoDB
sudo systemctl restart mongod
```

---

## ⚡ Performance Optimization

### 1. Redis Installation for Caching

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

Redis configuration:
```conf
# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass your_redis_password
```

### 2. CDN Configuration

```bash
# Configure CloudFlare CDN (optional)
# Point DNS to CloudFlare
# Configure caching rules
# Enable DDoS protection
```

### 3. Database Optimization

```bash
# Create MongoDB indexes
mongosh gbdryfruits_prod

# Create indexes for performance
db.orders.createIndex({ "orderId": 1 }, { unique: true })
db.orders.createIndex({ "userId": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "payment.status": 1 })
db.orders.createIndex({ "createdAt": -1 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "phone": 1 }, { unique: true })
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "name": "text", "description": "text" })
```

---

## 💾 Backup & Recovery

### 1. Database Backup Script

Create `/usr/local/bin/backup-mongodb.sh`:

```bash
#!/bin/bash

# Configuration
DB_NAME="gbdryfruits_prod"
DB_USER="gbdryfruits"
DB_PASS="app_password"
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gbdryfruits_$DATE.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --db $DB_NAME --username $DB_USER --password $DB_PASS --gzip --archive=$BACKUP_FILE

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

# Log backup
echo "$(date): Database backup created - $BACKUP_FILE" >> /var/log/backup.log
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-mongodb.sh
```

### 2. Setup Automated Backups

```bash
# Add to crontab
sudo crontab -e
```

Add to crontab:
```bash
# Database backup daily at 2 AM
0 2 * * * /usr/local/bin/backup-mongodb.sh

# Application files backup weekly on Sunday at 3 AM
0 3 * * 0 tar -czf /var/backups/gbdryfruits_$(date +\%Y\%m\%d).tar.gz /var/www/gbdryfruits
```

### 3. Recovery Procedure

```bash
# Stop application
sudo -u www-data pm2 stop gbdryfruits-api

# Restore database
mongorestore --db gbdryfruits_prod --username gbdryfruits --password app_password --gzip --archive=/var/backups/mongodb/gbdryfruits_YYYYMMDD_HHMMSS.gz

# Start application
sudo -u www-data pm2 start gbdryfruits-api
```

---

## 🧪 Testing Production Deployment

### 1. Health Check

```bash
# Check application status
curl -f https://api.gbdryfruits.com/health

# Check SSL certificate
openssl s_client -connect gbdryfruits.com:443 -servername gbdryfruits.com

# Test payment endpoints
curl -X POST https://api.gbdryfruits.com/api/payments/cod/check-availability \
  -H "Content-Type: application/json" \
  -d '{"city":"Karachi","totalAmount":2000}'
```

### 2. Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Load test API
ab -n 1000 -c 10 https://api.gbdryfruits.com/health

# Load test frontend
ab -n 1000 -c 10 https://gbdryfruits.com/
```

### 3. Payment Gateway Testing

```bash
# Test each payment gateway in production mode
# Use small amounts for testing
# Verify webhook delivery
# Check email notifications
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] SSL certificates installed and valid
- [ ] Database created and configured
- [ ] Environment variables configured
- [ ] Payment gateway production credentials set
- [ ] Security headers configured
- [ ] Firewall rules applied
- [ ] Backup procedures tested
- [ ] Monitoring tools installed

### Post-Deployment
- [ ] Application health check passing
- [ ] Payment gateways responding correctly
- [ ] Email/SMS notifications working
- [ ] SSL certificate valid
- [ ] Performance metrics within limits
- [ ] Error tracking configured
- [ ] Backup automation running
- [ ] Load testing completed
- [ ] Security scan performed

---

## 🚨 Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check PM2 logs
sudo -u www-data pm2 logs gbdryfruits-api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check system resources
sudo htop
```

#### Payment Gateway Issues
```bash
# Check webhook delivery
sudo tail -f /var/log/nginx/access.log | grep webhook

# Verify SSL certificates
sudo certbot certificates

# Test payment gateway connectivity
curl -X POST https://payments.jazzcash.com.pk/CheckoutPage
```

#### Database Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test database connection
mongosh --host localhost --port 27017 -u gbdryfruits -p
```

---

## 📞 Support Contacts

### Technical Support
- **Email**: techsupport@gbdryfruits.com
- **Phone**: +92 300 1234567
- **Emergency**: +92 300 7654321

### Payment Gateway Support
- **JazzCash**: merchantsupport@jazzcash.com.pk
- **EasyPaisa**: business@easypaisa.com.pk
- **Stripe**: support@stripe.com
- **PayPal**: business-support@paypal.com

---

*Last Updated: December 2024*
*Version: 1.0.0*
*Environment: Production*
