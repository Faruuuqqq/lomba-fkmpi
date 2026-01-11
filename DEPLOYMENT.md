# Deployment Guide - MITRA-AI

## Backend Deployment (Render)

### 1. Prepare Database

#### Option A: Render PostgreSQL
1. Go to Render Dashboard
2. Create New → PostgreSQL
3. Database Name: `mitra_ai`
4. Region: Singapore (recommended for Indonesia)
5. Save the connection string

#### Option B: Neon (Alternative)
1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 2. Deploy Backend

1. Push code to GitHub repository
2. Go to Render Dashboard
3. Create New → Web Service
4. Connect your GitHub repository
5. Configure:
   - **Name**: mitra-ai-server
   - **Root Directory**: server
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

6. Set Environment Variables:
   ```
   DATABASE_URL=<your-postgres-connection-string>
   JWT_SECRET=<random-secret-key>
   OPENAI_API_KEY=<your-openai-key>
   FRONTEND_URL=<your-vercel-url>
   PORT=3001
   NODE_ENV=production
   ```

7. Click "Deploy Web Service"
8. Copy the deployed URL (e.g., `https://mitra-ai-server.onrender.com`)

### 3. Run Database Migration

After deployment, access Render Console:
1. Go to your Web Service
2. Click "Shell" or "Console"
3. Run:
```bash
npx prisma generate
npx prisma migrate deploy
```

---

## Frontend Deployment (Vercel)

### 1. Prepare Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Create New Project
3. Import your GitHub repository
4. In Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_API_URL=<your-render-backend-url>
   ```

### 2. Configure Build

- **Framework Preset**: Next.js
- **Root Directory**: frontend
- **Build Command**: `npm install && npm run build`
- **Output Directory**: `.next`

### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Copy the Vercel URL

---

## Post-Deployment Checklist

### Backend (Render)
- [ ] Verify API is accessible (test `GET /` or health endpoint)
- [ ] Test `/auth/register` endpoint
- [ ] Test `/auth/login` endpoint
- [ ] Verify database migrations ran successfully
- [ ] Check OpenAI API integration works
- [ ] Enable Auto-Deploy from main branch

### Frontend (Vercel)
- [ ] Verify website loads correctly
- [ ] Test login functionality
- [ ] Test project creation
- [ ] Test editor and paste guard
- [ ] Test AI interaction (after 150 words)
- [ ] Test export feature
- [ ] Enable Auto-Deploy from main branch

---

## CORS Configuration

Update backend `.env` with your Vercel URL:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

The CORS is already configured in `server/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

---

## Handle Cold Start (Render Free Tier)

Render free tier servers sleep after 15 minutes of inactivity. Solutions:

### Option 1: Uptime Robot (Free)
1. Go to [UptimeRobot](https://uptimerobot.com)
2. Add new monitor
3. Type: HTTPS
4. URL: Your Render backend URL
5. Interval: 5 minutes

### Option 2: cron-job.org (Free)
1. Go to [cron-job.org](https://cron-job.org)
2. Register and add cron job
3. URL: Your Render backend URL
4. Schedule: Every 5 minutes

### Option 3: Render Always-On (Paid)
Upgrade your Render instance to Standard/Pro tier for always-on server.

---

## Environment Variables Reference

### Backend (.env)
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public
JWT_SECRET=random-secret-string-min-32-chars
OPENAI_API_KEY=sk-your-openai-api-key
PORT=3001

# Optional (defaults)
FRONTEND_URL=http://localhost:3000
NODE_ENV=production
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-render-backend-url
```

---

## Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure `FRONTEND_URL` in backend matches your exact Vercel URL (including https://)

### Issue: Database Connection Failed
**Solution**: 
- Verify DATABASE_URL is correct
- Check if IP whitelist is blocking connection
- Test connection locally with same credentials

### Issue: AI Not Responding
**Solution**:
- Verify OPENAI_API_KEY is valid
- Check OpenAI API credits
- Review Render logs for errors

### Issue: Frontend Build Fails
**Solution**:
- Clear Next.js cache: `rm -rf .next`
- Verify all dependencies are installed
- Check TypeScript errors

### Issue: Slow First Load (Cold Start)
**Solution**: Use UptimeRobot as mentioned above

---

## Monitoring

### Backend Logs (Render)
- Go to Render Dashboard → Web Service → Logs
- View real-time logs for debugging

### Frontend Analytics (Vercel)
- Go to Vercel Dashboard → Analytics
- Monitor page views, performance, errors

---

## Backup Strategy

### Database Backup (Neon/Render)
- Most managed databases have auto-backup
- Export data regularly using:
```bash
pg_dump $DATABASE_URL > backup.sql
```

---

## Security Checklist

- [ ] Change default JWT_SECRET in production
- [ ] Use environment-specific API keys
- [ ] Enable HTTPS (default in Vercel/Render)
- [ ] Set up rate limiting (future enhancement)
- [ ] Add request validation
- [ ] Implement proper error handling
- [ ] Regular dependency updates (`npm audit`)

---

## Domain Configuration (Optional)

### Custom Domain for Backend
1. Go to Render → Web Service → Settings
2. Add custom domain
3. Update DNS records (CNAME)

### Custom Domain for Frontend
1. Go to Vercel → Project → Settings
2. Add custom domain
3. Update DNS records (CNAME or A)

---

## Cost Estimation (Free Tier)

### Backend (Render Free)
- Web Service: $0/month
- PostgreSQL: $0/month (90 days free, then $7/month)
- Total: ~$7/month after trial

### Frontend (Vercel Free)
- Hosting: $0/month
- Bandwidth: 100GB/month free
- Total: $0/month

### OpenAI API
- GPT-4o-mini: $0.15/1M input tokens
- Estimated usage: ~$1-5/month for moderate usage
- Total: ~$1-5/month

**Total Estimated Cost**: $8-12/month (after free trials)
