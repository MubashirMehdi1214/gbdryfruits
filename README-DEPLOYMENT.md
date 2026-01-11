# 🚀 GB Dry Fruits - Production Deployment Guide

## 📋 Overview
This guide will help you deploy your GB Dry Fruits ecommerce application to production using:
- **Frontend**: Netlify (FREE)
- **Backend**: Render (FREE)
- **Database**: MongoDB Atlas (FREE)
- **Custom Domain**: Supported

## 🎯 Prerequisites
- GitHub account
- Netlify account
- Render account
- MongoDB Atlas account
- Custom domain (optional)

## 📁 Project Structure
```
gbdryfruits/
├── backend/                 # Node.js API
│   ├── server-prod.js      # Production server
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Dependencies
│   └── routes/             # API routes
├── frontend/               # Static HTML/CSS/JS
│   ├── index-prod.html     # Production homepage
│   ├── js/
│   │   ├── config.js       # Configuration
│   │   ├── api.js          # API helper
│   │   └── ...
│   ├── css/
│   └── .env.example        # Environment variables template
├── render.yaml             # Render deployment config
├── netlify.toml            # Netlify deployment config
└── README-DEPLOYMENT.md    # This file
```

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for FREE account
3. Create new organization: `gbdryfruits`

### 1.2 Create Database
1. Click "Build a Database"
2. Select **FREE** plan (M0 Sandbox)
3. Choose cloud provider: **AWS**
4. Choose region: **Mumbai (ap-south-1)** or nearest
5. Cluster name: `gbdryfruits-cluster`
6. Click "Create Cluster"

### 1.3 Configure Security
1. Go to "Database Access" → "Add New Database User"
2. Username: `gbdryfruits-admin`
3. Password: Generate strong password (save it!)
4. Click "Create User"

### 1.4 Network Access
1. Go to "Network Access" → "Add IP Address"
2. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" → "Connect" → "Drivers"
2. Copy connection string
3. Replace `<password>` with your password
4. Save this string: `mongodb+srv://gbdryfruits-admin:PASSWORD@gbdryfruits-cluster.mongodb.net/gbdryfruits`

## 🔧 Step 2: Backend Setup (Render)

### 2.1 Prepare Backend Code
1. Copy `backend/.env.example` to `backend/.env`
2. Fill in your environment variables:
```env
MONGODB_URI=mongodb+srv://gbdryfruits-admin:YOUR_PASSWORD@gbdryfruits-cluster.mongodb.net/gbdryfruits
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-domain.netlify.app
```

### 2.2 Push to GitHub
1. Create new repository: `gbdryfruits`
2. Push all files to GitHub
3. Make sure `render.yaml` is in root directory

### 2.3 Deploy to Render
1. Go to [Render](https://render.com)
2. Sign up for FREE account
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will detect `render.yaml` automatically
6. Click "Apply"

### 2.4 Configure Environment Variables
1. Go to your service dashboard
2. Click "Environment" tab
3. Add these variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate random secret
   - `FRONTEND_URL`: Your Netlify URL (get after Step 3)

### 2.5 Verify Deployment
1. Wait for deployment to complete
2. Test health endpoint: `https://your-service.onrender.com/health`
3. Should return: `{"status": "ok"}`

## 🌐 Step 3: Frontend Setup (Netlify)

### 3.1 Prepare Frontend Code
1. Copy `frontend/.env.example` to `frontend/.env.production`
2. Update API URL:
```env
API_URL=https://your-service.onrender.com
SITE_URL=https://your-domain.netlify.app
```

### 3.2 Deploy to Netlify
1. Go to [Netlify](https://netlify.com)
2. Sign up for FREE account
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - **Publish directory**: `frontend`
   - **Build command**: `echo "Static site - no build needed"`
6. Click "Deploy site"

### 3.3 Configure Environment Variables
1. Go to Site settings → "Build & deploy"
2. Click "Environment" → "Edit variables"
3. Add:
   - `API_URL`: Your Render backend URL
   - `NODE_ENV`: `production`

### 3.4 Verify Deployment
1. Wait for deployment to complete
2. Visit your Netlify URL
3. Check browser console for API connectivity

## 🌍 Step 4: Custom Domain Setup (Optional)

### 4.1 Configure Netlify Domain
1. Go to Netlify site settings → "Domain management"
2. Click "Add custom domain"
3. Enter your domain: `yourdomain.com`
4. Follow DNS instructions

### 4.2 Update Backend CORS
1. Go to Render service → "Environment"
2. Update `FRONTEND_URL`: `https://yourdomain.com`
3. Redeploy backend

### 4.3 Update Frontend Environment
1. Go to Netlify site settings → "Environment"
2. Update `SITE_URL`: `https://yourdomain.com`
3. Redeploy frontend

## 🧪 Step 5: Testing

### 5.1 API Testing
```bash
# Test backend health
curl https://your-service.onrender.com/health

# Test products endpoint
curl https://your-service.onrender.com/api/products
```

### 5.2 Frontend Testing
1. Visit your website
2. Check products load correctly
3. Test cart functionality
4. Test checkout process
5. Test admin panel

### 5.3 Payment Testing
- Test Cash on Delivery orders
- Test JazzCash/EasyPaisa flow
- Test Meezan Bank flow
- Verify COD charges work correctly

## 🔒 Step 6: Security Checklist

### 6.1 Backend Security
- [ ] JWT secret is strong and unique
- [ ] MongoDB password is strong
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active

### 6.2 Frontend Security
- [ ] Environment variables are set
- [ ] API calls use HTTPS
- [ ] Sensitive data is not exposed
- [ ] Content Security Policy is active

### 6.3 Database Security
- [ ] Network access is properly configured
- [ ] Database user has limited permissions
- [ ] Backups are enabled

## 📊 Step 7: Monitoring

### 7.1 Render Monitoring
- Check service logs
- Monitor response times
- Set up alerts for errors

### 7.2 Netlify Monitoring
- Check build logs
- Monitor site performance
- Set up form notifications

### 7.3 MongoDB Monitoring
- Monitor database performance
- Check storage usage
- Set up alerts

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues
- **Problem**: 502 Bad Gateway
  - **Solution**: Check backend logs, ensure MongoDB connection is working

- **Problem**: CORS errors
  - **Solution**: Verify FRONTEND_URL environment variable

#### Frontend Issues
- **Problem**: API calls failing
  - **Solution**: Check API_URL environment variable

- **Problem**: Build failures
  - **Solution**: Check netlify.toml configuration

#### Database Issues
- **Problem**: Connection refused
  - **Solution**: Check IP whitelist in MongoDB Atlas

## 🎉 Success Criteria

Your deployment is successful when:
- [ ] Backend health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Orders can be placed
- [ ] Admin panel is accessible
- [ ] Custom domain works (if configured)
- [ ] HTTPS is working
- [ ] All payment methods work

## 📞 Support

If you encounter issues:
1. Check service logs
2. Verify environment variables
3. Test API endpoints individually
4. Review this troubleshooting guide

## 🔄 Maintenance

### Monthly Tasks
- Check MongoDB storage usage
- Review service logs
- Update dependencies
- Monitor performance metrics

### Quarterly Tasks
- Update SSL certificates
- Review security settings
- Backup database
- Update payment configurations

---

**🎊 Congratulations! Your GB Dry Fruits ecommerce site is now live in production!**

For support, check the troubleshooting section or review service logs.
