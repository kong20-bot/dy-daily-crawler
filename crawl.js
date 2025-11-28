const https = require('https');
const fs   = require('fs');

const url = 'https://v.douyin.com/BYFyL-zfB7E/';          // 抖音短链
const api = `https://api.hydouyin.com/parse?url=${encodeURIComponent(url)}`; // 备用接口

https.get(api, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const data = {
        date: new Date().toISOString(),
        title: json.data?.title || json.data?.desc || '无标题',
        description: json.data?.desc || '',
        author: json.data?.author?.nickname || '',
        random: Math.random().toString(36).slice(2, 8) // 6位随机串，肉眼确认更新
      };
      fs.writeFileSync('result.json', JSON.stringify(data, null, 2));
      console.log('OK');
    } catch (e) {
      console.error('解析失败', e);
      process.exit(1);
    }
  });
}).on('error', e => {
  console.error('请求失败', e);
  process.exit(1);
});
