import path from "node:path";
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// .env.local を優先して読み込む（dotenv は既存の変数を上書きしない）
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // fallback

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DIRECT_URL });
      return new PrismaPg(pool);
    },
  },
});
