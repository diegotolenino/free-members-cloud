const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  
  // Login
  await page.goto('http://145.223.92.9:5177/', { waitUntil: 'networkidle' });
  
  const hasEmail = await page.$('input[type="email"]');
  if (hasEmail) {
    await page.fill('input[type="email"]', 'emailfulldigital@gmail.com');
    const hasPass = await page.$('input[type="password"]');
    if (hasPass) await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }
  
  await page.screenshot({ path: 'screenshots/cloud_dashboard.png', fullPage: false });
  console.log('Dashboard URL:', page.url());
  
  // Try students
  const studentsLink = await page.$('[data-section="students"], button:has-text("Alunos"), a:has-text("Alunos")');
  if (!studentsLink) {
    const sidebar = await page.$('.fm-admin-sidebar, nav');
    console.log('Sidebar HTML:', sidebar ? await sidebar.innerHTML() : 'no sidebar');
  } else {
    await studentsLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/cloud_students.png', fullPage: false });
    console.log('Students screenshot taken');
  }
  
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
