import { Page } from 'playwright';
import { capture } from '../utils/capture';
import { CONFIG } from '../config';

const BASE_URL = CONFIG.BASE_URL;

/**
 * PC シナリオ一覧:
 *   home-timeline-pc        : ホーム画面（タイムライン）
 *   log-create-modal-pc     : ピーク記録モーダル（FAB クリック）
 *   log-detail-modal-pc     : 記録の詳細モーダル（操作メニュー → 詳細）
 *   log-edit-modal-pc       : 記録の編集モーダル（操作メニュー → 編集）
 *   activities-list-pc      : 活動一覧ページ
 *   activity-create-modal-pc: 活動追加モーダル（「追加」ボタン）
 *   activity-edit-modal-pc  : 活動編集モーダル（「編集」ボタン）
 *   stats-pc                : 統計ページ
 *   settings-pc             : 設定ページ
 */
export async function runPcScenarios(page: Page): Promise<void> {
  // home-timeline-pc
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'home-timeline-pc', 'pc');
  } catch (e) {
    console.error('❌ home-timeline-pc failed:', e);
  }

  // log-create-modal-pc
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const fabBtn = page.locator('button[aria-label="ピークを記録"]').first();
    await fabBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'log-create-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-create-modal-pc failed:', e);
  }

  // log-detail-modal-pc
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const menuBtn = page.locator('button[aria-label="操作メニュー"]').first();
    await menuBtn.click({ timeout: 5000 });
    await page.waitForTimeout(200);
    const detailBtn = page.locator('button:has-text("詳細")').first();
    await detailBtn.click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await capture(page, 'log-detail-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-detail-modal-pc failed:', e);
  }

  // log-edit-modal-pc
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const menuBtn = page.locator('button[aria-label="操作メニュー"]').first();
    await menuBtn.click({ timeout: 5000 });
    await page.waitForTimeout(200);
    const editBtn = page.locator('button:has-text("編集")').first();
    await editBtn.click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await capture(page, 'log-edit-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-edit-modal-pc failed:', e);
  }

  // activities-list-pc
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'activities-list-pc', 'pc');
  } catch (e) {
    console.error('❌ activities-list-pc failed:', e);
  }

  // activity-create-modal-pc
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const createBtn = page.locator('button:has-text("追加")').first();
    await createBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'activity-create-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-create-modal-pc failed:', e);
  }

  // activity-edit-modal-pc
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('button[aria-label="編集"]').first();
    await editBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'activity-edit-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-edit-modal-pc failed:', e);
  }

  // stats-pc
  try {
    await page.goto(`${BASE_URL}/stats`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'stats-pc', 'pc');
  } catch (e) {
    console.error('❌ stats-pc failed:', e);
  }

  // settings-pc
  try {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'settings-pc', 'pc');
  } catch (e) {
    console.error('❌ settings-pc failed:', e);
  }
}

/**
 * モバイル シナリオ一覧:
 *   home-timeline-mobile        : ホーム画面（タイムライン）
 *   log-create-modal-mobile     : ピーク記録モーダル（FAB クリック）
 *   log-detail-modal-mobile     : 記録の詳細モーダル（操作メニュー → 詳細）
 *   log-edit-modal-mobile       : 記録の編集モーダル（操作メニュー → 編集）
 *   activities-list-mobile      : 活動一覧ページ
 *   activity-create-modal-mobile: 活動追加モーダル（「追加」ボタン）
 *   activity-edit-modal-mobile  : 活動編集モーダル（「編集」ボタン）
 *   stats-mobile                : 統計ページ
 *   settings-mobile             : 設定ページ
 */
export async function runMobileScenarios(page: Page): Promise<void> {
  // home-timeline-mobile
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'home-timeline-mobile', 'mobile');
  } catch (e) {
    console.error('❌ home-timeline-mobile failed:', e);
  }

  // log-create-modal-mobile
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const fabBtn = page.locator('button[aria-label="ピークを記録"]').first();
    await fabBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'log-create-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-create-modal-mobile failed:', e);
  }

  // log-detail-modal-mobile
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const menuBtn = page.locator('button[aria-label="操作メニュー"]').first();
    await menuBtn.click({ timeout: 5000 });
    await page.waitForTimeout(200);
    const detailBtn = page.locator('button:has-text("詳細")').first();
    await detailBtn.click({ timeout: 3000 });
    await page.waitForTimeout(400);
    await capture(page, 'log-detail-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-detail-modal-mobile failed:', e);
  }

  // log-edit-modal-mobile
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const menuBtn = page.locator('button[aria-label="操作メニュー"]').first();
    await menuBtn.click({ timeout: 5000 });
    await page.waitForTimeout(200);
    const editBtn = page.locator('button:has-text("編集")').first();
    await editBtn.click({ timeout: 3000 });
    await page.waitForTimeout(400);
    await capture(page, 'log-edit-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-edit-modal-mobile failed:', e);
  }

  // activities-list-mobile
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'activities-list-mobile', 'mobile');
  } catch (e) {
    console.error('❌ activities-list-mobile failed:', e);
  }

  // activity-create-modal-mobile
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const createBtn = page.locator('button:has-text("追加")').first();
    await createBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'activity-create-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-create-modal-mobile failed:', e);
  }

  // activity-edit-modal-mobile
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('button[aria-label="編集"]').first();
    await editBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'activity-edit-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-edit-modal-mobile failed:', e);
  }

  // stats-mobile
  try {
    await page.goto(`${BASE_URL}/stats`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'stats-mobile', 'mobile');
  } catch (e) {
    console.error('❌ stats-mobile failed:', e);
  }

  // settings-mobile
  try {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'settings-mobile', 'mobile');
  } catch (e) {
    console.error('❌ settings-mobile failed:', e);
  }
}

/**
 * ログイン シナリオ一覧:
 *   login: ログインページ
 */
export async function runLoginScenario(page: Page): Promise<void> {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'login', 'pc');
  } catch (e) {
    console.error('❌ login failed:', e);
  }
}
