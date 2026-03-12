# AutoContent 预览与联调说明

## 1) 一键容器预览（推荐）

```bash
docker compose up -d --build
```

## 2) 页面访问

- 用户前端（中文）：<http://localhost:3001>
- 后台管理（中文）：<http://localhost:3002>
- API 健康检查：<http://localhost:3000/health>
- AI 健康检查：<http://localhost:8000/health>

## 3) AI 接口预览

### 文案生成

```bash
curl -X POST http://localhost:8000/generate/copy \
  -H 'Content-Type: application/json' \
  -d '{"topic":"好运金莲花","style":"治愈风","platform":"抖音","length":"30s","language":"zh"}'
```

### 图片生成

```bash
curl -X POST http://localhost:8000/generate/image \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"golden lotus, zen style","style":"插画","ratio":"9:16","resolution":"1024x1792"}'
```

### 视频生成

```bash
curl -X POST http://localhost:8000/generate/video \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"zen lotus in sunlight","duration":"10","ratio":"9:16","fps":30,"style":"电影感","camera_motion":"推进"}'
```

## 4) 无 Docker 本地运行（可选）

### AI 服务

```bash
pip install -r ai_service/requirements.txt
uvicorn ai_service.main:app --host 0.0.0.0 --port 8000
```

### API 服务

```bash
cd backend/api
npm install
AI_SERVICE_URL=http://localhost:8000 JWT_SECRET=autocontent_dev_secret npm start
```

### 用户前端

```bash
cd frontend
npm install
npm run dev
```

### 后台管理

```bash
cd admin
npm install
npm run dev
```
