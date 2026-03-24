# AutoContent + 园林展会系统（可部署版）

本仓库现在包含两条业务线，并已落地为可运行服务：

1. **AutoContent 骨架能力**：用户、支付、AI 生成、资产管理、工作流任务。
2. **园林展会业务（第一版）**：小程序首页、活动、投稿、个人中心、入场券接口。

---

## 1. 技术栈

- API：Node.js + Express + PostgreSQL（`pg`）
- AI 服务：FastAPI
- Workflow Worker：Python + RabbitMQ + PostgreSQL
- 数据库：PostgreSQL 16
- 缓存：Redis 7
- 消息队列：RabbitMQ
- 反向代理：Nginx（生产）
- 容器：Docker Compose

---

## 2. 目录结构

```text
.
├── ai_service/                  # AI 能力服务
├── backend/api/                 # API 服务（含鉴权、园林展会接口）
├── db/
│   ├── schema.sql               # PostgreSQL 初始化 schema（含园林展会表）
│   └── garden_expo_schema.sql   # 园林展会 MySQL 参考 schema（方案文档配套）
├── workflow_service/            # 可运行 worker（消费 RabbitMQ，回写 tasks）
├── deploy/nginx/nginx.conf      # 生产 Nginx 配置（HTTPS + 反向代理）
├── docker-compose.yml           # 开发环境编排
├── docker-compose.prod.yml      # 生产环境编排
├── .env.example                 # 环境变量模板
├── .env.development             # 开发示例变量
└── .env.production              # 生产示例变量
```

---

## 3. 已完成改造清单

### 3.1 后端持久化

- `backend/api` 已移除内存数组，全部改为 PostgreSQL 持久化。
- 用户、订单、订阅、资产与园林展会业务数据均写入数据库。
- 新增数据库连接初始化与启动前检查。

### 3.2 环境配置体系

- 新增 `.env.example`。
- API 使用 `dotenv` 读取配置。
- `docker-compose.yml` / `docker-compose.prod.yml` 使用 `env_file`。

### 3.3 API 规范化

- 全量接口统一返回：`{ code, message, data }`。
- 增加统一错误处理中间件。
- 增加请求日志（morgan）。
- AI 调用均加入 try-catch 异常处理。

### 3.4 安全增强

- 增加 `helmet`。
- 增加 `express-rate-limit`（全局 + 登录注册）。
- CORS 白名单控制（`CORS_ORIGINS`）。
- JWT 异常统一处理。
- 注册/登录增加参数校验与密码强度校验。

### 3.5 Workflow 实现

- `workflow_service` 已实现可运行 worker。
- 连接 RabbitMQ 队列消费任务。
- 支持 `generate_copy` / `generate_image` / `generate_video`。
- 调用 `ai_service` 后回写 `tasks` 表。

### 3.6 生产部署能力

- 新增 `deploy/nginx/nginx.conf`：反向代理 `/api` 与 `/ai`。
- 新增 `docker-compose.prod.yml`。
- 生产环境不暴露数据库端口。
- 增加 healthcheck 与 restart 策略。
- 预留 HTTPS 证书挂载路径：`deploy/certs/`。

### 3.7 园林展会业务接口（Node.js 实现）

已实现并接入 PostgreSQL：

- `GET /api/app/home/config`
- `GET /api/app/activities`
- `GET /api/app/activities/:id`
- `GET /api/app/submission/config`
- `POST /api/app/submissions`
- `GET /api/app/submissions/my`
- `GET /api/app/user/profile`
- `PUT /api/app/user/profile`
- `POST /api/app/tickets/claim`
- `GET /api/app/tickets/my`

---

## 4. 开发环境启动

### 4.1 一键启动

```bash
docker compose up -d --build
```

### 4.2 健康检查

```bash
curl http://localhost:3000/health
curl http://localhost:8000/health
```

---

## 5. 生产环境启动

> 先准备证书文件：
> - `deploy/certs/fullchain.pem`
> - `deploy/certs/privkey.pem`

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 6. 接口文档（核心）

### 6.1 认证

- `POST /api/auth/register`
- `POST /api/auth/login`

### 6.2 AutoContent

- `GET /api/user/profile`
- `POST /api/payment/create-order`
- `POST /api/payment/wechat-notify`
- `POST /api/payment/alipay-notify`
- `POST /api/ai/generate-copy`
- `POST /api/ai/generate-image`
- `POST /api/ai/generate-video`
- `GET /api/assets`
- `POST /api/assets/delete`

### 6.3 园林展会

- `GET /api/app/home/config`
- `GET /api/app/activities`
- `GET /api/app/activities/:id`
- `GET /api/app/submission/config`
- `POST /api/app/submissions`
- `GET /api/app/submissions/my`
- `GET /api/app/user/profile`
- `PUT /api/app/user/profile`
- `POST /api/app/tickets/claim`
- `GET /api/app/tickets/my`

---

## 7. 常见问题

1. **npm install 403**：通常是当前环境网络策略导致无法访问 npm registry。
2. **数据库连接失败**：确认 `DATABASE_URL`、postgres 容器健康状态。
3. **CORS 被拦截**：检查 `CORS_ORIGINS` 是否包含前端域名。
4. **HTTPS 启动失败**：检查 `deploy/certs/` 证书路径与文件权限。

---

## 8. 园林展会设计方案文档

- 方案文档：`docs/garden-expo-solution.md`
- 参考 SQL：`db/garden_expo_schema.sql`
