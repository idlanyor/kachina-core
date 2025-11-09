# Deploying Documentation to GitHub Pages

Complete guide to deploy Kachina-MD documentation to GitHub Pages.

## Prerequisites

- GitHub repository: `https://github.com/idlanyor/kachina-core`
- Git installed and configured
- Documentation files ready in `docs-site/`

## Quick Start

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (⚙️)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select: **GitHub Actions**

![GitHub Pages Settings](https://docs.github.com/assets/cb-25095/images/help/pages/publishing-source-drop-down.png)

### 2. Push to GitHub

```bash
# Make sure all files are committed
git status

# Add all documentation files
git add .

# Commit
git commit -m "Add VitePress documentation"

# Push to GitHub
git push origin main
```

### 3. Workflow Runs Automatically

Once you push, GitHub Actions will automatically:
1. Build the documentation
2. Deploy to GitHub Pages
3. Make it available at your URL

### 4. Check Deployment Status

1. Go to your repository
2. Click **Actions** tab
3. You'll see "Deploy Documentation" workflow running
4. Wait for green checkmark ✅

### 5. Access Your Documentation

Your documentation will be available at:

```
https://idlanyor.github.io/kachina-core/
```

## Step-by-Step Guide

### Step 1: Verify Files

Make sure these files exist:

```bash
# Check if workflow exists
ls -la .github/workflows/deploy-docs.yml

# Check if docs are ready
ls -la docs-site/

# Check VitePress config
ls -la docs-site/.vitepress/config.js
```

### Step 2: Test Locally First

Before deploying, test locally:

```bash
# Run dev server
npm run docs:dev

# Or build and preview
npm run docs:build
npm run docs:preview
```

Open `http://localhost:5173` and verify everything works.

### Step 3: Commit Changes

```bash
# Check what's changed
git status

# Add all files
git add .

# Commit with descriptive message
git commit -m "feat: add complete VitePress documentation site

- Add homepage with features
- Add authentication guides (QR & Pairing)
- Add core concepts (messages, events)
- Add feature guides (sending messages, stickers, groups, view once)
- Add API reference
- Add examples
- Setup GitHub Actions deployment
- Configure custom theme
"

# Push to GitHub
git push origin main
```

### Step 4: Enable GitHub Pages

**Via GitHub Website:**

1. Go to: `https://github.com/idlanyor/kachina-core/settings/pages`
2. Under **Build and deployment**:
   - **Source**: Select `GitHub Actions`
3. Click **Save** (if button appears)

**Screenshot:**
```
┌─────────────────────────────────────┐
│ GitHub Pages                        │
├─────────────────────────────────────┤
│ Build and deployment                │
│                                     │
│ Source                              │
│ [GitHub Actions ▼]  ← Select this  │
│                                     │
│ Your site is live at:               │
│ https://idlanyor.github.io/...     │
└─────────────────────────────────────┘
```

### Step 5: Wait for Deployment

1. Go to **Actions** tab: `https://github.com/idlanyor/kachina-core/actions`
2. You'll see "Deploy Documentation" workflow
3. Click on it to see progress
4. Wait for all steps to complete (usually 1-2 minutes)

**Workflow steps:**
```
✓ Checkout
✓ Setup Node.js
✓ Setup Pages
✓ Install dependencies
✓ Build documentation
✓ Upload artifact
✓ Deploy to GitHub Pages
```

### Step 6: Verify Deployment

Once deployed, visit:
```
https://idlanyor.github.io/kachina-core/
```

You should see your documentation homepage!

## Troubleshooting

### Issue 1: 404 Not Found

**Problem:** Site shows 404 after deployment

**Solutions:**

1. **Check base URL in config:**
   ```javascript
   // docs-site/.vitepress/config.js
   export default defineConfig({
     base: '/kachina-core/', // Must match repo name
     // ...
   })
   ```

2. **Verify repository name:**
   - If repo is `kachina-core`, base should be `/kachina-core/`
   - If repo is `docs`, base should be `/docs/`

3. **Check GitHub Pages settings:**
   - Make sure "Source" is set to "GitHub Actions"

### Issue 2: Workflow Failed

**Problem:** Red X in Actions tab

**Solutions:**

1. **Click on failed workflow** to see error
2. **Common errors:**

   - **NPM install failed:**
     ```bash
     # Fix: Make sure package.json is committed
     git add package.json package-lock.json
     git commit -m "Add package files"
     git push
     ```

   - **Build failed:**
     ```bash
     # Fix: Test build locally first
     npm run docs:build

     # If it fails, fix errors and commit
     git add .
     git commit -m "Fix build errors"
     git push
     ```

   - **Permission denied:**
     - Go to Settings → Actions → General
     - Scroll to "Workflow permissions"
     - Select "Read and write permissions"
     - Click Save

### Issue 3: Deployment Works But Page Is Blank

**Problem:** Site loads but shows blank page

**Solutions:**

1. **Check browser console** (F12) for errors
2. **Verify asset paths:**
   ```javascript
   // In config.js, check base is correct
   base: '/kachina-core/'
   ```

3. **Clear browser cache** and reload

### Issue 4: CSS/Images Not Loading

**Problem:** Page loads but styling is broken

**Solution:**

Check that all asset paths are relative or use proper base:

```javascript
// config.js
export default defineConfig({
  base: '/kachina-core/', // Important!
  // ...
})
```

### Issue 5: Old Version Still Showing

**Problem:** Made changes but old version still appears

**Solutions:**

1. **Hard refresh browser:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5`

2. **Clear GitHub Pages cache:**
   - Wait 5-10 minutes
   - GitHub Pages has caching

3. **Check if workflow ran:**
   - Go to Actions tab
   - Make sure latest workflow completed

## Manual Deployment (Alternative)

If GitHub Actions doesn't work, you can deploy manually:

### Build Locally

```bash
# Build the site
npm run docs:build

# Output will be in docs-site/.vitepress/dist/
```

### Deploy to GitHub Pages (Manual)

```bash
# Go to output directory
cd docs-site/.vitepress/dist

# Initialize git
git init
git add -A
git commit -m 'Deploy documentation'

# Push to gh-pages branch
git push -f git@github.com:idlanyor/kachina-core.git main:gh-pages

# Go back
cd -
```

Then in GitHub Settings → Pages, select:
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `root`

## Continuous Deployment

### Automatic Deployment

The workflow is configured to auto-deploy when:

1. **Push to main branch** AND
2. **Files in `docs-site/` changed** OR
3. **Workflow file changed**

```yaml
# .github/workflows/deploy-docs.yml
on:
  push:
    branches:
      - main
    paths:
      - 'docs-site/**'
      - '.github/workflows/deploy-docs.yml'
```

### Manual Deployment Trigger

You can also trigger deployment manually:

1. Go to **Actions** tab
2. Click **Deploy Documentation** workflow
3. Click **Run workflow** button
4. Select branch (main)
5. Click **Run workflow**

## Custom Domain (Optional)

To use custom domain like `docs.kachina-md.com`:

### 1. Add CNAME File

```bash
# Create CNAME file
echo "docs.kachina-md.com" > docs-site/public/CNAME

# Commit
git add docs-site/public/CNAME
git commit -m "Add custom domain"
git push
```

### 2. Configure DNS

Add DNS records at your domain provider:

```
Type: CNAME
Name: docs (or @)
Value: idlanyor.github.io
```

### 3. Update GitHub Settings

1. Go to Settings → Pages
2. Under **Custom domain**, enter: `docs.kachina-md.com`
3. Wait for DNS check
4. Enable **Enforce HTTPS**

### 4. Update Config

```javascript
// docs-site/.vitepress/config.js
export default defineConfig({
  base: '/', // Change from '/kachina-core/' to '/'
  // ...
})
```

## Monitoring

### Check Deployment Status

```bash
# View latest deployments
# Go to: https://github.com/idlanyor/kachina-core/deployments
```

### View Build Logs

1. Go to Actions tab
2. Click on a workflow run
3. Click on "build" or "deploy" step
4. View detailed logs

### Analytics (Optional)

Add Google Analytics:

```javascript
// docs-site/.vitepress/config.js
export default defineConfig({
  head: [
    // Google Analytics
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX' }],
    ['script', {}, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `]
  ]
})
```

## Best Practices

### 1. Test Before Push

Always test locally:
```bash
npm run docs:build && npm run docs:preview
```

### 2. Use Meaningful Commit Messages

```bash
# Good
git commit -m "docs: add deployment guide"
git commit -m "feat: add group management guide"
git commit -m "fix: correct code examples in stickers guide"

# Bad
git commit -m "update"
git commit -m "changes"
```

### 3. Check Links Before Deploy

```bash
# VitePress has built-in dead link checking
# It will warn during build if links are broken
npm run docs:build
```

### 4. Monitor Deployment

Always check that deployment succeeded:
- Green checkmark in Actions tab ✅
- Visit the live site
- Test navigation

### 5. Keep Documentation Updated

Update docs when:
- API changes
- New features added
- Bugs fixed
- User feedback received

## Rollback

If deployment breaks something:

### Quick Rollback

1. Go to Actions tab
2. Find last successful deployment
3. Click "Re-run jobs"

### Git Revert

```bash
# Find commit hash that broke things
git log --oneline

# Revert that commit
git revert <commit-hash>

# Push
git push origin main
```

## Summary

**Quick deployment checklist:**

- [ ] Test locally (`npm run docs:build`)
- [ ] Commit all changes
- [ ] Push to GitHub (`git push origin main`)
- [ ] Enable GitHub Pages (Source: GitHub Actions)
- [ ] Wait for workflow to complete
- [ ] Visit `https://idlanyor.github.io/kachina-core/`
- [ ] Verify everything works

**Your documentation URL:**
```
https://idlanyor.github.io/kachina-core/
```

## Need Help?

- 📖 [VitePress Deployment Docs](https://vitepress.dev/guide/deploy)
- 📖 [GitHub Pages Docs](https://docs.github.com/en/pages)
- 💬 [GitHub Discussions](https://github.com/idlanyor/kachina-core/discussions)

---

**Ready to deploy?** Just push to GitHub! 🚀
