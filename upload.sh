#!/bin/bash

# Simple GitHub Upload Script for Subtronics Website
# This script will push your website files to GitHub

echo "🚀 Subtronics Website - GitHub Upload"
echo "====================================="
echo ""

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository!"
    echo ""
    echo "Please run this script from your subtronics-website folder"
    echo "Or clone it first with:"
    echo "  git clone https://github.com/funkyoushift/subtronics-website.git"
    echo "  cd subtronics-website"
    echo "  bash upload.sh"
    exit 1
fi

echo "📥 Pulling latest changes..."
git pull

echo ""
echo "📝 Adding files..."
git add index.html style.css app.js

echo ""
echo "💾 Committing changes..."
git commit -m "Complete PC builder website with pricing calculator"

echo ""
echo "📤 Pushing to GitHub..."
git push

echo ""
echo "✅ Done! Your files are now on GitHub!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://dash.cloudflare.com/"
echo "2. Click 'Workers & Pages' → 'Create' → 'Pages'"
echo "3. Connect to GitHub and select your repo"
echo "4. Click 'Save and Deploy'"
echo "5. Add custom domain: subtronicsllc.com"
echo ""
echo "Your site will be live in ~2 minutes! 🎉"
