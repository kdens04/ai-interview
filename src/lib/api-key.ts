/**
 * BYOK（Bring Your Own Key）：使用者自己的 OpenAI API 金鑰。
 *
 * 金鑰只存在使用者瀏覽器的 localStorage，每次呼叫 /api/interview 時
 * 透過 HTTP header 帶給後端；後端只拿來轉呼叫 OpenAI，不會保存。
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ai-interview:openai-api-key";
/** 同一個分頁內金鑰變更時發出的事件（storage 事件只會通知「其他」分頁） */
const CHANGE_EVENT = "ai-interview:api-key-change";
/** 要求打開金鑰設定視窗的事件 */
const OPEN_EVENT = "ai-interview:open-api-key-settings";

export function getApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    // 無痕模式或封鎖網站資料時，localStorage 可能無法使用
    return "";
  }
}

/** 儲存金鑰；傳入空字串代表清除 */
export function saveApiKey(value: string) {
  const key = value.trim();
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 無法寫入時忽略；使用者會在下次呼叫時看到「尚未設定金鑰」
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * 讀取目前的金鑰，並在金鑰變更時自動重新渲染。
 * 伺服器端渲染時沒有 localStorage，回傳 null 代表「還不知道」，
 * 避免畫面先閃一下「尚未設定」。
 */
export function useApiKey(): string | null {
  return useSyncExternalStore<string | null>(subscribe, getApiKey, () => null);
}

/** 只顯示金鑰頭尾，例如 sk-proj…a1B2 */
export function maskApiKey(key: string) {
  if (key.length <= 12) return "•".repeat(key.length);
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

export function openApiKeySettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenApiKeySettings(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
