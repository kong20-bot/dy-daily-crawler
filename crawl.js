const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.douyin.com/user/MS4wLjABAAAAfmNeDo5pt54dCnneyHmcqniUm-11oAIgnAF3lQIe_SA', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. 滚动加载更多
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('End');
    await page.waitForTimeout(2500);
  }

  // 2. 拿 aweme_id 列表
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="/video/"]'))
      .map(a => a.href.match(/\/video\/(\d+)/)?.[1])
      .filter(Boolean)
  );

  // 3. 逐个视频页抓指标
  const videos = [];
  for (const id of ids.slice(0, 20)) {
    const detailPage = await browser.newPage();
    await detailPage.goto(`https://www.douyin.com/video/${id}`, { waitUntil: 'networkidle2', timeout: 25000 });
    await detailPage.waitForSelector('span.oYTywyxr', { timeout: 8000 });

    const data = await detailPage.evaluate(() => ({
      share_title: document.querySelector('h1[data-e2e="video-desc"]')?.textContent?.trim() ||
                   document.querySelector('meta[property="og:title"]')?.content ||
                   '',
      aweme_id: location.pathname.match(/\/video\/(\d+)/)?.[1],
      comment_count: parseInt(document.querySelectorAll('span.oYTywyxr')[1]?.textContent?.replace(/[^\d]/g, '') || '0'),
      digg_count: parseInt(document.querySelectorAll('span.oYTywyxr')[0]?.textContent?.replace(/[^\d]/g, '') || '0'),
      collect_count: parseInt(document.querySelector('span.Vc7Hm_bN')?.textContent?.replace(/[^\d]/g, '') || '0'),
      share_count: parseInt(document.querySelector('span.Vc7Xm_bN')?.textContent?.replace(/[^\d]/g, '') || '0'),
      video_tag: Array.from(document.querySelectorAll('a[href*="/tag/"]')).map(a => a.textContent.replace('#', '')).join(','),
      share_url: location.href
    }));

    await detailPage.close();
    videos.push(data);
    console.log('Done', id);
  }

  await browser.close();
  const result = { date: new Date().toISOString(), total: videos.length, videos };
  fs.writeFileSync('result.json', JSON.stringify(result, null, 2));
  console.log('All OK, total:', videos.length);
})();
