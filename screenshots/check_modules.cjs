const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  
  await page.goto('http://145.223.92.9:5177/', { waitUntil: 'networkidle', timeout: 15000 });
  
  const hasEmail = await page.$('input[type="email"]');
  if (hasEmail) {
    await page.fill('input[type="email"]', 'emailfulldigital@gmail.com');
    const hasPass = await page.$('input[type="password"]');
    if (hasPass) await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }
  
  await page.screenshot({ path: 'screenshots/cloud_dashboard.png', fullPage: false });
  console.log('Current URL:', page.url());
  
  // Try clicking different sections
  const sections = ['students', 'integrations', 'checkouts', 'sales'];
  for (const section of sections) {
    const btn = await page.$(`[data-section="${section}"]`);
    if (btn) {
      await btn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `screenshots/cloud_${section}.png`, fullPage: false });
      console.log(`${section} screenshot taken`);
    } else {
      console.log(`No button found for section: ${section}`);
    }
  }
  
  await browser.close();
})().catch(e => { console.error('Error:', e.message); });
