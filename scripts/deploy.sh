#!/bin/bash

# CaseBreak.AI Production Deployment Script
# Run: chmod +x scripts/deploy.sh && ./scripts/deploy.sh

set -e

echo "🚀 CaseBreak.AI Production Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Verify environment variables
echo "🔍 Checking environment setup..."

if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "Copy .env.example to .env.local and configure your keys"
    cp .env.example .env.local
    echo "✅ Created .env.local template"
    echo "🔑 Please configure your API keys before deployment"
    exit 1
fi

# Build test
echo "🏗️  Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - fix errors before deployment"
    exit 1
fi

# Git status check
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected. Committing..."
    git add .
    git commit -m "deploy: production ready build"
    git push origin main
else
    echo "✅ Git repository is clean"
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment initiated!"
echo "Check your Vercel dashboard for deployment status"
echo "Remember to:"
echo "  1. Configure environment variables in Vercel"
echo "  2. Set up custom domain"
echo "  3. Configure Clerk webhooks"
echo "  4. Test all functionality"