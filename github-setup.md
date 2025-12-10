# GitHub Setup Instructions

## After creating your repository on GitHub, run these commands:

Replace `YOUR_USERNAME` with your actual GitHub username.

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/threadlines.git

# Rename the default branch to main (GitHub's default)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Alternative: If you want to use SSH instead of HTTPS

```bash
# Add the remote repository (SSH)
git remote add origin git@github.com:YOUR_USERNAME/threadlines.git

# Push your code to GitHub
git push -u origin main
```

## After pushing, you can:

1. **Enable GitHub Pages** for free hosting:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / docs (or create a gh-pages branch)

2. **Set up automatic deployment** with GitHub Actions:
   - Create `.github/workflows/deploy.yml` for automatic builds

3. **Add collaborators** if working with a team

## Repository URL
Your repository will be available at:
`https://github.com/YOUR_USERNAME/threadlines`