# AutoContent 预览与联调说明

当前仓库可通过以下方式预览：

## 1) 一键容器预览（推荐）

```bash
docker compose up -d --build
```

然后检查健康状态：

```bash
curl http://localhost:3000/health
curl http://localhost:8000/health
```

## 2) 本地进程预览（无 Docker）

### 启动 AI 服务

```bash
pip install -r ai_service/requirements.txt
uvicorn ai_service.main:app --host 0.0.0.0 --port 8000
```

### 启动 API 服务

```bash
cd backend/api
npm install
AI_SERVICE_URL=http://localhost:8000 JWT_SECRET=autocontent_dev_secret npm start
```

## 3) 核心接口快速预览

### 3.1 注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@autocontent.ai","password":"123456","nickname":"demo"}'
```

### 3.2 登录（获取 token）

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@autocontent.ai","password":"123456"}' | python -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

### 3.3 文案生成

```bash
curl -X POST http://localhost:3000/api/ai/generate-copy \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"topic":"好运金莲花","style":"佛系治愈","platform":"TikTok","length":"30s","language":"zh"}'
```

### 3.4 图片生成

```bash
curl -X POST http://localhost:3000/api/ai/generate-image \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"golden lotus, zen style","style":"illustration","ratio":"9:16","resolution":"1024x1792"}'
```

### 3.5 视频生成

```bash
curl -X POST http://localhost:3000/api/ai/generate-video \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"zen lotus in sunlight","duration":"10","ratio":"9:16","fps":30,"style":"cinematic","camera_motion":"push_in"}'
```

### 3.6 素材列表

```bash
curl -X GET http://localhost:3000/api/assets \
  -H "Authorization: Bearer $TOKEN"
```

## 4) 常见问题

- 若 `npm install` 失败为 403，通常是网络/代理策略限制，建议在可访问 npm registry 的网络环境运行。
- 若 `pip install` 失败为 proxy 403，建议在可访问 PyPI 的网络环境运行或切换内网镜像源。
