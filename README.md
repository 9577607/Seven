# AutoContent

AutoContent 是一个面向 iOS/Android 的 AI 内容自动生产与工作流管理平台。目标是让用户输入一个主题后，自动完成文案、图片、视频、字幕、封面生成，并支持批量生产和一键发布。

## 技术栈

- **移动端**: Flutter（iOS + Android）
- **后端 API**: Node.js + Express（JWT 鉴权）
- **AI 服务**: Python + FastAPI（文案/图片/视频能力封装）
- **数据库**: PostgreSQL
- **缓存与队列**: Redis + RabbitMQ（可切换 Redis Queue）
- **对象存储**: AWS S3 / Cloudflare R2
- **容器化**: Docker + Docker Compose

## 核心模块

1. 用户系统（注册、登录、会员状态）
2. 会员与支付（微信/支付宝，订单与订阅）
3. AI 文案生成
4. AI 图片生成
5. AI 视频生成
6. 视频处理（字幕、配音、剪辑）
7. 素材库
8. 工作流引擎
9. 项目系统
10. 批量生成系统
11. 发布系统（抖音/TikTok/YouTube/小红书）
12. 移动端页面体系
13. 任务队列系统
14. 安全系统（JWT、签名、限流、HTTPS）
15. 日志系统
16. 部署系统
17. 可扩展能力（数字人、直播、营销分析等）

## 快速启动

```bash
docker compose up -d --build
```

服务默认端口：

- API: `http://localhost:3000`
- AI Service: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672`（管理台 `15672`）

## 当前仓库内容

本仓库当前提供 **Phase-1 架构骨架**：

- 服务编排 `docker-compose.yml`
- API 服务基础路由与鉴权中间件
- AI 服务基础接口
- 数据库初始化脚本（包含用户、订单、订阅、素材、工作流、项目、任务、队列、日志）
- 架构与实施文档

详见 `docs/architecture.md`。


## 预览与联调

请参考 `docs/preview.md`。
