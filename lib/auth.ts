import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

const DEFAULT_ACTIVITIES = [
  { sortOrder: 0, emoji: "⚡", name: "ピーク体験", color: "#7C4DFF" },
  { sortOrder: 1, emoji: "🤝", name: "人と過ごす", color: "#00E5FF" },
  { sortOrder: 2, emoji: "🚶", name: "お出かけ", color: "#FF6B6B" },
  { sortOrder: 3, emoji: "💻", name: "創作・制作", color: "#4DFF91" },
  { sortOrder: 4, emoji: "🏃", name: "体を動かす", color: "#FF9D4D" },
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 90, // 90日
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await prisma.$transaction(
              DEFAULT_ACTIVITIES.map((a) =>
                prisma.activity.create({
                  data: {
                    userId: user.id,
                    emoji: a.emoji,
                    name: a.name,
                    color: a.color,
                    sortOrder: a.sortOrder,
                  },
                }),
              ),
            );
          } catch {
            // デフォルト Activity 作成失敗はユーザー登録を妨げない
          }
        },
      },
    },
  },
});
