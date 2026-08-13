# Deployment guide

## One-time GitHub setup

1. On GitHub, create a new **public** repository named `spark-schmidt-ais-community-hub` under the intended long-term owner.
2. Do not initialize it with a README, license, or `.gitignore`; those files already exist locally.
3. From this local directory, initialize Git, make the first commit, add the GitHub remote, and push `main`.
4. On GitHub, open **Settings → Pages**.
5. Under **Build and deployment → Source**, select **GitHub Actions**.
6. Open the **Actions** tab and confirm that `Deploy SPARK Hub to GitHub Pages` succeeds.
7. The temporary address should be `https://OWNER.github.io/spark-schmidt-ais-community-hub/`.

GitHub may ask you to enable Actions for a new repository. No secret or deployment token is required for the included workflow.

## Local Git commands

Run only after creating the empty GitHub repository:

```bash
git init
git add .
git commit -m "Build initial SPARK Community Hub"
git branch -M main
git remote add origin https://github.com/OWNER/spark-schmidt-ais-community-hub.git
git push -u origin main
```

Replace `OWNER` with the chosen GitHub user or organization.

## Future Vercel migration

1. Import the same GitHub repository into Vercel.
2. Use the Astro preset or these settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set production environment variables:
   - `SITE_URL=https://YOUR-DOMAIN`
   - `BASE_PATH=/`
4. Attach the purchased custom domain.
5. Verify canonical URLs, sitemap links, search-result links, and the 404 page.
6. Decide whether to keep the GitHub Pages preview or disable its deployment to avoid duplicate search-engine copies.

A static Astro site does not need the Vercel adapter. Install one only if a future version adds server rendering or API routes.
