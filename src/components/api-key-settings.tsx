"use client";

import { useEffect, useRef, useState } from "react";
import { maskApiKey, onOpenApiKeySettings, openApiKeySettings, saveApiKey, useApiKey } from "@/lib/api-key";

/** Header 上的按鈕：顯示金鑰狀態，點擊打開設定 */
export function ApiKeyButton() {
  const apiKey = useApiKey();
  const ready = apiKey !== null;
  const hasKey = !!apiKey;

  return (
    <button
      type="button"
      onClick={openApiKeySettings}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm transition-colors hover:border-ink"
      aria-label={hasKey ? "API 金鑰已設定，點擊修改" : "設定 API 金鑰"}
    >
      <span
        className={`size-2 rounded-full ${!ready ? "bg-line" : hasKey ? "bg-emerald-500" : "animate-pulse bg-accent"}`}
      />
      <span className="hidden sm:inline">{ready && !hasKey ? "設定金鑰" : "API 金鑰"}</span>
      <KeyIcon className="sm:hidden" />
    </button>
  );
}

/** 全站共用的金鑰設定視窗，掛在 root layout，任何地方呼叫 openApiKeySettings() 都能打開 */
export function ApiKeyDialog() {
  const apiKey = useApiKey();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(
    () =>
      onOpenApiKeySettings(() => {
        setDraft("");
        setReveal(false);
        setNotice("");
        dialogRef.current?.showModal();
      }),
    [],
  );

  const close = () => dialogRef.current?.close();
  const trimmed = draft.trim();
  const looksValid = trimmed.startsWith("sk-") && trimmed.length >= 20;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!looksValid) return;
    saveApiKey(trimmed);
    setDraft("");
    setNotice("已儲存在這個瀏覽器中。");
    window.setTimeout(close, 700);
  }

  function clear() {
    saveApiKey("");
    setDraft("");
    setNotice("已從這個瀏覽器移除金鑰。");
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="api-key-title"
      onClick={(e) => {
        // 點擊遮罩（dialog 本身，而不是內容）時關閉
        if (e.target === dialogRef.current) close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={save} className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Settings · BYOK</span>
            <h2 id="api-key-title" className="mt-2 font-display text-3xl">
              OpenAI API 金鑰
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="關閉"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          AI 面試室使用你自己的 OpenAI 金鑰呼叫模型，費用直接計入你的 OpenAI 帳戶。
          還沒有金鑰？到{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-2"
          >
            OpenAI 平台
          </a>{" "}
          建立一把。
        </p>

        {/* 目前狀態 */}
        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-sm">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`size-2 shrink-0 rounded-full ${apiKey ? "bg-emerald-500" : "bg-accent"}`} />
            {apiKey ? (
              <span className="truncate">
                已設定 <span className="font-mono text-muted">{maskApiKey(apiKey)}</span>
              </span>
            ) : (
              <span>尚未設定金鑰</span>
            )}
          </div>
          {apiKey && (
            <button type="button" onClick={clear} className="shrink-0 text-xs text-muted underline-offset-2 hover:text-accent hover:underline">
              移除
            </button>
          )}
        </div>

        {/* 輸入新金鑰 */}
        <label htmlFor="api-key-input" className="mt-6 block font-bold">
          {apiKey ? "更換金鑰" : "輸入金鑰"}
        </label>
        <div className="mt-2 flex items-center rounded-2xl border border-line bg-paper pr-2 transition-colors focus-within:border-ink">
          <input
            id="api-key-input"
            type={reveal ? "text" : "password"}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setNotice("");
            }}
            placeholder="sk-..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-muted/60"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:bg-paper-2 hover:text-ink"
          >
            {reveal ? "隱藏" : "顯示"}
          </button>
        </div>
        {trimmed && !looksValid && <p className="mt-2 text-xs text-accent">OpenAI 金鑰通常以「sk-」開頭，請確認是否完整貼上。</p>}
        {notice && (
          <p role="status" className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            {notice}
          </p>
        )}

        <ul className="mt-6 space-y-2 rounded-2xl bg-paper-2/60 p-4 text-xs leading-relaxed text-muted">
          <li>• 金鑰只儲存在這個瀏覽器的 localStorage，換裝置或清除網站資料後需要重新設定。</li>
          <li>• 每次出題或評分時，金鑰會經由我們的伺服器轉送給 OpenAI，伺服器不會保存或記錄。</li>
          <li>• 建議在 OpenAI 後台為這把金鑰設定用量上限；在共用電腦上使用後請記得移除。</li>
        </ul>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!looksValid}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-ink transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
          >
            儲存金鑰
          </button>
        </div>
      </form>
    </dialog>
  );
}

function KeyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`size-4 ${className}`} aria-hidden>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15 19 4M17 6l2 2M15 8l2 2" strokeLinecap="round" />
    </svg>
  );
}
