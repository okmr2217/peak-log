import { Page } from 'playwright';
import { capture } from '../utils/capture';
import { CONFIG } from '../config';

const BASE_URL = CONFIG.BASE_URL;

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
    const createBtn = page.locator('button:has-text("記録"), button:has-text("+"), button[aria-label*="記録"], button[aria-label*="作成"]').first();
    await createBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'log-create-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-create-modal-pc failed:', e);
  }

  // reflection-modal-pc
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const reflectionBtn = page.locator('button:has-text("余韻"), button[aria-label*="余韻"], button[aria-label*="reflection"]').first();
    await reflectionBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'reflection-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ reflection-modal-pc failed:', e);
  }

  // edit-performed-at-modal (PC)
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const timeBtn = page.locator('[data-log-item] time, [data-log-item] [datetime], .log-item time').first();
    await timeBtn.click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await capture(page, 'edit-performed-at-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ edit-performed-at-modal-pc failed:', e);
  }

  // activities-list-pc
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'activities-list-pc', 'pc');
  } catch (e) {
    console.error('❌ activities-list-pc failed:', e);
  }

  // activity-create-modal (PC)
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const createBtn = page.locator('button:has-text("+"), button:has-text("追加"), button:has-text("作成"), button[aria-label*="追加"]').first();
    await createBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'activity-create-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-create-modal-pc failed:', e);
  }

  // activity-edit-modal (PC)
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('button:has-text("編集"), button[aria-label*="編集"]').first();
    await editBtn.click({ timeout: 5000 });
    await page.waitForTimeout(300);
    await capture(page, 'activity-edit-modal-pc', 'pc');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-edit-modal-pc failed:', e);
  }

  // monthly-stats-pc
  try {
    await page.goto(`${BASE_URL}/monthly`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'monthly-stats-pc', 'pc');
  } catch (e) {
    console.error('❌ monthly-stats-pc failed:', e);
  }
}

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
    const fabBtn = page.locator('button[aria-label*="記録"], button[aria-label*="add"], button.fab, button:has-text("+")').first();
    await fabBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'log-create-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ log-create-modal-mobile failed:', e);
  }

  // reflection-modal-mobile
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const reflectionBtn = page.locator('button:has-text("余韻"), button[aria-label*="余韻"]').first();
    await reflectionBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'reflection-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ reflection-modal-mobile failed:', e);
  }

  // edit-performed-at-modal (mobile)
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    const timeBtn = page.locator('[data-log-item] time, [data-log-item] [datetime], .log-item time').first();
    await timeBtn.click({ timeout: 3000 });
    await page.waitForTimeout(300);
    await capture(page, 'edit-performed-at-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ edit-performed-at-modal-mobile failed:', e);
  }

  // activities-list-mobile
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'activities-list-mobile', 'mobile');
  } catch (e) {
    console.error('❌ activities-list-mobile failed:', e);
  }

  // activity-create-modal (mobile)
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const createBtn = page.locator('button:has-text("+"), button:has-text("追加"), button:has-text("作成")').first();
    await createBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'activity-create-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-create-modal-mobile failed:', e);
  }

  // activity-edit-modal (mobile)
  try {
    await page.goto(`${BASE_URL}/activities`);
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('button:has-text("編集"), button[aria-label*="編集"]').first();
    await editBtn.click({ timeout: 5000 });
    await page.waitForTimeout(400);
    await capture(page, 'activity-edit-modal-mobile', 'mobile');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  } catch (e) {
    console.error('❌ activity-edit-modal-mobile failed:', e);
  }

  // monthly-stats-mobile
  try {
    await page.goto(`${BASE_URL}/monthly`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'monthly-stats-mobile', 'mobile');
  } catch (e) {
    console.error('❌ monthly-stats-mobile failed:', e);
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

export async function runLoginScenario(page: Page): Promise<void> {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await capture(page, 'login', 'pc');
  } catch (e) {
    console.error('❌ login failed:', e);
  }
}
