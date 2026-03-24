require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const amqp = require('amqplib');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DATABASE_URL = process.env.DATABASE_URL;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const db = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});


let mqChannel = null;
async function initMq() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/');
    mqChannel = await conn.createChannel();
    await mqChannel.assertQueue(process.env.WORKFLOW_QUEUE || 'autocontent_tasks', { durable: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MQ init failed, workflow enqueue disabled', error.message);
  }
}

async function enqueueWorkflowTask(taskId, type, payload) {
  if (!mqChannel) return false;
  const queue = process.env.WORKFLOW_QUEUE || 'autocontent_tasks';
  const body = Buffer.from(JSON.stringify({ task_id: taskId, type, payload }));
  return mqChannel.sendToQueue(queue, body, { persistent: true });
}

const ok = (res, data = null, message = 'ok') => res.json({ code: 0, message, data });
const fail = (res, httpCode, code, message) => res.status(httpCode).json({ code, message, data: null });
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: Number(process.env.AUTH_RATE_LIMIT || 30), standardHeaders: true, legacyHeaders: false });

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 60 * 1000, max: Number(process.env.API_RATE_LIMIT || 180) }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('CORS forbidden'));
  },
}));

function validatePassword(password) {
  return typeof password === 'string' && /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/.test(password);
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 401, 40101, 'Missing token');
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (_) {
    return fail(res, 401, 40102, 'Invalid token');
  }
}

async function initDb() {
  await db.query('SELECT 1');
}

app.get('/health', asyncHandler(async (_, res) => {
  await db.query('SELECT 1');
  ok(res, { service: 'api' });
}));

