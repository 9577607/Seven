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

## 升级后的人工分步骤内容工作流（中文）

用户端地址：<http://localhost:3001>

流程：

1. 主题输入（示例：金莲花好运视频）
2. 文案选择：生成 5 条候选文案，用户选择 1 条
3. 图片选择：生成 4~6 张候选图片，用户选择 1 张
4. 视频生成：生成多个模板版本（9:16、带字幕版、无字幕版、不同音乐版）并选择 1 个
5. 字幕处理：自动字幕 / 手动字幕 / 无字幕
6. 导出视频：下载最终视频，并提示“手动发布到抖音”（不自动发布）

每一步必须先选择结果，才能进入下一步。

## 后台管理系统（中文）

后台地址：<http://localhost:3002>

模块：

- 仪表盘
- 用户管理
- 内容生产记录
- 任务队列
- 素材库
- 工作流管理
- 系统日志

其中“内容生产记录”会展示每次生产的主题、文案、图片、视频、字幕模式和时间。

## Docker Compose 一键启动

```bash
docker compose up -d --build
```

启动后访问：

- 用户端：<http://localhost:3001>
- 后台管理：<http://localhost:3002>
- API 健康检查：<http://localhost:3000/health>
- AI 健康检查：<http://localhost:8000/health>
