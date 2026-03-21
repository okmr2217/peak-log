import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.log.findMany({
    select: { id: true, performedAt: true },
  });

  console.log(`Total logs: ${logs.length}`);

  for (const log of logs) {
    // 現在の値（JST as UTC）に +9時間を加えてUTCとして正しい値にする
    const corrected = new Date(log.performedAt.getTime() + 9 * 60 * 60 * 1000);
    await prisma.log.update({
      where: { id: log.id },
      data: { performedAt: corrected },
    });
  }

  console.log("Migration complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
