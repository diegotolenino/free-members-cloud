import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'screenshots');
const pluginUrl = process.env.PLUGIN_URL || 'https://free-solo.freemembers.site';
const pluginUser = process.env.PLUGIN_USER || '';
const pluginPass = process.env.PLUGIN_PASS || '';
const cloudUrl = process.env.CLOUD_URL || 'http://127.0.0.1:5177';
const cloudEmail = process.env.CLOUD_EMAIL || '';
const cloudPass = process.env.CLOUD_PASS || '';

async function ensureOutputDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function maybeLoginWordPress(page) {
  await page.waitForSelector('#user_login, input[name="log"], .fm-courses-layout', { timeout: 8000 }).catch(() => {});
  const loginInput = page.locator('#user_login, input[name="log"]').first();

  if (!(await loginInput.isVisible().catch(() => false))) {
    return;
  }

  if (!pluginUser || !pluginPass) {
    throw new Error('Defina PLUGIN_USER e PLUGIN_PASS para capturar o plugin.');
  }

  await loginInput.fill(pluginUser);
  await page.locator('#user_pass, input[name="pwd"]').first().fill(pluginPass);
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.locator('#wp-submit, input[type="submit"]').first().click(),
  ]);
}

async function maybeLoginCloud(page) {
  await page.waitForSelector('input[type="email"], .fm-courses-layout, .fm-admin-shell', { timeout: 8000 }).catch(() => {});
  const emailInput = page.locator('input[type="email"]').first();

  if (!(await emailInput.isVisible().catch(() => false))) {
    return;
  }

  if (!cloudEmail || !cloudPass) {
    throw new Error('Defina CLOUD_EMAIL e CLOUD_PASS para capturar a versão Cloud.');
  }

  await emailInput.fill(cloudEmail);
  await page.locator('input[type="password"]').first().fill(cloudPass);
  await Promise.all([
    page.waitForLoadState('networkidle').catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
}

async function openCourseCreateScreen(page, targetUrl, label) {
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await maybeLoginWordPress(page);
  await maybeLoginCloud(page);
  await page.waitForLoadState('networkidle').catch(() => {});

  if (!(await page.locator('.fm-courses-layout').first().isVisible().catch(() => false))) {
    const coursesNav = page
      .locator('.fm-sidebar__nav button, button, a')
      .filter({ hasText: /Cursos/i })
      .first();

    if (await coursesNav.isVisible().catch(() => false)) {
      await coursesNav.click();
      await page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  try {
    await page.waitForSelector('.fm-courses-layout', { timeout: 30000 });
  } catch (error) {
    await page.screenshot({ path: path.join(outputDir, `${label}-failure.png`), fullPage: true });
    console.error(`${label} falhou em ${page.url()} :: ${await page.title().catch(() => '')}`);
    throw error;
  }

  const createButton = page
    .locator('button')
    .filter({ hasText: /Novo curso|Crie seu primeiro curso/i })
    .first();

  if (await createButton.isVisible().catch(() => false)) {
    await createButton.click();
  }

  await page.waitForSelector('.fm-course-editor, .fm-workspace-panel', { timeout: 30000 });
  await page.waitForTimeout(600);
}

async function capture() {
  await ensureOutputDir();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
    deviceScaleFactor: 1,
  });

  if (process.env.SKIP_PLUGIN !== '1') {
    const pluginPage = await context.newPage();
    await openCourseCreateScreen(pluginPage, `${pluginUrl.replace(/\/$/, '')}/wp-admin/admin.php?page=free-members-solo`, 'plugin');
    await pluginPage.screenshot({ path: path.join(outputDir, 'plugin-courses-create.png'), fullPage: true });
  }

  const cloudPage = await context.newPage();
  const cloudTargetUrl = cloudUrl.includes('?') ? `${cloudUrl}&section=courses` : `${cloudUrl}?section=courses`;
  await openCourseCreateScreen(cloudPage, cloudTargetUrl, 'cloud');
  await cloudPage.screenshot({ path: path.join(outputDir, 'cloud-courses-create.png'), fullPage: true });

  await browser.close();

  console.log(`Screenshots salvos em ${outputDir}`);
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
