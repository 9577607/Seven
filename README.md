# AutoContent

AutoContent 是一个面向 iOS/Android/Web 的 AI 内容自动生产与工作流管理平台。目标是让用户输入一个主题后，自动完成文案、图片、视频、字幕、封面生成，并支持批量生产和一键发布。

## 技术栈

- **移动端**: Flutter（iOS + Android）
- **用户前端**: Next.js + TypeScript + TailwindCSS + Axios
- **后台管理**: React + TypeScript + Ant Design
- **后端 API**: Node.js + Express（JWT 鉴权）
- **AI 服务**: Python + FastAPI（文案/图片/视频能力封装）
- **数据库**: PostgreSQL
- **缓存与队列**: Redis + RabbitMQ（可切换 Redis Queue）
- **对象存储**: AWS S3 / Cloudflare R2
- **容器化**: Docker + Docker Compose

## 服务与端口

- API: `http://localhost:3000`
- AI Service: `http://localhost:8000`
- Frontend（用户前端）: `http://localhost:3001`
- Admin（后台管理）: `http://localhost:3002`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672`（管理台 `15672`）

## 一键启动

```bash
docker compose up -d --build
```

启动完成后访问：

- 用户前端：<http://localhost:3001>
- 后台管理：<http://localhost:3002>

## 用户前端功能（中文界面）

首页标题为 **AI内容自动生产平台**，用户输入主题后可：

- 生成文案（`POST http://localhost:8000/generate/copy`）
- 生成图片（`POST http://localhost:8000/generate/image`）
- 生成视频（`POST http://localhost:8000/generate/video`）

并展示生成结果与下载按钮。

## 后台管理功能（中文界面）

系统名称：**AutoContent 内容生产管理系统**

模块包含：

- 仪表盘
- 用户管理
- 内容生成记录
- 任务队列
- 素材库
- 工作流管理
- 系统日志

仪表盘显示：今日生成数量、任务队列状态、系统运行状态、用户数量。

## API 调用示例

### 1) 文案生成

```bash
curl -X POST http://localhost:8000/generate/copy \
  -H 'Content-Type: application/json' \
  -d '{"topic":"好运金莲花","style":"治愈风","platform":"抖音","length":"30s","language":"zh"}'
```

### 2) 图片生成

```bash
curl -X POST http://localhost:8000/generate/image \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"golden lotus, zen style","style":"插画","ratio":"9:16","resolution":"1024x1792"}'
```

### 3) 视频生成

```bash
curl -X POST http://localhost:8000/generate/video \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"zen lotus in sunlight","duration":"10","ratio":"9:16","fps":30,"style":"电影感","camera_motion":"推进"}'
```

## 目录结构

```text
.
├── frontend/              # Next.js 用户前端
├── admin/                 # React + AntD 后台管理
├── backend/api/           # Node.js API
├── ai_service/            # FastAPI AI 服务
├── db/                    # PostgreSQL 初始化脚本
├── workflow_service/      # 工作流服务占位
└── docker-compose.yml
```

## 架构与预览文档

- `docs/architecture.md`
- `docs/preview.md`
