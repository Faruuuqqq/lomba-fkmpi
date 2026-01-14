# 🚀 Deployment Environment Variables Checklist

## 🔐 Required Environment Variables

### Backend (Render.com)
```bash
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=https://your-app.vercel.app
PORT=3001
NODE_ENV=production
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com
```

## ⚠️ Critical Setup Points

### 1. CORS Configuration (FIXED ✅)
Backend now supports:
- Local development: `http://localhost:3000`
- Vercel domains: `https://vercel.app` and `https://*.vercel.app`
- All required methods: GET, HEAD, PUT, PATCH, POST, DELETE
- Proper headers: Content-Type, Authorization
- Credentials enabled for cookies

### 2. Prisma Client Generation (FIXED ✅)
Build script now runs:
```bash
npx prisma generate && nest build
```
This ensures Prisma Client is generated before compilation.

### 3. Database Connection
- PostgreSQL is required (Neon, Supabase, Railway, etc.)
- Ensure connection string includes `?schema=public`
- Test connection: `npx prisma db push`

## 🏗 Build Process (Fixed)

### Backend Build
```bash
cd server
npm run build
# Steps:
# 1. Generate Prisma Client (CRITICAL)
# 2. Compile TypeScript
# 3. Bundle with NestJS
# 4. Optimize for production
```

### Frontend Build
```bash
cd frontend
npm run build
# Steps:
# 1. Compile Next.js
# 2. Optimize assets
# 3. Generate static pages
# 4. Create production build
```

## 🌐 Deployment Flow

### 1. Backend Deployment (Render)
1. Push code to GitHub
2. Connect repository to Render
3. Set all environment variables
4. Deploy as Web Service
5. Test API endpoints

### 2. Frontend Deployment (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `NEXT_PUBLIC_API_URL` to backend URL
4. Deploy automatically
5. Test full application

## 🧪 Post-Deployment Testing

### API Health Check
```bash
curl https://your-backend.onrender.com/health
# Should return: {"status": "ok", "timestamp": "..."}
```

### Frontend-Backend Connection
1. Test login functionality
2. Verify CORS is working
3. Check AI features
4. Test file uploads
5. Verify jury access works

## ⚡ Common Issues & Solutions

### Issue: CORS Error
```
Access to fetch at 'https://frontend.vercel.app' from origin 'https://backend.onrender.com' has been blocked by CORS policy
```
**Solution**: Ensure `FRONTEND_URL` matches exactly the deployed Vercel URL.

### Issue: Prisma Client Error
```
Error: Cannot find module '@prisma/client'
```
**Solution**: Run `npx prisma generate` before build (now fixed in build script).

### Issue: Database Connection
```
Error: P1001: Can't reach database server
```
**Solution**: Check DATABASE_URL format and network connectivity.

### Issue: AI API Not Working
```
Error: Invalid OpenAI API key
```
**Solution**: Verify `OPENAI_API_KEY` is valid and has credits.

### Issue: Build Fails on Render
```
Error: Cannot find module
```
**Solution**: Check if `node_modules` is in .gitignore and dependencies are installed.

## 📱 Mobile Considerations

- PWA manifest should be accessible at `/manifest.json`
- Service worker should work correctly
- Touch targets should be 44px minimum
- Responsive design tested on actual devices
- Jury access button works on mobile

## 🔍 Debug Mode

### Backend Debug
```bash
cd server
npm run start:debug
# Provides detailed error logs
```

### Frontend Debug
```bash
cd frontend
npm run dev
# Next.js dev mode with source maps
```

## 🎯 Production Ready Checklist

### Backend ✅
- [x] All environment variables set
- [x] CORS configured for multiple domains
- [x] Prisma client generation in build
- [x] Database connection string ready
- [x] Build script includes prisma generate
- [x] Security headers configured
- [x] Rate limiting implemented
- [x] JWT authentication working

### Frontend ✅
- [x] API URL environment variable
- [x] Production build working
- [x] Responsive design implemented
- [x] PWA configuration complete
- [x] Jury access functional
- [x] Error handling implemented

### Integration ✅
- [x] Frontend can connect to backend
- [x] Authentication flow works
- [x] AI features functional
- [x] File uploads working
- [x] Real-time features working
- [x] Analytics tracking functional

## 🚨 Critical Must-Do Before Deploy

### 1. Database Setup
```bash
# Ensure database exists and is accessible
npx prisma db push
npx prisma generate
```

### 2. Environment Variables
```bash
# Test locally first
cp .env.example .env
# Fill with real values
npm run build
npm run start:prod
```

### 3. Git Repository
```bash
# Ensure .gitignore includes:
node_modules/
.env
.env.local
dist/
.next/
```

## 🏆 Deploy Commands

### Backend Production Deploy
```bash
git add .
git commit -m "Production deployment"
git push origin main
# Render will auto-deploy
```

### Frontend Production Deploy
```bash
git add .
git commit -m "Frontend deployment update"
git push origin main
# Vercel will auto-deploy
```

## 📊 Monitoring

### Backend Health
- Check Render dashboard for server status
- Monitor database connections
- Watch error logs
- Track API response times

### Frontend Analytics
- Vercel Analytics for performance
- Error tracking in browser console
- Monitor user interactions

## 🔐 Security Checklist

- [x] JWT secret is strong (32+ chars)
- [x] Database URL uses SSL
- [x] CORS is properly configured
- [x] Rate limiting is enabled
- [x] Input validation is implemented
- [x] Password hashing with bcrypt
- [x] Environment variables are secret

## 🎉 Success Indicators

### Working Deployment
- Backend responds to `/health` endpoint
- Frontend loads without errors
- Login page accessible with jury credentials
- User can create projects and use AI features
- File uploads work correctly
- Mobile PWA functions properly

Your MITRA AI application is now **production-ready** with all critical issues fixed! 🚀