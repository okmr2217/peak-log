import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(h: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d;
}

async function main() {
  console.log("🌱 シード開始...");

  // ユーザー作成
  const demoEmail = "demo@example.com";
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (existingUser) {
    console.log(`  ⏭️  ユーザースキップ（既存）: ${demoEmail}`);
    console.log("✨ シード完了（既存ユーザーをスキップ）");
    return;
  }

  const hashed = await hashPassword("password123");
  const userId = randomUUID();

  await prisma.user.create({
    data: {
      id: userId,
      name: "デモユーザー",
      email: demoEmail,
      emailVerified: true,
      accounts: {
        create: {
          id: randomUUID(),
          accountId: demoEmail,
          providerId: "credential",
          password: hashed,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  });
  console.log(`  ✅ ユーザー作成: ${demoEmail} / password123`);

  // アクティビティ作成
  console.log("🏷️ アクティビティ作成...");
  const activitiesData = [
    { emoji: "⚡", name: "ピーク体験", color: "#7C4DFF", sortOrder: 0 },
    { emoji: "🤝", name: "人と過ごす", color: "#00E5FF", sortOrder: 1 },
    { emoji: "🚶", name: "お出かけ", color: "#FF6B6B", sortOrder: 2 },
    { emoji: "💻", name: "創作・制作", color: "#4DFF91", sortOrder: 3 },
    { emoji: "🏃", name: "体を動かす", color: "#FF9D4D", sortOrder: 4 },
    { emoji: "📚", name: "読書・学習", color: "#FFD700", sortOrder: 5 },
    { emoji: "🎵", name: "音楽・エンタメ", color: "#FF69B4", sortOrder: 6 },
  ];

  const activities = await Promise.all(
    activitiesData.map((a) =>
      prisma.activity.create({
        data: { ...a, userId },
      })
    )
  );

  const [peak, social, outing, creative, exercise, study, entertainment] = activities;
  console.log(`  ✅ アクティビティ作成: ${activities.length}件`);

  // ログ + 余韻データ作成
  console.log("📝 ログ・余韻作成...");

  const logsData: Array<{
    activityId: string;
    performedAt: Date;
    reflection?: {
      excitement: number;
      achievement: number;
      wantAgain: boolean;
      note: string;
    };
  }> = [
    // 今日
    {
      activityId: exercise.id,
      performedAt: hoursAgo(2),
      reflection: { excitement: 4, achievement: 5, wantAgain: true, note: "10kmラン完走！自己ベスト更新。ゴール直前の追い込みが最高だった。" },
    },
    {
      activityId: creative.id,
      performedAt: hoursAgo(5),
    },

    // 昨日
    {
      activityId: social.id,
      performedAt: daysAgo(1),
      reflection: { excitement: 5, achievement: 4, wantAgain: true, note: "久しぶりに大学の友人と会った。深夜まで語り合えた最高の夜。" },
    },
    {
      activityId: study.id,
      performedAt: daysAgo(1),
      reflection: { excitement: 3, achievement: 4, wantAgain: true, note: "Rustの所有権をようやく理解できた気がする。" },
    },

    // 2日前
    {
      activityId: peak.id,
      performedAt: daysAgo(2),
      reflection: { excitement: 5, achievement: 5, wantAgain: true, note: "初めてのクライミングジム体験。難しかったけど課題をクリアした瞬間の達成感がすごい！" },
    },
    {
      activityId: outing.id,
      performedAt: daysAgo(2),
      reflection: { excitement: 4, achievement: 3, wantAgain: true, note: "近所の公園でぼーっとする時間。思考が整理された。" },
    },

    // 3日前
    {
      activityId: creative.id,
      performedAt: daysAgo(3),
      reflection: { excitement: 4, achievement: 5, wantAgain: true, note: "Peak Logのアクティビティ一覧UIが思い通りに仕上がった。" },
    },

    // 5日前
    {
      activityId: exercise.id,
      performedAt: daysAgo(5),
      reflection: { excitement: 3, achievement: 4, wantAgain: true, note: "ジムで胸トレ。ベンチプレス80kg×5回達成。" },
    },
    {
      activityId: entertainment.id,
      performedAt: daysAgo(5),
      reflection: { excitement: 5, achievement: 2, wantAgain: true, note: "映画「オッペンハイマー」をやっと観た。圧倒的な映像体験。" },
    },

    // 7日前
    {
      activityId: social.id,
      performedAt: daysAgo(7),
      reflection: { excitement: 4, achievement: 3, wantAgain: true, note: "家族でホットプレート焼き肉。みんなの笑顔が最高のご馳走。" },
    },
    {
      activityId: study.id,
      performedAt: daysAgo(7),
    },

    // 10日前
    {
      activityId: outing.id,
      performedAt: daysAgo(10),
      reflection: { excitement: 5, achievement: 4, wantAgain: true, note: "高尾山ハイキング。山頂からの景色と達成感が最高だった。次は奥高尾まで行きたい。" },
    },
    {
      activityId: exercise.id,
      performedAt: daysAgo(10),
      reflection: { excitement: 3, achievement: 3, wantAgain: true, note: "ランニング5km。少し疲れ気味だったが走り切れた。" },
    },

    // 14日前
    {
      activityId: peak.id,
      performedAt: daysAgo(14),
      reflection: { excitement: 5, achievement: 5, wantAgain: true, note: "人生初の富士登山！御来光は言葉を失う美しさだった。死ぬまでに絶対もう一度登る。" },
    },
    {
      activityId: creative.id,
      performedAt: daysAgo(14),
      reflection: { excitement: 4, achievement: 4, wantAgain: true, note: "Yarukotoにダークモード機能を追加完了。思い通りの実装ができた。" },
    },

    // 20日前
    {
      activityId: entertainment.id,
      performedAt: daysAgo(20),
      reflection: { excitement: 4, achievement: 2, wantAgain: true, note: "お気に入りのアーティストのライブ。生演奏は格が違う。" },
    },
    {
      activityId: social.id,
      performedAt: daysAgo(20),
      reflection: { excitement: 4, achievement: 3, wantAgain: true, note: "職場の新メンバーと歓迎会。いい人たちで安心した。" },
    },

    // 25日前
    {
      activityId: study.id,
      performedAt: daysAgo(25),
      reflection: { excitement: 4, achievement: 5, wantAgain: true, note: "技術書「リファクタリング」読了。コードへの見方が変わった気がする。" },
    },
    {
      activityId: exercise.id,
      performedAt: daysAgo(25),
      reflection: { excitement: 3, achievement: 4, wantAgain: true, note: "スイミング初体験。息継ぎが難しいがクロール25m泳げた。" },
    },

    // 30日前
    {
      activityId: outing.id,
      performedAt: daysAgo(30),
      reflection: { excitement: 5, achievement: 3, wantAgain: true, note: "箱根温泉旅行。露天風呂から見た紅葉が最高に綺麗だった。" },
    },
    {
      activityId: creative.id,
      performedAt: daysAgo(30),
    },
  ];

  for (const { activityId, performedAt, reflection } of logsData) {
    const log = await prisma.log.create({
      data: { userId, activityId, performedAt },
    });

    if (reflection) {
      await prisma.reflection.create({
        data: {
          userId,
          logId: log.id,
          ...reflection,
        },
      });
    }
  }

  console.log(`  ✅ ログ作成: ${logsData.length}件`);
  console.log(`  ✅ 余韻作成: ${logsData.filter((l) => l.reflection).length}件`);
  console.log("\n🎉 シード完了!");
  console.log("\n📋 デモアカウント:");
  console.log("   Email: demo@example.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ シード失敗:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
