# Release & Deployment Guide

## Automatic NPM Publishing

This project uses GitHub Actions to automatically build and publish to NPM when a new version tag is pushed.

## Setup NPM Token

1. **Generate NPM Token**
   - Login to [npmjs.com](https://www.npmjs.com/)
   - Go to: Account → Access Tokens
   - Click "Generate New Token"
   - Select "Automation" type
   - Copy the generated token

2. **Add Token to GitHub Secrets**
   - Go to your GitHub repository
   - Navigate to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your NPM token
   - Click "Add secret"

## Release Process

### 1. Update Version

```bash
# For patch version (1.0.0 -> 1.0.1)
npm version patch

# For minor version (1.0.0 -> 1.1.0)
npm version minor

# For major version (1.0.0 -> 2.0.0)
npm version major
```

This will automatically:
- Update version in package.json
- Create a git commit
- Create a git tag

### 2. Push Tag to GitHub

```bash
# Push commits and tags
git push && git push --tags
```

### 3. Automatic Build & Publish

The GitHub Action will automatically:
1. Checkout the code
2. Setup Node.js environment
3. Install dependencies
4. Run build script
5. Publish to NPM
6. Create GitHub Release

## Manual Publishing (if needed)

```bash
# Build the project
npm run build

# Publish to NPM
npm publish --access public
```

## Workflow Files

- `.github/workflows/npm-publish.yml` - Handles NPM publishing on version tags
- `.github/workflows/ci.yml` - Runs tests and builds on push/PR

## Version Tag Format

Tags should follow the format: `v*` (e.g., `v1.0.0`, `v1.2.3`)

The npm version command automatically creates tags in this format.

## Troubleshooting

### Publication Failed

1. Check NPM_TOKEN secret is correctly set
2. Verify you have publishing rights for `@roidev/kachina-md`
3. Check if version already exists on NPM

### Build Failed

1. Check build.js script is working locally
2. Review build logs in GitHub Actions
3. Ensure all dependencies are in package.json

## CI/CD Pipeline

Every push to `main` or `develop` branches will:
- Run build on Node.js 16, 18, and 20
- Execute tests
- Verify the package builds correctly