app.post('/api/auth/register', authLimiter, asyncHandler(async (req, res) => {
  const { email, phone, password, nickname } = req.body || {};
  if ((!email && !phone) || !password) {
    return fail(res, 400, 40001, 'email/phone and password are required');
  }
  if (!validatePassword(password)) {
    return fail(res, 400, 40002, 'password must be 8-64 chars and include letters+numbers');
  }

  const exists = await db.query('SELECT id FROM users WHERE email = $1 OR phone = $2 LIMIT 1', [email || null, phone || null]);
  if (exists.rowCount > 0) return fail(res, 409, 40901, 'user already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users(email, phone, password_hash, nickname)
     VALUES($1,$2,$3,$4)
     RETURNING id, email, phone, nickname, plan, created_at`,
    [email || null, phone || null, passwordHash, nickname || 'AutoContent User'],
  );
  ok(res, result.rows[0]);
}));

app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body || {};
  if ((!email && !phone) || !password) return fail(res, 400, 40003, 'credentials are required');

  const result = await db.query('SELECT * FROM users WHERE email = $1 OR phone = $2 LIMIT 1', [email || null, phone || null]);
  if (result.rowCount === 0) return fail(res, 404, 40401, 'user not found');

  const user = result.rows[0];
  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) return fail(res, 401, 40103, 'invalid credentials');

  const token = jwt.sign({ user_id: user.id, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
  ok(res, { token, user: { id: user.id, nickname: user.nickname, plan: user.plan } });
}));

app.get('/api/user/profile', auth, asyncHandler(async (req, res) => {
  const result = await db.query('SELECT id, email, phone, nickname, avatar, plan, credits, created_at, updated_at FROM users WHERE id = $1', [req.user.user_id]);
  if (result.rowCount === 0) return fail(res, 404, 40401, 'user not found');
  ok(res, result.rows[0]);
}));

app.post('/api/payment/create-order', auth, asyncHandler(async (req, res) => {
  const { plan, amount, payment_method } = req.body || {};
  if (!plan || !amount || !payment_method) return fail(res, 400, 40004, 'plan/amount/payment_method are required');
  const orderNo = `AC${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const result = await db.query(
    `INSERT INTO orders(order_no, user_id, plan, amount, payment_method)
     VALUES($1,$2,$3,$4,$5)
     RETURNING *`,
    [orderNo, req.user.user_id, plan, amount, payment_method],
  );
  ok(res, result.rows[0]);
}));

async function applySubscription(orderNo) {
  const orderRes = await db.query('SELECT * FROM orders WHERE order_no = $1 LIMIT 1', [orderNo]);
  if (orderRes.rowCount === 0) return null;
  const order = orderRes.rows[0];
  await db.query('UPDATE orders SET status = $1, paid_at = NOW() WHERE id = $2', ['paid', order.id]);

  const activeSub = await db.query(
    'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY expire_time DESC LIMIT 1',
    [order.user_id, 'active'],
  );
  const now = new Date();
  const start = activeSub.rowCount > 0 && new Date(activeSub.rows[0].expire_time) > now
    ? new Date(activeSub.rows[0].expire_time)
    : now;
  const expire = new Date(start);
  const months = order.plan === 'pro_month' ? 1 : order.plan === 'pro_quarter' ? 3 : 12;
  expire.setMonth(expire.getMonth() + months);

  const subRes = await db.query(
    `INSERT INTO subscriptions(user_id, plan, start_time, expire_time, status)
     VALUES($1,$2,$3,$4,$5)
     RETURNING *`,
    [order.user_id, order.plan, start.toISOString(), expire.toISOString(), 'active'],
  );

  await db.query('UPDATE users SET plan = $1, updated_at = NOW() WHERE id = $2', [order.plan, order.user_id]);

  return { order_no: order.order_no, subscription: subRes.rows[0] };
}

app.post('/api/payment/wechat-notify', asyncHandler(async (req, res) => {
  const result = await applySubscription(req.body.order_no);
  if (!result) return fail(res, 404, 40402, 'order not found');
  ok(res, result);
}));

app.post('/api/payment/alipay-notify', asyncHandler(async (req, res) => {
  const result = await applySubscription(req.body.order_no);
  if (!result) return fail(res, 404, 40402, 'order not found');
  ok(res, result);
}));

async function callAi(path, payload) {
  try {
    const resp = await axios.post(`${AI_SERVICE_URL}${path}`, payload, { timeout: Number(process.env.AI_TIMEOUT_MS || 15000) });
    return resp.data?.data ?? resp.data;
  } catch (error) {
    const detail = error.response?.data?.message || error.message;
    const err = new Error(`AI service failed: ${detail}`);
    err.httpCode = 502;
    err.code = 50201;
    throw err;
  }
}

app.post('/api/ai/generate-copy', auth, asyncHandler(async (req, res) => {
  const data = await callAi('/api/ai/generate-copy', req.body);
  ok(res, data);
}));

app.post('/api/ai/generate-image', auth, asyncHandler(async (req, res) => {
  const data = await callAi('/api/ai/generate-image', req.body);
  await db.query('INSERT INTO assets(user_id, type, url, metadata) VALUES($1,$2,$3,$4)', [req.user.user_id, 'image', data.image_url, req.body]);
  ok(res, data);
}));

app.post('/api/ai/generate-video', auth, asyncHandler(async (req, res) => {
  const data = await callAi('/api/ai/generate-video', req.body);
  await db.query('INSERT INTO assets(user_id, type, url, metadata) VALUES($1,$2,$3,$4)', [req.user.user_id, 'video', data.video_url, req.body]);
  ok(res, data);
}));

app.post('/api/video/subtitle', auth, (req, res) => ok(res, { subtitle_text: '自动字幕示例', video_url: req.body.video_url }));
app.post('/api/video/voice', auth, (req, res) => ok(res, { voice_url: 'https://example.com/audio/voice.mp3', video_url: req.body.video_url }));
app.post('/api/video/edit', auth, (req, res) => ok(res, { edited_video_url: 'https://example.com/video/edited.mp4', source: req.body.video_url }));

app.get('/api/assets', auth, asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM assets WHERE user_id = $1 ORDER BY id DESC', [req.user.user_id]);
  ok(res, result.rows);
}));

