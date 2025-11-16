# 🚀 GitHub + Cloudflare Pages Deployment - EASIEST METHOD!

## ✨ This is THE simplest way to deploy your website!

Just push these files to GitHub, connect to Cloudflare Pages, and you're done! Cloudflare will automatically deploy every time you update GitHub.

---

## 📂 Files in This Folder

- `index.html` - Your main website
- `style.css` - All the styling
- `app.js` - PC builder logic & pricing
- `README.md` - This file

That's it! Just 3 files (+ this README).

---

## 🎯 SUPER EASY DEPLOYMENT (5 minutes)

### Step 1: Push to GitHub (You already have a repo!)

You already have: `https://github.com/funkyoushift/subtronics-website`

Just update it with these 3 files:

```bash
# In your local repo folder
git pull
# Copy these 3 files to your repo:
# - index.html
# - style.css  
# - app.js

git add .
git commit -m "Complete PC builder website"
git push
```

### Step 2: Connect Cloudflare Pages

1. Go to: https://dash.cloudflare.com/
2. Click "**Workers & Pages**"
3. Click "**Create**" → "**Pages**"
4. Click "**Connect to Git**"
5. Select "**GitHub**"
6. Choose your repository: **subtronics-website**
7. Click "**Begin setup**"

### Step 3: Configure Build Settings

On the setup page:
- **Project name**: subtronics-website (or whatever you want)
- **Production branch**: main
- **Build command**: (leave empty)
- **Build output directory**: `/`

Click "**Save and Deploy**"

### Step 4: Add Custom Domain

After deployment:
1. Go to your Pages project
2. Click "**Custom domains**"
3. Click "**Set up a custom domain**"
4. Enter: **subtronicsllc.com**
5. Click "**Continue**"
6. Cloudflare will handle the DNS automatically!

### Step 5: DONE! 🎉

Your site is live at:
- `https://subtronicsllc.com`
- Auto-deploys when you push to GitHub!

---

## 🔄 How to Update Your Website

1. Edit any file (index.html, style.css, app.js)
2. Commit and push to GitHub
3. Cloudflare automatically redeploys!
4. Your site updates in ~30 seconds!

---

## 💰 Update Pricing

Edit `app.js` and find the `getEmbeddedData()` function.

Change any prices:
```javascript
{
  "sku": "BUNDLE-GAMING-ENTRY",
  "bundle_price": 450,  // Change this
  // ...
}
```

Push to GitHub → Auto-updates!

---

## ✅ Advantages of This Method

- ✅ Auto-deploy on every Git push
- ✅ No manual uploads needed
- ✅ Free hosting
- ✅ Fast global CDN
- ✅ Easy to update
- ✅ Version control with Git
- ✅ Can collaborate with others
- ✅ Rollback to previous versions anytime

---

## 🎯 What You Get

- **6 PC Build Templates** ($450 - $2,400)
- **9 GPU Options** (RX 6600 to RTX 4090)
- **Interactive Price Calculator**
- **Professional Design**
- **Mobile Responsive**
- **Fast Cloudflare CDN**
- **Auto-deployed from GitHub**

---

## 📞 Support

**Email**: contact@subtronicsllc.com  
**Location**: Flushing, Michigan

---

## 🎉 You're Done!

This is the easiest method. Just push to GitHub and Cloudflare does the rest!

No more manual deployments. No more copy/pasting code. Just edit → push → live! 🚀
