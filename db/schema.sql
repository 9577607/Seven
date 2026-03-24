CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(64) UNIQUE,
  password_hash TEXT NOT NULL,
  nickname VARCHAR(128) DEFAULT 'AutoContent User',
  avatar TEXT,
  plan VARCHAR(32) DEFAULT 'free',
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_no VARCHAR(64) UNIQUE NOT NULL,
  user_id BIGINT REFERENCES users(id),
  plan VARCHAR(32) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  plan VARCHAR(32) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  expire_time TIMESTAMP NOT NULL,
  status VARCHAR(32) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS assets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  type VARCHAR(32) NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflows (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id BIGINT REFERENCES users(id),
  nodes JSONB NOT NULL,
  connections JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id BIGINT REFERENCES users(id),
  workflow_id BIGINT REFERENCES workflows(id),
  status VARCHAR(32) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id),
  status VARCHAR(32) DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_queue (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  payload JSONB NOT NULL,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  action VARCHAR(128) NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Garden Expo business tables (PostgreSQL)
CREATE TABLE IF NOT EXISTS app_user (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id),
  openid VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(64) NOT NULL,
  avatar_url TEXT,
  signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_banner (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  image_url TEXT NOT NULL,
  jump_url TEXT,
  sort_no INT DEFAULT 100,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_activity (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  summary VARCHAR(500),
  cover_url TEXT,
  detail_url TEXT,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_map (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  map_image_url TEXT NOT NULL,
  sort_no INT DEFAULT 100,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_category (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  sort_no INT DEFAULT 100,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission (
  id BIGSERIAL PRIMARY KEY,
  app_user_id BIGINT NOT NULL REFERENCES app_user(id),
  activity_id BIGINT REFERENCES content_activity(id),
  category_id BIGINT NOT NULL REFERENCES submission_category(id),
  title VARCHAR(128) NOT NULL,
  description TEXT,
  status VARCHAR(16) DEFAULT 'PENDING',
  reject_reason VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewer_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_media (
  id BIGSERIAL PRIMARY KEY,
  submission_id BIGINT NOT NULL REFERENCES submission(id) ON DELETE CASCADE,
  media_type VARCHAR(16) NOT NULL,
  media_url TEXT NOT NULL,
  sort_no INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS award_config (
  id BIGSERIAL PRIMARY KEY,
  activity_id BIGINT REFERENCES content_activity(id),
  award_name VARCHAR(128) NOT NULL,
  quota INT DEFAULT 1,
  prize_desc VARCHAR(500),
  criteria_desc VARCHAR(500),
  sort_no INT DEFAULT 100,
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket (
  id BIGSERIAL PRIMARY KEY,
  app_user_id BIGINT NOT NULL REFERENCES app_user(id),
  ticket_code VARCHAR(64) NOT NULL UNIQUE,
  qr_content TEXT NOT NULL,
  status VARCHAR(16) DEFAULT 'UNUSED',
  claimed_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO app_settings(key, value)
VALUES ('submission_deadline', '2026-12-31 23:59:59'),
       ('submission_notice', '欢迎投稿，最多上传9张图片。')
ON CONFLICT (key) DO NOTHING;

INSERT INTO submission_category(name, sort_no, status)
VALUES ('园林设计', 10, 1), ('花卉盆景', 20, 1), ('庭院景观', 30, 1)
ON CONFLICT (name) DO NOTHING;

INSERT INTO content_map(name, map_image_url, sort_no, status)
VALUES ('园林景点分布图', 'https://cdn.example.com/maps/garden-map.jpg', 10, 1)
ON CONFLICT DO NOTHING;
