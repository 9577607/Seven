# AutoContent 架构设计（Phase-1）

## 1. 总体架构

- `mobile_app`（Flutter）调用 `backend/api`
- `backend/api` 负责用户鉴权、订单、项目、素材、发布等业务逻辑
- `ai_service` 负责 AI 生成能力编排（文案、图片、视频）
- `workflow_service` 负责工作流执行与队列消费（后续扩展）
- `postgres` 存储业务数据
- `redis` 存储会话、限流、短期任务状态
- `rabbitmq` 处理耗时任务（批量生成、视频处理等）

## 2. API 规划

### 用户系统
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile`

### 支付系统
- `POST /api/payment/create-order`
- `POST /api/payment/wechat-notify`
- `POST /api/payment/alipay-notify`

### AI 能力
- `POST /api/ai/generate-copy`
- `POST /api/ai/generate-image`
- `POST /api/ai/generate-video`

### 视频处理
- `POST /api/video/subtitle`
- `POST /api/video/voice`
- `POST /api/video/edit`

### 素材库
- `GET /api/assets`
- `POST /api/assets/delete`

### 发布系统
- `POST /api/publish`

## 3. 会员策略

- Free：每天 3 视频、10 图片
- Pro 月：每天 30 视频、100 图片
- Pro 季：每天 50 视频、200 图片
- Pro 年：每天 100 视频、500 图片

建议在 `subscriptions` 与 `users.plan` 双写；`users.plan` 作为快速读取字段，`subscriptions` 作为权威账本。

## 4. 任务执行链路（批量生产）

1. 用户提交关键词列表创建项目
2. API 生成 `projects`、`tasks` 记录并投递消息到 MQ
3. workflow worker 消费任务，按节点执行：
   - `generate_copy`
   - `generate_image`
   - `generate_video`
   - `subtitle`
   - `voice`
   - `export`
4. 每一步输出写入 `assets` 与 `tasks.result`
5. 项目状态汇总为 `completed/failed`

## 5. 安全与治理

- JWT 鉴权（Access Token）
- API Rate Limit（按用户 + IP）
- HTTPS 强制
- 支付回调签名校验
- 操作日志入库 `logs`

## 6. 后续里程碑

- Phase-2: 引入真实 AI Provider（LLM、文生图、文生视频）
- Phase-3: 工作流可视化编排（拖拽）
- Phase-4: 发布平台 SDK 统一接入
- Phase-5: AI 数字人 / AI 直播扩展
