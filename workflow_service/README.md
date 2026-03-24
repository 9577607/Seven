# workflow_service

可运行的工作流任务消费者服务。

## 能力

- 连接 RabbitMQ（`WORKFLOW_QUEUE`）
- 消费任务类型：
  - `generate_copy`
  - `generate_image`
  - `generate_video`
- 调用 `ai_service` 获取结果
- 回写 PostgreSQL `tasks` 表状态与结果

## 环境变量

- `DATABASE_URL`
- `RABBITMQ_URL`
- `WORKFLOW_QUEUE`
- `AI_SERVICE_URL`

## 运行

```bash
python worker.py
```

或使用 Docker Compose：

```bash
docker compose up -d workflow_service
```
