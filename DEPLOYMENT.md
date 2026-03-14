# 🚀 CaseBreak.AI Production Deployment Guide

## Prerequisites

1. **GitHub Account**: For code hosting
2. **Vercel Account**: For hosting (free tier available)
3. **Supabase Account**: For production database
4. **Domain Name**: Custom domain (optional but recommended)
5. **Clerk Production App**: Separate from development

---

## 🗄️ **Step 1: Set Up Production Database**

### **1.1 Create Supabase Production Project**
```bash
# Go to https://app.supabase.com
# 1. Click "New Project"
# 2. Choose organization
# 3. Name: "casebreak-ai-prod"
# 4. Generate strong password
# 5. Select region (US East recommended)
```

### **1.2 Configure Database Schema**
```bash
# In Supabase SQL Editor, run:
# 1. Enable PostGIS extension
# 2. Create all tables from schema.ts
# 3. Set up Row Level Security policies
# 4. Configure realtime subscriptions
```

### **1.3 Get Production Database Credentials**
```bash
# From Supabase Project Settings → API:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

---

## 🔐 **Step 2: Configure Clerk for Production**

### **2.1 Create Production Clerk Application**
```bash
# Go to https://dashboard.clerk.com
# 1. Click "Add application"
# 2. Name: "CaseBreak.AI Production"
# 3. Select authentication methods
# 4. Choose "Production" environment
```

### **2.2 Configure Production URLs**
```bash
# In Clerk Dashboard → Paths:
Sign-in URL: https://your-domain.com/sign-in
Sign-up URL: https://your-domain.com/sign-up
After sign-in: https://your-domain.com/dashboard
After sign-up: https://your-domain.com/dashboard
```

### **2.3 Get Production API Keys**
```bash
# From Clerk Dashboard → API Keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

---

## 📦 **Step 3: Prepare Code for Deployment**

### **3.1 Commit All Changes**
```bash
git add .
git commit -m "feat: production ready - authentication, routing, legal features"
git push origin main
```

### **3.2 Create Production Build Script**
```json
// package.json - verify these scripts exist:
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "postbuild": "next-sitemap"
  }
}
```

---

## 🌐 **Step 4: Deploy to Vercel**

### **4.1 Connect Repository**
```bash
# Option A: Vercel Dashboard
# 1. Go to https://vercel.com
# 2. Click "New Project"
# 3. Import from GitHub
# 4. Select casebreak-ai repository

# Option B: Vercel CLI
npm i -g vercel
vercel login
vercel --prod
```

### **4.2 Configure Environment Variables**
```bash
# In Vercel Dashboard → Settings → Environment Variables:

# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# AI Keys (when ready)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### **4.3 Deploy**
```bash
# Automatic deployment triggers on git push
git push origin main

# Manual deployment via CLI
vercel --prod
```

---

## 🌍 **Step 5: Configure Custom Domain**

### **5.1 Add Domain to Vercel**
```bash
# In Vercel Dashboard → Settings → Domains:
# 1. Add your domain: casebreak.ai
# 2. Configure DNS records as shown
# 3. Wait for SSL certificate provisioning
```

### **5.2 DNS Configuration**
```bash
# Add these DNS records to your domain registrar:
# A Record: @ → 76.76.19.61
# CNAME: www → casebreak.ai
# Or use Vercel nameservers for automatic management
```

---

## 🔗 **Step 6: Configure Webhooks**

### **6.1 Set Up Clerk Webhook**
```bash
# In Clerk Dashboard → Webhooks:
Endpoint URL: https://your-domain.com/api/webhooks/clerk
Events: user.created, user.updated, user.deleted, organization.*
HTTP Headers: None required
```

### **6.2 Test Webhook**
```bash
# Create test user in production to verify database sync
curl -X POST https://your-domain.com/api/webhooks/clerk
```

---

## ✅ **Step 7: Production Checklist**

### **7.1 Security**
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables secured
- [ ] Clerk production keys active
- [ ] Database RLS policies enabled
- [ ] CORS configured properly

### **7.2 Performance**
- [ ] Next.js build optimization
- [ ] Image optimization enabled
- [ ] Static generation where possible
- [ ] CDN distribution (automatic with Vercel)

### **7.3 Monitoring**
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Database performance monitoring
- [ ] Uptime monitoring

### **7.4 Legal Compliance**
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policies

---

## 📊 **Step 8: Go Live!**

### **8.1 Final Testing**
```bash
# Test all critical paths:
✅ Homepage loads
✅ Sign up flow works
✅ Dashboard authentication
✅ Mock trial creation
✅ Document upload
✅ Case management
✅ All navigation links
```

### **8.2 Launch Announcement**
```bash
# Your site is now live at:
https://your-domain.com

# Marketing URLs:
- Homepage: https://your-domain.com
- About: https://your-domain.com/about
- Sign Up: https://your-domain.com/sign-up
```

---

## 🔄 **Alternative Deployment Options**

### **Railway** (Database + App Hosting)
```bash
# 1. Connect GitHub repo
# 2. Add PostgreSQL service
# 3. Configure environment variables
# 4. Deploy with automatic SSL
```

### **DigitalOcean App Platform**
```bash
# 1. Create new app from GitHub
# 2. Choose Node.js buildpack
# 3. Add managed PostgreSQL database
# 4. Configure environment variables
```

### **AWS Amplify**
```bash
# 1. Connect repository
# 2. Configure build settings
# 3. Add RDS PostgreSQL
# 4. Set up environment variables
```

---

## 💰 **Cost Estimates**

```bash
Vercel Pro: $20/month (includes custom domains, analytics)
Supabase Pro: $25/month (includes 8GB database, 100GB bandwidth)
Domain: $10-15/year
Clerk Pro: $25/month (includes unlimited users)

Total: ~$70/month for production-ready legal tech platform
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Build Failures**: Check environment variables
2. **Database Connections**: Verify Supabase URL/keys
3. **Authentication**: Confirm Clerk production URLs
4. **404 Errors**: Check routing configuration
5. **CORS Issues**: Configure allowed origins

### **Support Resources:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Clerk Docs: https://clerk.com/docs
- Next.js Docs: https://nextjs.org/docs

Ready to deploy? Follow Step 1 to begin! 🚀