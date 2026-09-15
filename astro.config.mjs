import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? 'http://localhost:4321';
const configuredBase = process.env.BASE_PATH ?? '/';
const base = configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  output: 'static',
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap({
    // Legacy redirects should remain reachable, but not appear as search results.
    filter: (page) => !/\/(?:forum\/2026(?:\/|$)|events\/spark-forum-2026(?:\/|$))/.test(new URL(page).pathname),
  })],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
