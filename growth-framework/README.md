# The Growth Framework (thegrowthframework.live)

Static site for The Growth Framework, built to plain HTML and deployed on Vercel (project `growth-framework-blog`).

Every page has its own URL, which lets search engines index each article and gives each link its own share preview on WhatsApp, Facebook and LinkedIn:

| URL | Page |
| --- | --- |
| `/` | Home |
| `/mind`, `/body`, `/money` | Pillar pages |
| `/psx` | PSX Alpha |
| `/guides`, `/about` | Free guides, About |
| `/articles` | All articles, with a pillar filter |
| `/articles/<slug>` | One page per article |

Old links like `/#five-numbers-before-a-psx-stock` (from Instagram bios and earlier shares) redirect to the new pages, and they keep their `utm_` tags.

## Add or edit an article

1. Edit `src/posts.mjs`. Add the new article at the **top** of the list: `slug`, `pillar` (Mind, Body or Money), `date`, `read`, `title`, `lede`, `body`.
2. `node og.mjs` renders the share image (needs Playwright and Chromium).
3. `node build.mjs` writes the site to `dist/`, including `sitemap.xml`, `feed.xml` (RSS) and `robots.txt`.
4. Push to GitHub. Vercel builds every branch as a preview, and `main` goes live. For a manual deploy: `cd dist && vercel`.

## Files

- `src/posts.mjs`: article content
- `src/foundations.mjs`: the Mind, Body and Money foundations guides (also summarised on the home page)
- `src/styles.css`, `src/site.js`: design and browser behaviour (menu, theme, filter, Instagram embeds)
- `build.mjs`: page templates, SEO tags, sitemap and RSS
- `og.mjs`: share-image renderer, writes to `public/og/`
- `legacy/index.html`: the original single-page version, kept for reference
