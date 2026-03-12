# AutoContent 预览指南

## 启动

```bash
docker compose up -d --build
```

## 访问地址

- 用户端 Frontend：<http://localhost:3001>
- 后台 Admin：<http://localhost:3002>
- API：<http://localhost:3000/health>
- AI：<http://localhost:8000/health>

## 说明

- Frontend 已接入 API（3000）与 AI（8000）运行状态。
- Admin 已接入 API（3000）与 AI（8000）健康状态并展示中文后台模块。
