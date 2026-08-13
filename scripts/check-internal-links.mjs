import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const root = resolve('dist');
const builtIndex = join(root, 'index.html');
const detectedBase = existsSync(builtIndex)
  ? readFileSync(builtIndex, 'utf8').match(/<html[^>]+data-base=["']([^"']+)["']/i)?.[1]
  : undefined;
const configuredBase = process.env.BASE_PATH ?? detectedBase ?? '/';
const base = configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`;
const htmlFiles = [];

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) htmlFiles.push(path);
  }
}

function targetExists(rawUrl, sourceFile) {
  const url = rawUrl.split('#')[0].split('?')[0];
  if (!url) return true;
  if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(url)) return true;

  let target;
  if (url.startsWith('/')) {
    if (base !== '/' && !url.startsWith(base)) return false;
    const withoutBase = base === '/' ? url.slice(1) : url.slice(base.length);
    target = join(root, withoutBase);
  } else {
    target = resolve(dirname(sourceFile), url);
  }

  if (existsSync(target) && !statSync(target).isDirectory()) return true;
  if (existsSync(join(target, 'index.html'))) return true;
  if (!target.endsWith('.html') && existsSync(`${target}.html`)) return true;
  return false;
}

if (!existsSync(root)) {
  console.error('dist does not exist. Run npm run build first.');
  process.exit(1);
}

walk(root);
const failures = [];
const attributePattern = /\b(?:href|src)=["']([^"']+)["']/g;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(attributePattern)) {
    if (!targetExists(match[1], file)) {
      failures.push(`${relative(root, file).split(sep).join('/')}: ${match[1]}`);
    }
  }
}

if (failures.length) {
  console.error(`Found ${failures.length} broken internal link(s):\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files: all internal href/src targets resolve.`);
