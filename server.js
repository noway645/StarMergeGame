const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS（调试方便，同源时其实不需要）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 读取排行榜文件，不存在则返回空数组
function readLeaderboard() {
  try {
    const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

// 写入排行榜文件
function writeLeaderboard(list) {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.error('写入排行榜失败:', e.message);
  }
}

// GET /api/leaderboard — 返回排行榜数组
app.get('/api/leaderboard', (req, res) => {
  const list = readLeaderboard();
  res.json(list);
});

// POST /api/leaderboard — 提交分数，插入并排序，保留前 10 名
app.post('/api/leaderboard', (req, res) => {
  const { nickname, score } = req.body || {};
  if (typeof score !== 'number' || isNaN(score)) {
    return res.status(400).json({ error: 'score 必须为数字' });
  }
  const name = (typeof nickname === 'string' && nickname.trim()) || '匿名';
  const list = readLeaderboard();
  list.push({ name: name.slice(0, 8), score: score, date: Date.now() });
  list.sort((a, b) => b.score - a.score);
  if (list.length > 10) list.length = 10;
  writeLeaderboard(list);
  res.json(list);
});

// 启动服务器并打印局域网 IP
app.listen(PORT, '0.0.0.0', () => {
  console.log('StarMerge 服务器已启动: http://localhost:' + PORT);
  console.log('局域网访问地址:');
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log('  http://' + iface.address + ':' + PORT);
      }
    }
  }
});