app.post('/api/assets/delete', auth, asyncHandler(async (req, res) => {
  const { id } = req.body || {};
  const deleted = await db.query('DELETE FROM assets WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.user_id]);
  if (deleted.rowCount === 0) return fail(res, 404, 40403, 'asset not found');
  ok(res, { id }, 'deleted');
}));

app.post('/api/publish', auth, (req, res) => {
  const { platform, title } = req.body || {};
  ok(res, { platform, title, status: 'pending' }, 'publish queued');
});


app.post('/api/workflow/tasks', auth, asyncHandler(async (req, res) => {
  const { type, payload = {}, project_id = null } = req.body || {};
  if (!['generate_copy', 'generate_image', 'generate_video'].includes(type)) {
    return fail(res, 400, 40007, 'unsupported workflow task type');
  }
  const taskRes = await db.query(
    'INSERT INTO tasks(project_id, status, result) VALUES($1, $2, $3) RETURNING *',
    [project_id, 'pending', { type, payload, user_id: req.user.user_id }],
  );
  await enqueueWorkflowTask(taskRes.rows[0].id, type, payload);
  ok(res, taskRes.rows[0], 'task queued');
}));

// Garden Expo APIs
app.get('/api/app/home/config', asyncHandler(async (_, res) => {
  const banners = await db.query('SELECT id,title,image_url,jump_url,sort_no FROM content_banner WHERE status = 1 ORDER BY sort_no ASC, id DESC');
  const activities = await db.query('SELECT id,title,summary,cover_url,detail_url,starts_at,ends_at FROM content_activity WHERE status = 1 ORDER BY id DESC LIMIT 8');
  const mapRows = await db.query('SELECT id,name,map_image_url FROM content_map WHERE status = 1 ORDER BY sort_no ASC, id DESC');
  ok(res, { banners: banners.rows, activities: activities.rows, maps: mapRows.rows });
}));

app.get('/api/app/activities', asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 50);
  const result = await db.query('SELECT id,title,summary,cover_url,detail_url,starts_at,ends_at,status FROM content_activity ORDER BY id DESC LIMIT $1', [limit]);
  ok(res, result.rows);
}));

app.get('/api/app/activities/:id', asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM content_activity WHERE id = $1 LIMIT 1', [req.params.id]);
  if (result.rowCount === 0) return fail(res, 404, 40404, 'activity not found');
  ok(res, result.rows[0]);
}));

app.get('/api/app/submission/config', asyncHandler(async (_, res) => {
  const categories = await db.query('SELECT id,name,sort_no FROM submission_category WHERE status = 1 ORDER BY sort_no ASC, id DESC');
  const awards = await db.query('SELECT id,activity_id,award_name,quota,prize_desc,criteria_desc,sort_no FROM award_config WHERE status = 1 ORDER BY sort_no ASC, id DESC');
  const setting = await db.query("SELECT key, value FROM app_settings WHERE key IN ('submission_deadline','submission_notice')");
  const map = Object.fromEntries(setting.rows.map((i) => [i.key, i.value]));
  ok(res, { categories: categories.rows, awards: awards.rows, submission_deadline: map.submission_deadline || null, submission_notice: map.submission_notice || '' });
}));

