# workflow_service

预留给工作流引擎与任务消费者：

- 消费 RabbitMQ / Redis Queue 任务
- 解析 workflows.nodes + workflows.connections
- 执行 generate_copy -> generate_image -> generate_video -> subtitle -> voice -> export
- 回写 tasks / assets / logs
