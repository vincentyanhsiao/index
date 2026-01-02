import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs'; // 引入 fs 模块
import { fileURLToPath } from 'url';

// --- 调试探针 1：确认文件被加载 ---
console.log('>>> [DEBUG] Server script started! 正在启动服务器脚本...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// --- 调试探针 2：检查前端文件是否存在 ---
const distPath = path.join(__dirname, '../dist');
console.log(`>>> [DEBUG] Checking dist path: ${distPath}`);
if (fs.existsSync(distPath)) {
    console.log('>>> [DEBUG] dist folder FOUND. 前端构建产物存在。');
    const files = fs.readdirSync(distPath);
    console.log(`>>> [DEBUG] dist files: ${files.join(', ')}`);
} else {
    console.error('>>> [DEBUG] dist folder NOT FOUND! 前端构建失败或路径错误！');
}

// 数据库连接
const dbUrl = process.env.MONGODB_URI || 'mongodb://mongo:mA93iKPVx6W4Nsz5ulceg1jH0XI72C8Y@sjc1.clusters.zeabur.com:26084';
console.log(`>>> [DEBUG] Attempting to connect to DB at: ${dbUrl.split('@')[1]}`); // 只打印 @ 后面的部分，保护密码

mongoose.connect(dbUrl)
  .then(() => console.log('>>> [DEBUG] 数据库连接成功 (MongoDB Connected)'))
  .catch(err => console.error('>>> [DEBUG] 数据库连接失败 (DB Error):', err.message));

// ... (中间的 Schema 和 API 定义保持不变，无需修改) ...

// 托管前端
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // --- 调试探针 3：确认端口监听成功 ---
  console.log(`>>> [DEBUG] Server running on port ${PORT}`);
  console.log(`>>> [DEBUG] 您现在可以访问网站了`);
});
