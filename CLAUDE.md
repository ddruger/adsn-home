# ADSN home page (theadsn.com)

The public ADSN website. One static page, hosted free on **GitHub Pages** from this repo (public, `main` branch, root folder). Custom domain `theadsn.com` is set by the `CNAME` file and GoDaddy DNS.

Owner: Daniel Druger (co-host of ADSN with James Borow). **Daniel is not a developer.** Explain things in plain language with exact click-by-click steps, never assume he knows terminal commands, git, or web hosting, and ask before anything that costs money, deletes data, or changes the live site or DNS.

The page started as `home.html` in the private `adsn-auction-site` project (Vercel). That project still has the auction, which stays unpublished. This repo has no server code and no secrets.

## Files

| File | What it does |
|---|---|
| `index.html` | The whole site. Inline CSS and JS, no build step. Hero (two-line headline, Daniel's overview copy, newsletter form, and a "Watch airing on ADSN" player that autoplays the newest episode muted; the label above the title is just the show name), "Read and watched by people at" logo marquee, "The ADSN network" (Newsletter, ADSN Rundown, ADSN Originals, Social Media; "Never miss ADSN, four ways to follow along."), recent episodes (episodes 2–4, each plays in its own card, no dates), audience and guests, newsletter card, "Watch or listen anywhere" (YouTube, Spotify, Apple Podcasts tiles with logos), and "Sponsor ADSN" (pitch, Get in touch mailto with a prefilled subject and body, offers, past and current partners). Footer: © 2026 ADSN, social links, no email address. |
| `latest.json` | Newest 4 full-length YouTube episodes (Shorts skipped). Read by `index.html`; it falls back to a short list baked into the page if this can't load. |
| `scripts/update-latest.mjs` | Rebuilds `latest.json` from YouTube's public RSS feed for @theadsn (channel `UCzjdJt8Z0W657e_afeyxAxQ`). The feed often answers 404, so it retries 12 times and otherwise exits quietly, keeping the old file. |
| `.github/workflows/latest.yml` | Runs the script every hour and commits `latest.json` when it changes. Can be run by hand from the Actions tab. |
| `CNAME` | `theadsn.com`, for GitHub Pages. |
| `assets/` | ADSN logo, icons, `watchers/` (20 company wordmarks, one color) and `partners/` logos. |

## Facts and choices

- Newsletter forms: every `.nl-form` slot (hero and the newsletter card; the nav Subscribe and network card link to `#newsletter`) gets beehiiv's v3 loader script with `BEEHIIV_FORM_ID` (form `fd0a0f67-9558-4ea3-8ab6-b22f127ab1c7`, from Daniel). The loader draws a 47px "slim" email + Subscribe iframe a few seconds after load; its colors (blue button) are set in beehiiv, not here. Empty ID falls back to a Subscribe button. `attribution.js` is also in the head (Daniel added it).

- Contact: daniel@adsnventures.com. Instagram is @adsn.ig (Daniel confirmed; the old Netlify site linked @adsnonig).
- X and LinkedIn feed embeds were tried and dropped: X blocks embeds for signed-out visitors and LinkedIn has no official feed embed.
- The brief's "By the numbers" stats were removed at Daniel's request. The newsletter is described as 4,800+ / 4.8K subscribers.
- Brand look: light theme, off-white `#F5F5F2`, black top bar, red `#DC2626`, blue `#2563EB`, Inter Tight (headlines) + Inter (body). `?theme=dark` shows a dark version.
- Use `textContent` for anything from data files; no `innerHTML` with outside text.

## DNS (GoDaddy, theadsn.com)

The domain is in **James Borow's GoDaddy account**; Daniel reaches it through delegate access ("Daniel logged in as: James Borow"). Every DNS save asks for a texted code (phone ending 6941). The domain is verified for GitHub Pages on Daniel's account via TXT `_github-pages-challenge-ddruger` (keep it; it stops other GitHub accounts from claiming theadsn.com). Switched to GitHub on 2026-10-21.

- Website: `A @` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; `CNAME www` → `ddruger.github.io`.
- Email (ImprovMX): `MX` mx1.improvmx.com (10) and mx2.improvmx.com (20), plus the SPF/verification TXT records. Never touch these when changing the website.
- Before the move (Oct 21, 2026) the site was on Netlify: `A @` → 75.2.60.5, `CNAME www` → theadsn.netlify.app. Switching those two back restores the old site.

## Run it locally

Any static server works, e.g. `python3 -m http.server 3002` in this folder, then http://localhost:3002. `node scripts/update-latest.mjs` refreshes `latest.json` (Node 20+; Node 22 is in `~/.local/node`).
