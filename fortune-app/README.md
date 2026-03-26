# fortune-app

微信小程序娱乐测算 monorepo（玄镜运势）。

## 目录
- `apps/mp-wechat`：微信小程序
- `apps/admin-web`：后台管理系统（Vue3）
- `apps/api-server`：NestJS API 服务
- `packages/*`：共享配置与类型
- `deploy/*`：Docker 与 Nginx 部署

## 本地启动
```bash
pnpm install
docker compose -f deploy/docker-compose.dev.yml up -d
pnpm --filter api-server prisma:migrate
pnpm --filter api-server prisma:seed
pnpm --filter api-server dev
pnpm --filter admin-web dev
```

小程序请用微信开发者工具导入 `apps/mp-wechat`。

## 生产部署
```bash
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

## 合规声明
所有结果页默认包含：**本内容仅供娱乐与参考，请理性看待。**
