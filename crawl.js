const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = 'https://v.douyin.com/BYFyL-zfB7E/';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
  try { await page.waitForSelector('h1[data-e2e="video-desc"]', { timeout: 8000 }); } catch {}
  const data = await page.evaluate(() => ({
    date: new Date().toISOString(),
    title: document.title,
    description: document.querySelector('h1[data-e2e="video-desc"]')?.textContent?.trim() || '',
    author: document.querySelector('a[data-e2e="video-author"]')?.textContent?.trim() || ''
  }));
  await browser.close();
  fs.writeFileSync('result.json', JSON.stringify(data, null, 2));
})();