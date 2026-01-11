# 🚀 QUICK DEPLOY GUIDE (10 Minutes)

## ⚡ FAST TRACK DEPLOYMENT

### Step 1: MongoDB Atlas (2 minutes)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) → Sign up FREE
2. Create **FREE M0 Sandbox** cluster
3. Create user: `gbdryfruits-admin` (save password!)
4. Add IP: `0.0.0.0/0` (Allow all)
5. Get connection string: `mongodb+srv://gbdryfruits-admin:PASSWORD@cluster.mongodb.net/gbdryfruits`

### Step 2: GitHub Setup (1 minute)
1. Create new repo: `gbdryfruits`
2. Push all files to GitHub
3. Make sure `render.yaml` is in root

### Step 3: Backend Deploy (3 minutes)
1. Go to [Render](https://render.com) → Sign up FREE
2. Click "New" → "Blueprint"
3. Connect GitHub repo `gbdryfruits`
4. Render auto-detects `render.yaml`
5. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://gbdryfruits-admin:PASSWORD@cluster.mongodb.net/gbdryfruits
   JWT_SECRET=your-random-secret-here
   FRONTEND_URL=https://your-site.netlify.app
   ```
6. Click "Apply" → Wait for deployment

### Step 4: Frontend Deploy (3 minutes)
1. Go to [Netlify](https://netlify.com) → Sign up FREE
2. Click "Add new site" → "Import existing project"
3. Connect GitHub repo `gbdryfruits`
4. Settings:
   - **Publish directory**: `frontend`
   - **Build command**: `echo "Static site"`
5. Add environment variable:
   ```
   API_URL=https://your-backend.onrender.com
   ```
6. Click "Deploy site"

### Step 5: Test (1 minute)
1. Visit your Netlify URL
2. Check if products load
3. Test cart functionality
4. Place test order

## 🎯 SUCCESS CHECKLIST

- [ ] Backend health: `https://your-backend.onrender.com/health`
- [ ] Frontend loads: `https://your-site.netlify.app`
- [ ] Products display correctly
- [ ] Cart works
- [ ] Order placement works

## 🔧 TROUBLESHOOTING

### Backend Issues
- **502 Error**: Check MongoDB connection string
- **CORS Error**: Update FRONTEND_URL env var

### Frontend Issues
- **API Error**: Check API_URL env var
- **Build Error**: Check netlify.toml

### Database Issues
- **Connection Refused**: Check IP whitelist in MongoDB Atlas

## 📱 CUSTOM DOMAIN (Optional)

1. **Netlify**: Add custom domain in site settings
2. **Backend**: Update FRONTEND_URL env var
3. **Frontend**: Update SITE_URL env var
4. **DNS**: Point nameservers to Netlify

## 🎉 YOU'RE LIVE!

Your GB Dry Fruits ecommerce site is now:
- ✅ Hosted on FREE tier
- ✅ HTTPS enabled
- ✅ Production ready
- ✅ Fully functional

**Total cost: $0/month** 🎊
