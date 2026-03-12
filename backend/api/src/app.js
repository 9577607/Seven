const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'autocontent_secret';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

const users = [];
const orders = [];
const subscriptions = [];
const assets = [];
const productionRecords = [];

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/health', (_, res) => res.json({ ok: true, service: 'api' }));

app.post('/api/auth/register', async (req, res) => {
  const { email, phone, password, nickname } = req.body;
  if ((!email && !phone) || !password) {
    return res.status(400).json({ message: 'email/phone and password are required' });
  }
  const exists = users.find((u) => (email && u.email === email) || (phone && u.phone === phone));
  if (exists) return res.status(409).json({ message: 'user already exists' });

  const password_hash = await bcrypt.hash(password, 10);
  const user = {
    id: users.length + 1,
    email: email || null,
    phone: phone || null,
    password_hash,
    nickname: nickname || 'AutoContent User',
    avatar: null,
    plan: 'free',
    credits: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  users.push(user);
  res.json({ id: user.id, email: user.email, phone: user.phone, plan: user.plan });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, phone, password } = req.body;
  const user = users.find((u) => (email && u.email === email) || (phone && u.phone === phone));
  if (!user) return res.status(404).json({ message: 'user not found' });
  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });

  const token = jwt.sign({ user_id: user.id, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, nickname: user.nickname, plan: user.plan } });
});

app.get('/api/user/profile', auth, (req, res) => {
  const user = users.find((u) => u.id === req.user.user_id);
  if (!user) return res.status(404).json({ message: 'user not found' });
  res.json(user);
});

app.post('/api/payment/create-order', auth, (req, res) => {
  const { plan, amount, payment_method } = req.body;
  const order = {
    id: orders.length + 1,
    order_no: `AC${Date.now()}`,
    user_id: req.user.user_id,
    plan,
    amount,
    payment_method,
    status: 'pending',
    created_at: new Date().toISOString(),
    paid_at: null,
  };
  orders.push(order);
  res.json(order);
});

function applySubscription(orderNo) {
  const order = orders.find((o) => o.order_no === orderNo);
  if (!order) return null;
  order.status = 'paid';
  order.paid_at = new Date().toISOString();

  const now = new Date();
  const latest = subscriptions.find((s) => s.user_id === order.user_id && s.status === 'active');
  const start = latest && new Date(latest.expire_time) > now ? new Date(latest.expire_time) : now;
  const expire = new Date(start);
  const months = order.plan === 'pro_month' ? 1 : order.plan === 'pro_quarter' ? 3 : 12;
  expire.setMonth(expire.getMonth() + months);

  const sub = {
    id: subscriptions.length + 1,
    user_id: order.user_id,
    plan: order.plan,
    start_time: start.toISOString(),
    expire_time: expire.toISOString(),
    status: 'active',
  };
  subscriptions.push(sub);

  const user = users.find((u) => u.id === order.user_id);
  if (user) user.plan = order.plan;
  return { order, subscription: sub };
}

app.post('/api/payment/wechat-notify', (req, res) => {
  const result = applySubscription(req.body.order_no);
  if (!result) return res.status(404).json({ message: 'order not found' });
  res.json({ message: 'ok', ...result });
});

app.post('/api/payment/alipay-notify', (req, res) => {
  const result = applySubscription(req.body.order_no);
  if (!result) return res.status(404).json({ message: 'order not found' });
  res.json({ message: 'ok', ...result });
});

app.post('/api/ai/generate-copy', auth, async (req, res) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-copy`, req.body);
  res.json(response.data);
});

app.post('/api/ai/generate-image', auth, async (req, res) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-image`, req.body);
  const item = {
    id: assets.length + 1,
    user_id: req.user.user_id,
    type: 'image',
    url: response.data.image_url,
    metadata: req.body,
    created_at: new Date().toISOString(),
  };
  assets.push(item);
  res.json(response.data);
});

app.post('/api/ai/generate-video', auth, async (req, res) => {
  const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-video`, req.body);
  const item = {
    id: assets.length + 1,
    user_id: req.user.user_id,
    type: 'video',
    url: response.data.video_url,
    metadata: req.body,
    created_at: new Date().toISOString(),
  };
  assets.push(item);
  res.json(response.data);
});

app.post('/api/video/subtitle', auth, (req, res) => {
  res.json({ subtitle_text: '自动字幕示例', video_url: req.body.video_url });
});

app.post('/api/video/voice', auth, (req, res) => {
  res.json({ voice_url: 'https://example.com/audio/voice.mp3', video_url: req.body.video_url });
});

app.post('/api/video/edit', auth, (req, res) => {
  res.json({ edited_video_url: 'https://example.com/video/edited.mp4', source: req.body.video_url });
});

app.get('/api/assets', auth, (req, res) => {
  const list = assets.filter((a) => a.user_id === req.user.user_id);
  res.json(list);
});

app.post('/api/assets/delete', auth, (req, res) => {
  const { id } = req.body;
  const index = assets.findIndex((a) => a.id === id && a.user_id === req.user.user_id);
  if (index === -1) return res.status(404).json({ message: 'asset not found' });
  assets.splice(index, 1);
  res.json({ message: 'deleted' });
});

app.post('/api/workflow/production-records', auth, (req, res) => {
  const { topic, copy, image_url, video_url, subtitle_mode } = req.body;
  const record = {
    id: productionRecords.length + 1,
    user_id: req.user.user_id,
    topic,
    copy,
    image_url,
    video_url,
    subtitle_mode,
    created_at: new Date().toISOString(),
  };
  productionRecords.unshift(record);
  res.json({ message: 'recorded', record });
});

app.get('/api/workflow/production-records', (_, res) => {
  res.json(productionRecords.slice(0, 200));
});

app.post('/api/publish', auth, (req, res) => {
  const { platform, title } = req.body;
  res.json({ message: 'manual publish only', platform, title, status: 'ready_for_manual_publish' });
});

app.listen(PORT, () => {
  console.log(`AutoContent API listening on ${PORT}`);
});
