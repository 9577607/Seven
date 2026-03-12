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