app.post('/api/app/submissions', auth, asyncHandler(async (req, res) => {
  const { activity_id, category_id, title, description, medias = [] } = req.body || {};
  if (!category_id || !title) return fail(res, 400, 40005, 'category_id and title are required');
  if (!Array.isArray(medias) || medias.length === 0 || medias.length > 9) return fail(res, 400, 40006, 'medias must be array(1-9)');

  const appUserRes = await db.query('SELECT id FROM app_user WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
  if (appUserRes.rowCount === 0) {
    return fail(res, 404, 40405, 'app user profile not initialized');
  }
  const appUserId = appUserRes.rows[0].id;

  const submission = await db.query(
    `INSERT INTO submission(app_user_id, activity_id, category_id, title, description, status, submitted_at)
     VALUES($1,$2,$3,$4,$5,'PENDING', NOW()) RETURNING *`,
    [appUserId, activity_id || null, category_id, title, description || null],
  );

  for (let i = 0; i < medias.length; i += 1) {
    const item = medias[i];
    await db.query('INSERT INTO submission_media(submission_id, media_type, media_url, sort_no) VALUES($1,$2,$3,$4)', [submission.rows[0].id, item.media_type || 'IMAGE', item.media_url, i + 1]);
  }

  ok(res, submission.rows[0]);
}));

app.get('/api/app/submissions/my', auth, asyncHandler(async (req, res) => {
  const appUserRes = await db.query('SELECT id FROM app_user WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
  if (appUserRes.rowCount === 0) return ok(res, []);
  const appUserId = appUserRes.rows[0].id;
  const result = await db.query(
    `SELECT s.*, COALESCE((SELECT sm.media_url FROM submission_media sm WHERE sm.submission_id = s.id ORDER BY sm.sort_no ASC LIMIT 1), '') AS cover_url
     FROM submission s WHERE s.app_user_id = $1 ORDER BY s.id DESC`,
    [appUserId],
  );
  ok(res, result.rows);
}));

app.get('/api/app/user/profile', auth, asyncHandler(async (req, res) => {
  const baseUserRes = await db.query('SELECT id,nickname,avatar FROM users WHERE id = $1', [req.user.user_id]);
  if (baseUserRes.rowCount === 0) return fail(res, 404, 40401, 'user not found');

  let appUserRes = await db.query('SELECT * FROM app_user WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
  if (appUserRes.rowCount === 0) {
    appUserRes = await db.query(
      'INSERT INTO app_user(user_id, openid, nickname, avatar_url, signature) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [req.user.user_id, `mock_openid_${req.user.user_id}`, baseUserRes.rows[0].nickname, baseUserRes.rows[0].avatar, '园林主题背景'],
    );
  }
  ok(res, appUserRes.rows[0]);
}));

app.put('/api/app/user/profile', auth, asyncHandler(async (req, res) => {
  const { nickname, avatar_url, signature } = req.body || {};
  const result = await db.query(
    `UPDATE app_user
     SET nickname = COALESCE($1, nickname),
         avatar_url = COALESCE($2, avatar_url),
         signature = COALESCE($3, signature),
         updated_at = NOW()
     WHERE user_id = $4
     RETURNING *`,
    [nickname || null, avatar_url || null, signature || null, req.user.user_id],
  );
  if (result.rowCount === 0) return fail(res, 404, 40405, 'app user profile not found');
  ok(res, result.rows[0]);
}));

app.post('/api/app/tickets/claim', auth, asyncHandler(async (req, res) => {
  const appUserRes = await db.query('SELECT id FROM app_user WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
  if (appUserRes.rowCount === 0) return fail(res, 404, 40405, 'app user profile not found');
  const appUserId = appUserRes.rows[0].id;

  const existed = await db.query("SELECT * FROM ticket WHERE app_user_id = $1 AND status IN ('UNUSED','USED') ORDER BY id DESC LIMIT 1", [appUserId]);
  if (existed.rowCount > 0) return ok(res, existed.rows[0], 'already claimed');

  const ticketCode = `TK${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const qrContent = `garden-expo://ticket/${ticketCode}`;
  const result = await db.query(
    `INSERT INTO ticket(app_user_id, ticket_code, qr_content, status, claimed_at, expires_at)
     VALUES($1,$2,$3,'UNUSED', NOW(), NOW() + INTERVAL '30 days') RETURNING *`,
    [appUserId, ticketCode, qrContent],
  );
  ok(res, result.rows[0]);
}));

app.get('/api/app/tickets/my', auth, asyncHandler(async (req, res) => {
  const appUserRes = await db.query('SELECT id FROM app_user WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
  if (appUserRes.rowCount === 0) return ok(res, []);
  const result = await db.query('SELECT * FROM ticket WHERE app_user_id = $1 ORDER BY id DESC', [appUserRes.rows[0].id]);
  ok(res, result.rows);
}));

app.use((err, _req, res, _next) => {
  const httpCode = err.httpCode || 500;
  const code = err.code || 50000;
  const message = httpCode >= 500 ? 'internal server error' : err.message;
  if (httpCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[API ERROR]', err);
  }
  return fail(res, httpCode, code, message);
});

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (error) => {
  // eslint-disable-next-line no-console
  console.error('[uncaughtException]', error);
});

Promise.all([initDb(), initMq()])
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`AutoContent API listening on ${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to init DB', error);
    process.exit(1);
  });
