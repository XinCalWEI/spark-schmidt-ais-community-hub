# SPARK Community Hub

Initial public website for the SPARK Forum and the longer-term AI in Science community resource hub.

The site is deliberately static-first:

- Astro generates fast, accessible HTML.
- Markdown content collections hold resources, events, opportunities, stories, and program sessions.
- Pagefind adds full-text search without a search server.
- GitHub Actions deploys the site to GitHub Pages.
- Sensitive applications, mentoring, travel, dietary, and accessibility data remain outside the public repository.

## Local development

Requirements: Node.js 22.12 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

Run the complete validation and production build:

```bash
npm run qa
```

Search is generated only during a production build. To test it locally:

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

The workflow supports a project URL such as:

```text
https://xincalwei.github.io/spark-schmidt-ais-community-hub/
```

Internal links use `import.meta.env.BASE_URL`, so the repository subpath is preserved. After moving to a Vercel custom domain, set `BASE_PATH=/`; no page rewrite is needed.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the GitHub website steps.

## Updating facts and content

- Confirmed forum status, date, venue, application state, and contact information: `src/data/site.ts`
- Resources: `src/content/resources/`
- Opportunities: `src/content/opportunities/`
- Events: `src/content/events/`
- Fellows and alumni profiles: `src/content/fellows/`
- Stories: `src/content/stories/`
- Program preview: `src/content/sessions/`

See [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md) before publishing.

## Important publication rule

Do not publish draft dates, venues, potential speakers, prospective partners, private attendee information, or unapproved logos as confirmed facts. Every external opportunity must include an official source and a recently checked `verifiedAt` date.
