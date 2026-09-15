import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const baseUrl = (process.env.QA_URL ?? 'http://127.0.0.1:4321/spark-schmidt-ais-community-hub/').replace(/\/?$/, '/');
const expectedBasePath = new URL(baseUrl).pathname;
const aboutUrl = new URL('about/', baseUrl).href;
const forumPages = [
  ['forum/', 'Overview'],
  ['forum/program/', 'Program'],
  ['forum/speakers/', 'Speakers'],
  ['forum/projects/', 'Projects'],
  ['forum/participate/', 'Participate'],
  ['forum/travel-accessibility/', 'Travel & access'],
  ['forum/faq/', 'FAQ'],
];
const browserCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = browserCandidates.find(existsSync);

if (!executablePath) {
  throw new Error('No Chrome or Chromium executable found. Set CHROME_PATH and retry.');
}

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const browserErrors = [];

page.on('console', (message) => {
  if (message.type() !== 'error') return;
  const sourceUrl = message.location().url;
  // Chrome may request the host's default icon during a static redirect. On
  // project Pages that URL belongs to the host site, outside this project.
  // Check the project's explicitly declared favicon below instead.
  if (expectedBasePath !== '/' && sourceUrl === new URL('/favicon.ico', baseUrl).href && /status of 404/.test(message.text())) return;
  browserErrors.push(`console: ${message.text()} (${sourceUrl})`);
});
page.on('pageerror', (error) => browserErrors.push(`page: ${error.message}`));
page.on('requestfailed', (request) => {
  browserErrors.push(`request: ${request.url()} (${request.failure()?.errorText ?? 'failed'})`);
});

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForURL(aboutUrl);
  await page.locator('h1').waitFor();
  assert.match(await page.locator('h1').innerText(), /move AI research beyond the paper/i);
  assert.equal(page.url(), aboutUrl, 'The site root should redirect to About SPARK.');
  const faviconHref = await page.locator('link[rel="icon"]').getAttribute('href');
  assert.equal(faviconHref, `${expectedBasePath}favicon.svg`, 'The site icon should retain the project base path.');
  assert.ok((await page.request.get(new URL(faviconHref, baseUrl).href)).ok(), 'The declared site icon should load successfully.');
  assert.equal(await page.locator('.brand-header').getAttribute('href'), `${expectedBasePath}about/`, 'The header logo should link directly to About.');
  assert.equal(await page.locator('.brand-header').getAttribute('aria-label'), 'About SPARK');
  assert.deepEqual(
    await page.locator('.funding-conveners .convener-name').allInnerTexts(),
    ['Xin Wei', 'Shanshan Liu', 'Paige Bowling', 'Christin Salley', 'Nathan Fox', 'Eliot Miller'],
    'The funding card should name all six conveners from the organizing-team data.',
  );
  const mobileConvenerLink = page.locator('.hero-convener-link');
  assert.equal(await mobileConvenerLink.getAttribute('href'), '#people-behind-spark');
  assert.equal(await page.locator('#people-behind-spark').count(), 1, 'The people section should expose one stable fragment target.');
  if (process.env.QA_ABOUT_HERO_MOBILE_SCREENSHOT) {
    await page.locator('.page-hero').screenshot({ path: process.env.QA_ABOUT_HERO_MOBILE_SCREENSHOT });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mobileConvenerLink.click();
  assert.equal(new URL(page.url()).hash, '#people-behind-spark', 'The convener CTA should update the URL fragment.');
  const mobileAnchorPosition = await page.evaluate(() => {
    const target = document.querySelector('#people-behind-spark')?.getBoundingClientRect();
    const header = document.querySelector('.site-header')?.getBoundingClientRect();
    return target && header ? { targetTop: target.top, headerBottom: header.bottom } : null;
  });
  assert.ok(mobileAnchorPosition && mobileAnchorPosition.targetTop >= mobileAnchorPosition.headerBottom - 1, `The people heading should not be hidden by the mobile sticky header: ${JSON.stringify(mobileAnchorPosition)}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  assert.equal(await page.locator('.forum-feature-journey li').count(), 5, 'About should show the five core program days.');
  assert.equal(await page.locator('.forum-arrival').count(), 1, 'Check-in day should be shown as a prelude, not a sixth program day.');
  assert.deepEqual(
    await page.locator('.forum-feature-journey li').allInnerTexts(),
    ['01\nDAY 1\nFrame real-world impact', '02\nDAY 2\nExplore emerging methods', '03\nDAY 3\nBuild practical skills', '04\nDAY 4\nPrototype together', '05\nDAY 5\nShare & continue'],
  );
  assert.doesNotMatch(await page.locator('.forum-feature-panel').innerText(), /six days|day 0/i, 'About should not frame check-in day as a sixth program day.');
  if (process.env.QA_ABOUT_FORUM_MOBILE_SCREENSHOT) {
    const screenshotStyle = await page.addStyleTag({ content: '.site-header { position: static !important; }' });
    await page.locator('.forum-feature-panel').screenshot({ path: process.env.QA_ABOUT_FORUM_MOBILE_SCREENSHOT });
    await screenshotStyle.evaluate((style) => style.remove());
  }
  if (process.env.QA_SCREENSHOT) {
    await page.screenshot({ path: process.env.QA_SCREENSHOT, fullPage: false });
  }

  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  assert.ok(
    overflow.documentWidth <= overflow.viewportWidth + 1,
    `About landing page overflows horizontally at 390px: ${JSON.stringify(overflow)}`,
  );

  const menuButton = page.locator('[data-menu-button]');
  const mobileNav = page.locator('[data-mobile-nav]');
  await menuButton.click();
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'true');
  assert.ok(await mobileNav.isVisible(), 'Mobile navigation should be visible after opening.');
  assert.ok(await mobileNav.getByRole('link', { name: 'Schmidt AI in Science Fellows' }).isVisible(), 'The Fellows link should be available in the menu.');
  const mobileForumLink = mobileNav.getByRole('link', { name: 'Forum', exact: true });
  assert.ok(await mobileForumLink.isVisible(), 'Mobile navigation should label the Forum without a year.');
  assert.equal(await mobileForumLink.getAttribute('href'), `${expectedBasePath}forum/`);
  assert.equal(await mobileForumLink.getAttribute('aria-current'), null, 'Forum should not be marked current on About.');
  await page.keyboard.press('Escape');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
  assert.ok(await menuButton.evaluate((element) => element === document.activeElement), 'Focus should return to the menu button.');

  for (const path of ['fellows/', 'forum/']) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
    await page.locator('h1').waitFor();
    const pageOverflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    assert.ok(pageOverflow.documentWidth <= pageOverflow.viewportWidth + 1, `${path} overflows at 390px: ${JSON.stringify(pageOverflow)}`);
  }
  await page.locator('.brand-header').click();
  await page.waitForURL(aboutUrl);
  assert.match(await page.locator('h1').innerText(), /move AI research beyond the paper/i, 'Clicking the header logo should open About SPARK.');
  await page.goto(`${baseUrl}forum/faq/`, { waitUntil: 'networkidle' });
  await menuButton.click();
  assert.ok(await mobileForumLink.isVisible(), 'The yearless Forum navigation item should remain visible on Forum subpages.');
  assert.equal(await mobileForumLink.getAttribute('aria-current'), 'page', 'Forum should be active in mobile navigation on its subpages.');
  assert.equal(await mobileNav.locator('[aria-current="page"]').count(), 1, 'Mobile navigation should have exactly one current item.');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const mobileForumTabVisibility = await page.locator('.forum-subnav [aria-current="page"]').evaluate((element) => {
    const tab = element.getBoundingClientRect();
    const scroller = element.closest('[data-forum-subnav-scroll]')?.getBoundingClientRect();
    return scroller ? tab.left >= scroller.left - 1 && tab.right <= scroller.right + 1 : false;
  });
  assert.ok(mobileForumTabVisibility, 'The current Forum tab should scroll into view on mobile.');

  await page.goto(`${baseUrl}forum/program/`, { waitUntil: 'networkidle' });
  const mobileDayButtons = page.locator('[data-program-dialog-open]');
  assert.equal(await mobileDayButtons.count(), 6, 'The Program should expose one details button for check-in day and each of Days 1 through 5.');
  const controlledDialogs = await mobileDayButtons.evaluateAll((buttons) => buttons.map((button) => ({
    id: button.getAttribute('aria-controls'),
    exists: Boolean(document.getElementById(button.getAttribute('aria-controls') ?? '')),
  })));
  assert.equal(new Set(controlledDialogs.map(({ id }) => id)).size, 6, 'Each day details button should control a unique dialog.');
  assert.ok(controlledDialogs.every(({ exists }) => exists), 'Every day details button should reference an existing dialog.');

  const dayZeroButton = mobileDayButtons.first();
  await dayZeroButton.click();
  const dayZeroDialog = page.locator('#program-day-day-0-arrivals');
  assert.ok(await dayZeroDialog.evaluate((dialog) => dialog instanceof HTMLDialogElement && dialog.open), 'The check-in day dialog should open.');
  assert.ok(await dayZeroDialog.locator('[data-dialog-title]').evaluate((title) => title === document.activeElement), 'Focus should move to the dialog heading.');
  assert.match(await dayZeroDialog.innerText(), /Check-in time to be confirmed/);
  assert.doesNotMatch(await dayZeroDialog.innerText(), /reception|6:00 PM–8:00 PM/i);
  const mobileDialogBounds = await dayZeroDialog.boundingBox();
  assert.ok(mobileDialogBounds && mobileDialogBounds.x >= 0 && mobileDialogBounds.x + mobileDialogBounds.width <= 391, `Program dialog should fit the 390px viewport: ${JSON.stringify(mobileDialogBounds)}`);
  await page.keyboard.press('Escape');
  assert.ok(await dayZeroButton.evaluate((button) => button === document.activeElement), 'Esc should close the dialog and return focus to its button.');

  const dayFourButton = mobileDayButtons.nth(4);
  await dayFourButton.click();
  const dayFourDialog = page.locator('#program-day-day-4-projects');
  assert.match(await dayFourDialog.innerText(), /minimum viable deliverable/i);
  assert.match(await dayFourDialog.innerText(), /city-service chatbots/i);
  assert.ok(await dayFourDialog.locator('.program-dialog-body').evaluate((body) => body.scrollHeight > body.clientHeight), 'A long day should scroll inside the dialog.');
  if (process.env.QA_PROGRAM_MOBILE_DIALOG_SCREENSHOT) {
    await page.screenshot({ path: process.env.QA_PROGRAM_MOBILE_DIALOG_SCREENSHOT, fullPage: false });
  }
  await page.keyboard.press('Escape');
  const programOverflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  assert.ok(programOverflow.documentWidth <= programOverflow.viewportWidth + 1, `Program page overflows at 390px: ${JSON.stringify(programOverflow)}`);

  await page.goto(`${baseUrl}resources/`, { waitUntil: 'networkidle' });
  await page.locator('[data-filter-search]').fill('Docker');
  await page.waitForFunction(() => document.querySelector('[data-result-count]')?.textContent === '1');
  assert.equal(await page.locator('[data-filter-card]:visible').count(), 1);
  assert.match(await page.locator('[data-filter-card]:visible').innerText(), /Docker/i);

  await page.goto(`${baseUrl}search/?q=Docker`, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => !document.querySelector('[data-search-status]')?.textContent?.includes('Searching'),
    undefined,
    { timeout: 10_000 },
  );
  const searchStatus = await page.locator('[data-search-status]').innerText();
  assert.match(searchStatus, /\d+ results? for/i);
  assert.ok(await page.locator('[data-search-results] a').count(), 'Pagefind should return at least one result.');
  assert.ok(
    (await page.locator('[data-search-results] a').first().getAttribute('href'))?.startsWith(expectedBasePath),
    `Search results should retain the configured base path (${expectedBasePath}).`,
  );

  await page.goto(`${baseUrl}search/?q=SPARK`, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => /^\d+ results? for/.test(document.querySelector('[data-search-status]')?.textContent ?? ''),
    undefined,
    { timeout: 10_000 },
  );
  const sparkSearchResults = await page.locator('[data-search-results] h2 a').evaluateAll((links) => links.map((link) => ({
    title: link.textContent ?? '',
    url: link.href,
  })));
  assert.ok(sparkSearchResults.length > 0, 'Pagefind should return results for SPARK.');
  for (const result of sparkSearchResults) {
    assert.doesNotMatch(result.title, /(?:SPARK\s+)?Forum\s+2026/i, `Search should not show an outdated Forum title: ${result.title}`);
    const resultPath = new URL(result.url).pathname;
    assert.ok(resultPath.startsWith(expectedBasePath), `SPARK search results should retain the base path: ${result.url}`);
    assert.doesNotMatch(resultPath, /\/forum\/2026(?:\/|$)|\/events\/spark-forum-2026(?:\/|$)/, `Search should use canonical yearless Forum routes: ${result.url}`);
  }

  await page.goto(`${baseUrl}opportunities/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-filter-card]').count(), 1, 'The opportunity board should include the Round 4 example.');
  assert.match(await page.locator('[data-filter-card]').innerText(), /Community Initiatives Fund/i);
  assert.match(await page.locator('[data-filter-card]').innerText(), /Aug 28, 2026, 11:59 PM Eastern Time/i);
  await page.locator('[data-filter-card] h3 a').click();
  await page.locator('h1').waitFor();
  assert.match(await page.locator('h1').innerText(), /Round 4/i);
  assert.match(await page.locator('main').innerText(), /Application link pending/i);
  assert.match(await page.locator('main').innerText(), /up to US \$100,000/i);
  assert.match(await page.locator('main').innerText(), /Q&A sessions were listed/i);
  assert.doesNotMatch(await page.locator('main').innerText(), /478 388 2171|passcode/i, 'Past meeting credentials should not be published.');
  const opportunityOverflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  assert.ok(opportunityOverflow.documentWidth <= opportunityOverflow.viewportWidth + 1, `Opportunity detail overflows at 390px: ${JSON.stringify(opportunityOverflow)}`);
  if (process.env.QA_OPPORTUNITY_MOBILE_SCREENSHOT) {
    await page.screenshot({ path: process.env.QA_OPPORTUNITY_MOBILE_SCREENSHOT, fullPage: false });
  }

  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await desktopPage.waitForURL(aboutUrl);
  assert.ok(await desktopPage.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Schmidt AI in Science Fellows' }).isVisible(), 'The Fellows navigation item should be visible at desktop width.');
  const headerMark = desktopPage.locator('.brand-header-mark');
  const headerMarkBox = await headerMark.boundingBox();
  assert.ok(headerMarkBox, 'The animated header mark should be visible.');
  assert.ok(Math.abs(headerMarkBox.width / headerMarkBox.height - 1066 / 624) < .02, 'The animated header mark should retain the source logo ratio.');
  const bulbMotion = await desktopPage.locator('.brand-header-bulb').evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationName: style.animationName, animationDuration: style.animationDuration };
  });
  assert.match(bulbMotion.animationName, /brand-bulb-breathe/);
  assert.equal(bulbMotion.animationDuration, '4.6s');
  await desktopPage.emulateMedia({ reducedMotion: 'reduce' });
  const reducedBulbMotion = await desktopPage.locator('.brand-header-bulb').evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationName: style.animationName, opacity: style.opacity };
  });
  assert.equal(reducedBulbMotion.animationName, 'none', 'Logo motion should stop when reduced motion is requested.');
  assert.equal(reducedBulbMotion.opacity, '0', 'Only the original static logo should remain in reduced-motion mode.');
  await desktopPage.emulateMedia({ reducedMotion: 'no-preference' });
  if (process.env.QA_HEADER_LOGO_SCREENSHOT) {
    await desktopPage.waitForTimeout(2300);
    await desktopPage.locator('.site-header').screenshot({ path: process.env.QA_HEADER_LOGO_SCREENSHOT });
  }
  const desktopOverflow = await desktopPage.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  assert.ok(desktopOverflow.documentWidth <= desktopOverflow.viewportWidth + 1, `Desktop page overflows: ${JSON.stringify(desktopOverflow)}`);
  if (process.env.QA_DESKTOP_SCREENSHOT) {
    await desktopPage.screenshot({ path: process.env.QA_DESKTOP_SCREENSHOT, fullPage: false });
  }
  await desktopPage.goto(`${baseUrl}about/`, { waitUntil: 'networkidle' });
  const aboutText = await desktopPage.locator('body').innerText();
  assert.match(await desktopPage.locator('h1').innerText(), /move AI research beyond the paper/i);
  assert.match(aboutText, /Fellow-led forum and community hub/i);
  assert.match(aboutText, /Schmidt Sciences AI in Science Fellowship Community Initiatives Fund/);
  assert.doesNotMatch(aboutText, /this funding relationship does not make this an official Schmidt Sciences website/i);
  assert.ok(await desktopPage.locator('.hero-funding-card').isVisible(), 'The funding acknowledgement should be visible in the About hero.');
  const heroFundingLogoLink = desktopPage.locator('.funding-logo a');
  assert.equal(await heroFundingLogoLink.getAttribute('href'), 'https://www.schmidtsciences.org/');
  assert.equal(await heroFundingLogoLink.getAttribute('target'), '_blank');
  assert.equal(await heroFundingLogoLink.getAttribute('aria-label'), 'Visit the Schmidt Sciences website (opens in a new tab)');
  assert.ok(await heroFundingLogoLink.locator('img').evaluate((image) => image.complete && image.naturalWidth > 0), 'The linked Schmidt Sciences hero logo should load.');
  assert.deepEqual(
    await desktopPage.locator('.funding-conveners .convener-name').allInnerTexts(),
    ['Xin Wei', 'Shanshan Liu', 'Paige Bowling', 'Christin Salley', 'Nathan Fox', 'Eliot Miller'],
  );
  assert.equal(await desktopPage.locator('.hero-convener-link').getAttribute('href'), '#people-behind-spark');
  assert.ok(await desktopPage.getByRole('link', { name: 'Explore the Forum' }).isVisible(), 'The About page should link to the Forum overview.');
  assert.ok(await desktopPage.getByRole('link', { name: 'Preview the program' }).isVisible(), 'The About page should link to the Forum program.');
  assert.equal(await desktopPage.locator('.forum-feature-journey li').count(), 5);
  assert.equal(await desktopPage.locator('.forum-arrival').count(), 1);
  assert.equal(await desktopPage.locator('#forum-feature-title').count(), 1, 'About should contain one Forum feature title.');
  assert.equal(await desktopPage.locator('.brand-footer').getAttribute('href'), `${expectedBasePath}about/`, 'The footer brand should link directly to About.');
  const specialThanks = desktopPage.locator('.special-thanks');
  assert.equal(await specialThanks.getByRole('link', { name: 'Visit the Schmidt Sciences website (opens in a new tab)' }).count(), 1);
  assert.equal(await specialThanks.getByRole('link', { name: 'Visit the Michigan Institute for Data & AI in Society website (opens in a new tab)' }).count(), 1);
  assert.equal(await specialThanks.locator('.special-thanks-groups > section').count(), 2, 'Special thanks should distinguish Schmidt Sciences and MIDAS support.');
  assert.equal(await specialThanks.locator('li').count(), 9, 'Special thanks should include all nine named colleagues.');
  assert.match(await specialThanks.innerText(), /This work would not be possible without their support/i);
  assert.equal(await specialThanks.locator('li a').count(), 9, 'All nine thanked colleagues should link to their official profiles.');
  assert.deepEqual(
    await specialThanks.locator('.special-thanks-logo').evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ['https://www.schmidtsciences.org/', 'https://midas.umich.edu/'],
    'Each Special thanks logo should link to its organization website.',
  );
  assert.ok(await specialThanks.locator('.special-thanks-logo').evaluateAll((links) => links.every((link) => link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer'))), 'Organization logo links should open safely in a new tab.');
  for (const logo of await specialThanks.locator('.special-thanks-logo img').all()) {
    await logo.scrollIntoViewIfNeeded();
    await logo.evaluate((image) => image.complete && image.naturalWidth > 0 || new Promise((resolve) => image.addEventListener('load', () => resolve(true), { once: true })));
  }
  assert.ok(await specialThanks.locator('.special-thanks-logo img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), 'Both Special thanks logos should load.');
  assert.equal(await specialThanks.locator('a[href^="https://www.schmidtsciences.org/person/"]').count(), 4, 'All four Schmidt Sciences colleagues should link to official profiles.');
  assert.equal(await specialThanks.locator('a[href^="https://midas.umich.edu/directory/"]').count(), 5, 'All five MIDAS colleagues should link to official profiles.');
  assert.ok(await specialThanks.locator('a').evaluateAll((links) => links.every((link) => link.target === '_blank' && link.rel.includes('noopener') && link.rel.includes('noreferrer'))), 'External profile links should open safely in a new tab.');
  if (process.env.QA_SPECIAL_THANKS_SCREENSHOT) {
    await specialThanks.screenshot({ path: process.env.QA_SPECIAL_THANKS_SCREENSHOT });
  }
  assert.equal(await desktopPage.locator('.about-team-grid article').count(), 6);
  assert.equal(await desktopPage.locator('.about-team-grid img').count(), 6);
  assert.ok(await desktopPage.locator('.funding-logo img').evaluate((image) => image.complete && image.naturalWidth > 0), 'The Schmidt Sciences logo should load.');
  if (process.env.QA_ABOUT_TOP_SCREENSHOT) {
    await desktopPage.screenshot({ path: process.env.QA_ABOUT_TOP_SCREENSHOT, fullPage: false });
  }
  if (process.env.QA_ABOUT_HERO_DESKTOP_SCREENSHOT) {
    await desktopPage.locator('.page-hero').screenshot({ path: process.env.QA_ABOUT_HERO_DESKTOP_SCREENSHOT });
  }
  if (process.env.QA_ABOUT_FORUM_SCREENSHOT) {
    const screenshotStyle = await desktopPage.addStyleTag({ content: '.site-header { position: static !important; }' });
    await desktopPage.locator('.forum-feature-panel').screenshot({ path: process.env.QA_ABOUT_FORUM_SCREENSHOT });
    await screenshotStyle.evaluate((style) => style.remove());
  }
  const tabletPage = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  await tabletPage.goto(`${baseUrl}about/`, { waitUntil: 'networkidle' });
  const tabletOverflow = await tabletPage.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  assert.ok(tabletOverflow.documentWidth <= tabletOverflow.viewportWidth + 1, `About page overflows at 900px: ${JSON.stringify(tabletOverflow)}`);
  assert.equal(await tabletPage.locator('.forum-feature-journey li').count(), 5, 'The tablet layout should preserve the five core program days.');
  assert.equal(await tabletPage.locator('.forum-arrival').count(), 1, 'The tablet layout should keep check-in day visually separate.');
  const tabletHeroCard = await tabletPage.locator('.hero-funding-card').boundingBox();
  assert.ok(tabletHeroCard && tabletHeroCard.x >= 0 && tabletHeroCard.x + tabletHeroCard.width <= 901, `The About funding card should fit the 900px viewport: ${JSON.stringify(tabletHeroCard)}`);
  if (process.env.QA_ABOUT_HERO_TABLET_SCREENSHOT) {
    await tabletPage.locator('.page-hero').screenshot({ path: process.env.QA_ABOUT_HERO_TABLET_SCREENSHOT });
  }
  if (process.env.QA_ABOUT_FORUM_TABLET_SCREENSHOT) {
    const screenshotStyle = await tabletPage.addStyleTag({ content: '.site-header { position: static !important; }' });
    await tabletPage.locator('.forum-feature-panel').screenshot({ path: process.env.QA_ABOUT_FORUM_TABLET_SCREENSHOT });
    await screenshotStyle.evaluate((style) => style.remove());
  }
  await tabletPage.close();
  for (const portrait of await desktopPage.locator('.about-team-grid img').all()) {
    await portrait.scrollIntoViewIfNeeded();
    await portrait.evaluate((image) => image.complete && image.naturalWidth > 0 || new Promise((resolve) => image.addEventListener('load', () => resolve(true), { once: true })));
  }
  assert.ok(await desktopPage.locator('.about-team-grid img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), 'All six organizer portraits should load.');
  assert.ok(await desktopPage.locator('.about-team-grid img').evaluateAll((images) => images.every((image) => {
    const bounds = image.getBoundingClientRect();
    return Math.abs(bounds.width - bounds.height) < 1 && image.naturalWidth === image.naturalHeight;
  })), 'All organizer portraits should be generated and rendered at a 1:1 ratio.');
  if (process.env.QA_TEAM_SCREENSHOT) {
    await desktopPage.locator('.about-team-grid').screenshot({ path: process.env.QA_TEAM_SCREENSHOT });
  }
  if (process.env.QA_ABOUT_SCREENSHOT) {
    await desktopPage.screenshot({ path: process.env.QA_ABOUT_SCREENSHOT, fullPage: true });
  }
  await desktopPage.goto(`${baseUrl}opportunities/`, { waitUntil: 'networkidle' });
  if (process.env.QA_OPPORTUNITIES_SCREENSHOT) {
    await desktopPage.screenshot({ path: process.env.QA_OPPORTUNITIES_SCREENSHOT, fullPage: false });
  }
  await desktopPage.goto(`${baseUrl}opportunities/community-initiatives-fund-round-4/`, { waitUntil: 'networkidle' });
  if (process.env.QA_OPPORTUNITY_SCREENSHOT) {
    await desktopPage.screenshot({ path: process.env.QA_OPPORTUNITY_SCREENSHOT, fullPage: true });
  }
  await desktopPage.goto(`${baseUrl}fellows/`, { waitUntil: 'networkidle' });
  assert.match(await desktopPage.locator('h1').innerText(), /Schmidt AI in Science Fellows/);
  for (const [path, label] of forumPages) {
    await desktopPage.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
    const primaryNavigation = desktopPage.getByRole('navigation', { name: 'Primary navigation' });
    const desktopForumLink = primaryNavigation.getByRole('link', { name: 'Forum', exact: true });
    assert.ok(await desktopForumLink.isVisible(), 'Desktop navigation should label the Forum without a year.');
    assert.equal(await desktopForumLink.getAttribute('href'), `${expectedBasePath}forum/`);
    assert.equal(await desktopForumLink.getAttribute('aria-current'), 'page', `${path} should keep Forum active in desktop navigation.`);
    assert.equal(await primaryNavigation.locator('[aria-current="page"]').count(), 1, 'Desktop navigation should have exactly one current item.');
    assert.doesNotMatch(await desktopPage.title(), /(?:SPARK\s+)?Forum\s+2026/i, `${path} should have a yearless page title.`);
    assert.doesNotMatch(await desktopPage.locator('main').innerText(), /(?:SPARK\s+)?Forum\s+2026/i, `${path} should not use the outdated Forum name.`);
    const currentSubpage = desktopPage.locator('.forum-subnav [aria-current="page"]');
    assert.equal(await currentSubpage.count(), 1, `${path} should have exactly one current Forum tab.`);
    assert.equal((await currentSubpage.innerText()).trim(), label);
    const currentStyle = await currentSubpage.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, color: style.color, fontSize: parseFloat(style.fontSize) };
    });
    assert.notEqual(currentStyle.backgroundColor, 'rgba(0, 0, 0, 0)', `${label} needs a filled current state.`);
    assert.ok(currentStyle.fontSize >= 14, `${label} subnavigation text should be at least 14px.`);
    if (path === 'forum/program/' && process.env.QA_FORUM_SCREENSHOT) {
      await desktopPage.screenshot({ path: process.env.QA_FORUM_SCREENSHOT, fullPage: false });
    }
  }
  await desktopPage.goto(`${baseUrl}forum/program/`, { waitUntil: 'networkidle' });
  const desktopDayZeroButton = desktopPage.locator('[data-program-dialog-open]').first();
  await desktopDayZeroButton.click();
  const desktopDayZeroDialog = desktopPage.locator('#program-day-day-0-arrivals');
  await desktopDayZeroDialog.getByRole('button', { name: 'Close Check-in day details' }).click();
  assert.ok(await desktopDayZeroButton.evaluate((button) => button === document.activeElement), 'The close button should return focus to the day details button.');
  await desktopDayZeroButton.click();
  if (process.env.QA_PROGRAM_DIALOG_SCREENSHOT) {
    await desktopPage.screenshot({ path: process.env.QA_PROGRAM_DIALOG_SCREENSHOT, fullPage: false });
  }
  await desktopPage.mouse.click(3, 3);
  assert.ok(await desktopDayZeroDialog.evaluate((dialog) => !dialog.open), 'Clicking the dialog backdrop should close it.');
  assert.ok(await desktopDayZeroButton.evaluate((button) => button === document.activeElement), 'Backdrop close should return focus to the day details button.');
  await desktopPage.goto(`${baseUrl}forum/`, { waitUntil: 'networkidle' });
  const forumFactsText = await desktopPage.locator('.forum-fact-card').innerText();
  assert.match(forumFactsText, /Ann Arbor, Michigan/);
  assert.match(forumFactsText, /March 7–12, 2027 \(tentative\)/);
  assert.match(forumFactsText, /March 7: participant check-in only\. March 8–12: main program\./);
  assert.match(forumFactsText, /Not yet open — stay tuned\./);
  assert.doesNotMatch(forumFactsText, /To be confirmed/i);
  assert.equal(await desktopPage.getByRole('heading', { name: 'Four connected layers—from shared understanding to practical action.' }).count(), 1, 'Forum Overview should contain one canonical Program model.');
  assert.equal(await desktopPage.locator('.forum-layer-list article').count(), 4, 'The Program model should contain four layers.');
  assert.equal(await desktopPage.locator('.translation-priorities li').count(), 4, 'The Forum should retain the four research-translation priorities from the former landing page.');
  assert.match(await desktopPage.locator('.outcomes-grid').innerText(), /SPARK Community Hub/);
  if (process.env.QA_FORUM_OVERVIEW_SCREENSHOT) {
    await desktopPage.screenshot({ path: process.env.QA_FORUM_OVERVIEW_SCREENSHOT, fullPage: true });
  }
  await desktopPage.goto(`${baseUrl}events/`, { waitUntil: 'networkidle' });
  assert.match(await desktopPage.locator('[data-filter-card]').innerText(), /March 7–12, 2027 \(tentative\)/);
  for (const [path, label] of forumPages) {
    const legacyPath = path.replace(/^forum\//, 'forum/2026/');
    const destination = new URL(path, baseUrl).href;
    await desktopPage.goto(new URL(legacyPath, baseUrl).href, { waitUntil: 'networkidle' });
    await desktopPage.waitForURL(destination);
    assert.equal(desktopPage.url(), destination, `The old ${legacyPath} bookmark should redirect to ${path}.`);
    assert.equal((await desktopPage.locator('.forum-subnav [aria-current="page"]').innerText()).trim(), label, 'Legacy Forum bookmarks should preserve the selected subpage.');
  }
  const eventUrl = new URL('events/spark-forum/', baseUrl).href;
  await desktopPage.goto(`${baseUrl}events/spark-forum-2026/`, { waitUntil: 'networkidle' });
  await desktopPage.waitForURL(eventUrl);
  assert.equal(desktopPage.url(), eventUrl, 'The old event bookmark should redirect to the yearless event route.');
  assert.equal((await desktopPage.locator('h1').innerText()).trim(), 'SPARK Forum');
  assert.match(await desktopPage.locator('.detail-facts').innerText(), /March 7–12, 2027 \(tentative\)/);
  for (const width of [1200, 1440]) {
    await desktopPage.setViewportSize({ width, height: 900 });
    await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });
    if (width === 1440) {
      assert.ok(await desktopPage.locator('.desktop-cta').isVisible(), 'The primary header action should be visible on a wide desktop.');
    }
    const headerBounds = await desktopPage.evaluate(() => {
      const brand = document.querySelector('.brand-header')?.getBoundingClientRect();
      const nav = document.querySelector('.desktop-nav')?.getBoundingClientRect();
      const actions = document.querySelector('.header-actions')?.getBoundingClientRect();
      return brand && nav && actions ? { brandRight: brand.right, navLeft: nav.left, navRight: nav.right, actionsLeft: actions.left } : null;
    });
    assert.ok(headerBounds && headerBounds.brandRight <= headerBounds.navLeft && headerBounds.navRight <= headerBounds.actionsLeft, `Header items overlap at ${width}px: ${JSON.stringify(headerBounds)}`);
  }
  await desktopPage.close();

  assert.deepEqual(browserErrors, [], `Browser errors:\n${browserErrors.join('\n')}`);
  console.log('Browser smoke test passed: mobile layout, navigation, filters, and Pagefind search.');
} finally {
  await browser.close();
}
