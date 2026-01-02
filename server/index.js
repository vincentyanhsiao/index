// server/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 解决 ES Module 中无法直接使用 __dirname 的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// 允许上传较大的图片数据 (50mb)
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// 1. 连接数据库
// 会自动读取 Zeabur 设置的环境变量 MONGODB_URI，如果本地运行则连本地数据库
const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/artworks_db';

mongoose.connect(dbUrl)
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败', err));

// 2. 定义数据结构 (Schema)
const ArtworkSchema = new mongoose.Schema({
  id: String,
  title: String,
  artist: String,
  category: String,
  material: String,
  dimensions: String,
  creationYear: String,
  hammerPrice: Number,
  estimatedPriceMin: Number,
  estimatedPriceMax: Number,
  auctionHouse: String,
  auctionDate: String,
  auctionTime: String,
  auctionSession: String,
  description: String,
  thumbnail: String,
  images: [String],
  createdAt: String,
  status: String
});

const ArtworkModel = mongoose.model('Artwork', ArtworkSchema);

// 3. API 接口 (增删改查)
app.get('/api/artworks', async (req, res) => {
  const artworks = await ArtworkModel.find();
  res.json(artworks);
});

app.post('/api/artworks', async (req, res) => {
  const newArt = new ArtworkModel(req.body);
  await newArt.save();
  res.json(newArt);
});

app.put('/api/artworks/:id', async (req, res) => {
  const updated = await ArtworkModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/artworks/:id', async (req, res) => {
  await ArtworkModel.findOneAndDelete({ id: req.params.id });
  res.json({ success: true });
});

// 4. 关键：托管前端网页
// 当我们运行 npm run build 后，生成的网页会在 dist 文件夹里
// 这里告诉服务器去哪里找这些网页文件
app.use(express.static(path.join(__dirname, '../dist')));

// 5. 处理前端路由
// 任何后端不认识的请求，都返回 index.html，交给前端 React 去处理路由跳转
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// 6. 启动服务器
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`网站已启动：http://localhost:${PORT}`);
});
