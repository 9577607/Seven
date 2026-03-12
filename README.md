# AutoContent

AutoContent 是一个面向 iOS/Android/Web 的 AI 内容自动生产与工作流管理平台。

## 技术栈

- 移动端：Flutter（iOS + Android）
- 用户前端：Next.js + TypeScript + TailwindCSS
- 后台管理：React + TypeScript + Ant Design
- 后端 API：Node.js + Express（`http://localhost:3000`）
- AI 服务：Python + FastAPI（`http://localhost:8000`）
- 数据库：PostgreSQL
- 缓存与队列：Redis + RabbitMQ

## 新增 Web 界面（全部中文）

### 用户端 Frontend

地址：<http://localhost:3001>

- 首页标题：**AI内容自动生产平台**
- 输入主题后支持：生成文案、生成图片、生成视频
- 通过 API 服务（3000）调用 AI 能力，完成 API 与 AI 的联动
- 展示文案/图片/视频结果，并提供下载按钮

### 后台 Admin

地址：<http://localhost:3002>

- 系统名称：**AutoContent 内容生产管理系统**
- 模块：仪表盘、用户管理、内容生成记录、任务队列、素材库、工作流管理、系统日志
- 仪表盘展示：今日生成数量、任务队列状态、API/AI系统运行状态、用户数量

## Docker Compose 一键启动

```bash
docker compose up -d --build
```

启动后访问：

- 用户端：<http://localhost:3001>
- 后台管理：<http://localhost:3002>
- API 健康检查：<http://localhost:3000/health>
- AI 健康检查：<http://localhost:8000/health>

## 关键 AI 接口示例

```bash
curl -X POST http://localhost:8000/generate/copy \
  -H 'Content-Type: application/json' \
  -d '{"topic":"好运金莲花","style":"治愈风","platform":"抖音","length":"30s","language":"zh"}'

curl -X POST http://localhost:8000/generate/image \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"golden lotus, zen style","style":"插画","ratio":"9:16","resolution":"1024x1792"}'

curl -X POST http://localhost:8000/generate/video \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"zen lotus in sunlight","duration":"10","ratio":"9:16","fps":30,"style":"电影感","camera_motion":"推进"}'
```
