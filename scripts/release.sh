#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  Kachina-MD Release Script${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}Error: Working directory is not clean${NC}"
    echo "Please commit or stash your changes first"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${YELLOW}${CURRENT_BRANCH}${NC}"

if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo -e "${YELLOW}Warning: You are not on main branch${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${YELLOW}v${CURRENT_VERSION}${NC}"
echo ""

# Ask for version bump type
echo "Select version bump type:"
echo "1) Patch (bug fixes)       - v1.0.0 -> v1.0.1"
echo "2) Minor (new features)    - v1.0.0 -> v1.1.0"
echo "3) Major (breaking changes)- v1.0.0 -> v2.0.0"
echo "4) Custom version"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
        VERSION_TYPE=$CUSTOM_VERSION
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Run build to make sure everything works
echo ""
echo -e "${YELLOW}Running build...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Please fix errors before releasing.${NC}"
    exit 1
fi

# Bump version
echo ""
echo -e "${YELLOW}Bumping version...${NC}"
if [[ $choice -eq 4 ]]; then
    npm version $CUSTOM_VERSION -m "Release v%s"
else
    npm version $VERSION_TYPE -m "Release v%s"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Version bump failed!${NC}"
    exit 1
fi

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}Version bumped to v${NEW_VERSION}${NC}"

# Confirm before pushing
echo ""
echo -e "${YELLOW}Ready to push v${NEW_VERSION} to GitHub${NC}"
echo "This will trigger automatic build and publish to NPM"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Release cancelled${NC}"
    echo "To undo version bump: git tag -d v${NEW_VERSION} && git reset --hard HEAD~1"
    exit 1
fi

# Push to GitHub
echo ""
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push && git push --tags

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}==================================${NC}"
    echo -e "${GREEN}  Release v${NEW_VERSION} Pushed!${NC}"
    echo -e "${GREEN}==================================${NC}"
    echo ""
    echo "GitHub Actions will now:"
    echo "  1. Build the project"
    echo "  2. Publish to NPM"
    echo "  3. Create GitHub Release"
    echo ""
    echo "Check progress at:"
    echo "https://github.com/idlanyor/kachina-core/actions"
else
    echo -e "${RED}Push failed!${NC}"
    exit 1
fi
