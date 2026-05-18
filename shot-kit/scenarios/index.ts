import type { Scenario } from "shot-kit";

const scenarios: Scenario[] = [
  {
    name: "記録 カード",
    path: "/",
    device: "mobile",
  },
  {
    name: "記録 リスト",
    path: "/?tab=compact",
    device: "mobile",
  },
  {
    name: "記録 作成モーダル",
    path: "/",
    device: "mobile",
    action: async (page) => {
      await page.locator('button[aria-label="ピークを記録"]').first().click({ timeout: 5000 });
      await page.waitForSelector('[role="dialog"]');
    },
  },
  {
    name: "記録 編集モーダル",
    path: "/",
    device: "mobile",
    action: async (page) => {
      await page.locator('button[aria-label="操作メニュー"]').first().click({ timeout: 5000 });
      await page.locator('button:has-text("記録を編集")').first().click({ timeout: 5000 });
      await page.waitForSelector('[role="dialog"]');
    },
  },
  {
    name: "記録 詳細モーダル",
    path: "/",
    device: "mobile",
    action: async (page) => {
      await page.locator('button[aria-label="操作メニュー"]').first().click({ timeout: 5000 });
      await page.locator('button:has-text("詳細を見る")').first().click({ timeout: 5000 });
      await page.waitForSelector('[role="dialog"]');
    },
  },
  {
    name: "統計",
    path: "/stats",
    device: "mobile",
  },
  {
    name: "統計 活動詳細",
    path: "/stats",
    device: "mobile",
    action: async (page) => {
      await page.locator('a[href^="/stats/"]').first().click({ timeout: 5000 });
      await page.waitForLoadState("networkidle");
    },
  },
  {
    name: "活動",
    path: "/activities",
    device: "mobile",
  },
  {
    name: "活動 作成モーダル",
    path: "/activities",
    device: "mobile",
    action: async (page) => {
      await page.locator('button:has-text("追加")').first().click({ timeout: 5000 });
      await page.waitForSelector('[role="dialog"]');
    },
  },
  {
    name: "活動 詳細モーダル",
    path: "/activities",
    device: "mobile",
    action: async (page) => {
      await page.locator("div.rounded-2xl.cursor-pointer").first().click({ timeout: 5000 });
      await page.waitForSelector('[role="dialog"]');
    },
  },
  {
    name: "活動 詳細ページ",
    path: "/activities",
    device: "mobile",
    action: async (page) => {
      await page.locator("div.rounded-2xl.cursor-pointer").first().click({ timeout: 5000 });
      await page.waitForSelector('[role="dialog"]');
      await page.locator('a:has-text("統計を見る")').first().click({ timeout: 5000 });
      await page.waitForLoadState("networkidle");
    },
  },
  {
    name: "活動 編集ページ",
    path: "/activities",
    device: "mobile",
    action: async (page) => {
      await page.locator("div.rounded-2xl.cursor-pointer").first().click({ timeout: 5000 });
      await page.waitForSelector('[role="dialog"]');
      await page.locator('button:has-text("編集")').first().click({ timeout: 5000 });
      await page.waitForLoadState("networkidle");
    },
  },
  {
    name: "メニュー",
    path: "/menu",
    device: "mobile",
  },
  {
    name: "設定",
    path: "/settings",
    device: "mobile",
  },
  {
    name: "ヘルプ",
    path: "/help",
    device: "mobile",
  },
];

export default scenarios;
