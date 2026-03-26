import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.notices.create({
    data: {
      title: '欢迎使用玄镜运势',
      summary: '娱乐测算服务上线',
      content: '本内容仅供娱乐与参考，请理性看待。',
      status: 1,
    },
  });
}

main().finally(async () => prisma.$disconnect());
