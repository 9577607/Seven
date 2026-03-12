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

## 用户端手动工作流测试

1. 登录演示账号
2. 输入主题并生成 5 条文案，选择 1 条
3. 生成候选图片并选择 1 张
4. 生成多个视频模板并选择 1 个
5. 选择字幕处理方式
6. 导出视频（下载）并手动发布到抖音

## 后台记录查看

进入后台“内容生产记录”模块，查看每次流程保存的主题、文案、图片、视频和时间。
