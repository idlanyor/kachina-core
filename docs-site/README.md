# Kachina-MD Documentation

This directory contains the VitePress documentation for Kachina-MD.

## Development

```bash
# Install dependencies (from root)
npm install

# Start dev server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Structure

```
docs-site/
├── .vitepress/
│   ├── config.js          # VitePress configuration
│   └── theme/
│       ├── index.js       # Custom theme
│       └── custom.css     # Custom styles
├── guide/                 # User guides
│   ├── authentication/    # Auth guides
│   ├── core/             # Core concepts
│   ├── features/         # Feature guides
│   └── deployment/       # Deployment guides
├── api/                  # API reference
├── examples/             # Code examples
├── public/               # Static assets
└── index.md              # Homepage
```

## Adding New Pages

1. Create a markdown file in the appropriate directory
2. Update `.vitepress/config.js` sidebar configuration
3. Add links from other pages as needed

## Deployment

Documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

## Local Preview

The docs run on http://localhost:5173 by default when using `npm run docs:dev`.
