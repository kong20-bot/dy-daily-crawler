const axios = require('axios');
const fs   = require('fs');

const url = 'https://v.douyin.com/BYFyL-zfB7E/';
const api = `https://dy.2333.me/api?url=${encodeURIComponent(url)}`;

axios.get(api, { maxRedirects: 5 })  // 自动跟跳
  .then(res => {
    const json = res.data;
    const data = {
      date: new Date().toISOString(),
      title: json.data?.title || json.data?.desc || '无标题',
      description: json.data?.desc || '',
      author: json.data?.author?.nickname || '',
      random: Math.random().toString(36).slice(2, 8)
    };
    fs.writeFileSync('result.json', JSON.stringify(data, null, 2));
    console.log('OK');
  })
  .catch(err => {
    console.error('请求失败', err.message);
    process.exit(1);
  });
