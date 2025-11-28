const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const userUrl = 'https://www.douyin.com/user/MS4wLjABAAAAfmNeDo5pt54dCnneyHmcqniUm-11oAIgnAF3lQIe_SA';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // 1. 进入主页
  await page.goto(userUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  // 2. 滚动 6 次，加载更多视频
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('End');
    await page.waitForTimeout(2500);
  }

  // 3. 提取结构化数据（window._ROUTER_DATA）
  const list = await page.evaluate(() => {
    const items = [];
    // 用户页数据在 _ROUTER_DATA 里
    const routerData = window._ROUTER_DATA;
    if (!routerData) return items;

    // 找到视频列表节点
    const videoList = routerData?.loaderData?.['user-profile']?.posts?.data || [];
    videoList.forEach(v => {
      const stat = v.stats;
      items.push({
        share_title: v.share_info?.share_title || v.desc,
        aweme_id: v.aweme_id,
        comment_count: stat?.comment_count || 0,
        digg_count: stat?.digg_count || 0,
        collect_count: stat?.collect_count || 0,
        share_count: stat?.share_count || 0,
        video_tag: v.video_tag?.map(t => t.tag_name).join(',') || '',
        share_url: v.share_info?.share_url || `https://www.douyin.com/video/${v.aweme_id}`
      });
    });
    return items;
  });

  await browser.close();

  const result = {
    date: new Date().toISOString(),
    total: list.length,
    videos: list
  };
  fs.writeFileSync('result.json', JSON.stringify(result, null, 2));
  console.log('OK, total:', list.length);
})();
