const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log("Navigating to login...");
  await page.goto('http://localhost:5174/admin/login');
  
  await page.type('input[type="email"]', 'admin@institution.edu');
  await page.type('input[type="password"]', 'ChangeThis@123');
  await page.click('button[type="submit"]');
  
  console.log("Waiting for navigation...");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  console.log("Taking screenshot...");
  await page.screenshot({ path: 'dashboard.png' });
  
  await browser.close();
  console.log("Done");
})();
