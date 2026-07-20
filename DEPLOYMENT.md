# Deployment Guide — Volvera Agency Site (Hostinger via GitHub)

## Detected Framework

**Plain HTML / CSS / JavaScript (static site).**
No React, Vite, or Next.js. There is no build step and no server-side code —
the repository root *is* the production site.

## Hostinger Settings

| Setting | Value |
| --- | --- |
| Framework / type | Static website (plain HTML) |
| Node.js version | **Not required** (any default is fine; nothing runs on Node) |
| Install command | **None** (leave empty; `npm install` is harmless but unnecessary) |
| Build command | **None** (leave empty; `npm run build` only prints a notice) |
| Output / publish directory | **`/`** (repository root) |
| Start command | **Not required** (static hosting serves files directly) |
| Entry file | `index.html` |
| Environment variables | **None required** (see `.env.example`) |

## How to Deploy on Hostinger (shared/cloud hosting)

1. Push this repository to GitHub (see below).
2. In **Hostinger hPanel → Websites → your domain → Advanced → Git**,
   click **Create repository connection**:
   - Repository: your GitHub repo URL (e.g. `https://github.com/<you>/volvera-site.git`)
   - Branch: `main`
   - Install path: `public_html` (or the subfolder your domain serves from)
3. Click **Deploy**. Hostinger copies the repo contents into `public_html`.
4. (Optional) Enable **Auto-deploy** / add the shown webhook to the GitHub
   repo so every push to `main` redeploys automatically.
5. Visit your domain — the site should be live immediately. Enable the free
   SSL certificate in hPanel if not already active.

> If you ever use Hostinger's newer "Deploy from Git" website flow instead,
> the answers are the same: no build command, publish directory `/`.

## Project Structure

```
/
├── index.html        # the entire one-page site
├── styles.css        # all styling
├── script.js         # interactions (nav, folder gallery, timeline, reveals)
├── logo.png          # site logo + favicon
├── founder.jpg       # founder photo (optimized)
├── clients/          # client logo images (5 optimized PNGs)
├── templates/        # email design images for the folder gallery (7 JPGs)
├── package.json      # convenience scripts only (dev/start local server)
├── .gitignore
├── .env.example      # documents that no env vars are needed
└── DEPLOYMENT.md
```

## External Services (all public, client-side)

- **Google Fonts** — Open Sans, loaded from fonts.googleapis.com
- **Calendly** — inline booking widget (public URL, no API key)
- **YouTube** — embedded testimonial video (public embed)

All asset paths in the site are **relative**, so the site works at the domain
root or in any subdirectory without changes.

## Local Development

```bash
npm run dev    # serves the site at http://localhost:3000 (uses npx serve)
```

Or open `index.html` directly / use any static file server.
