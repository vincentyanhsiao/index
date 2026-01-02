// server/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// 1. 连接数据库 (保持您现在的内网配置)
const dbUrl = process.env.MONGODB_URI || 'mongodb://mongo:mA93iKPVx6W4Nsz5ulceg1jH0XI72C8Y@sjc1.clusters.zeabur.com:26084';
mongoose.connect(dbUrl)
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败', err));

// --- Schema 定义 ---

// 艺术品 Schema
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

// 用户 Schema (⚠️ 新增 VIP 字段)
const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  favorites: [String],
  isMarketingAuthorized: Boolean,
  // --- 新增 VIP 字段 ---
  isVip: { type: Boolean, default: false },
  vipExpireAt: Date, // 会员到期时间
  createdAt: { type: Date, default: Date.now }
});
const UserModel = mongoose.model('User', UserSchema);

// --- API 接口 ---

// 艺术品接口
app.get('/api/artworks', async (req, res) => {
  try {
    const artworks = await ArtworkModel.find();
    res.json(artworks);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

app.post('/api/artworks', async (req, res) => {
  try {
    const newArt = new ArtworkModel(req.body);
    await newArt.save();
    res.json(newArt);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

app.put('/api/artworks/:id', async (req, res) => {
  try {
    const updated = await ArtworkModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

app.delete('/api/artworks/:id', async (req, res) => {
  try {
    await ArtworkModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }) }
});

// 用户认证接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(400).json({ error: '该邮箱已被注册' });
    
    const newUser = new UserModel(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 管理员后门
    if (email === 'admin@fuhung.cn' && password === 'xiao1988HB') {
       return res.json({
         id: 'admin-01',
         name: '超级管理员',
         email: 'admin@fuhung.cn',
         role: 'ADMIN',
         isVip: true, // 管理员天生是 VIP
         favorites: [],
         isMarketingAuthorized: false
       });
    }

    const user = await UserModel.findOne({ email, password });
    if (!user) return res.status(401).json({ error: '账号或密码错误' });
    
    // 检查 VIP 是否过期
    if (user.isVip && user.vipExpireAt && new Date() > new Date(user.vipExpireAt)) {
        user.isVip = false; // 过期了自动降级
        await user.save();
    }
    
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

// ⚠️ 新增接口：管理员给用户开通/取消 VIP
app.put('/api/users/:id/vip', async (req, res) => {
    try {
      const { isVip, months } = req.body; // months: 开通几个月
      let updateData = { isVip };
      
      if (isVip && months) {
          const date = new Date();
          date.setMonth(date.getMonth() + months); // 当前时间 + N个月
          updateData.vipExpireAt = date;
      } else if (!isVip) {
          updateData.vipExpireAt = null;
      }
  
      const user = await UserModel.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
      res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }) }
});

// 托管前端
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
