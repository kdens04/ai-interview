"use client";

import { useEffect, useRef, useState } from "react";
import { getApiKey, maskApiKey, openApiKeySettings, useApiKey } from "@/lib/api-key";
import {
  API_KEY_HEADER,
  DEFAULT_QUESTIONS,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type ChatMessage,
  type Evaluation,
  type InterviewResponse,
} from "@/lib/interview";

type Stage = "setup" | "interview" | "result";

// 範例職缺，讓使用者一鍵帶入試用
const SAMPLE_JDS = [
  {
    label: "前端工程師",
    text: "前端工程師\n- 2 年以上 React / TypeScript 開發經驗\n- 熟悉 Next.js、SSR 與前端效能優化\n- 能與設計師、後端協作，重視使用者體驗與程式品質",
  },
  {
    label: "產品經理",
    text: "產品經理（B2B SaaS）\n- 負責產品規劃、需求訪談與優先順序排定\n- 能以數據驗證假設，追蹤關鍵指標\n- 跨部門溝通協調工程、設計、業務團隊",
  },
  {
    label: "資料分析師",
    text: "資料分析師\n- 熟悉 SQL、Python（pandas）與資料視覺化工具\n- 能設計 A/B 測試並解讀結果\n- 將分析洞察轉化為商業建議，向主管簡報",
  },
];

export default function InterviewPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const apiKey = useApiKey();

  useEffect(() => {
    if (stage !== "setup") bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, loading, stage]);

  async function callInterview(nextHistory: ChatMessage[]) {
    // BYOK：每次呼叫都從 localStorage 讀取最新的金鑰
    const key = getApiKey();
    if (!key) {
      setError("請先設定你的 OpenAI API 金鑰");
      openApiKeySettings();
      return false;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json", [API_KEY_HEADER]: key },
        body: JSON.stringify({ jobDescription, totalQuestions, history: nextHistory }),
      });
      const data = await res.json();
      if (!res.ok) {
        // 金鑰缺少或無效：直接打開設定視窗讓使用者更換
        if (res.status === 401) openApiKeySettings();
        throw new Error(data.error ?? "發生錯誤");
      }

      const result = data as InterviewResponse;
      if (result.type === "question") {
        setHistory([...nextHistory, { role: "interviewer", content: result.content }]);
        setQuestionNumber(result.questionNumber);
      } else {
        setHistory(nextHistory);
        setEvaluation(result.evaluation);
        setStage("result");
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "發生錯誤");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function startInterview() {
    if (!jobDescription.trim()) return;
    setStage("interview");
    setHistory([]);
    const ok = await callInterview([]);
    if (!ok) setStage("setup");
  }

  async function submitAnswer() {
    const text = answer.trim();
    if (!text || loading) return;
    const nextHistory: ChatMessage[] = [...history, { role: "candidate", content: text }];
    setHistory(nextHistory);
    setAnswer("");
    const ok = await callInterview(nextHistory);
    if (!ok) {
      setHistory(history);
      setAnswer(text);
    }
  }

  function restart() {
    setStage("setup");
    setHistory([]);
    setAnswer("");
    setQuestionNumber(0);
    setEvaluation(null);
    setError("");
  }

  const answered = history.filter((m) => m.role === "candidate").length;
  const jobTitle = jobDescription.trim().split("\n")[0].slice(0, 30);

  return (
    <main className="grain flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-4 text-sm"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">!</span>
            {error}
          </div>
        )}

        {stage === "setup" && (
          <SetupView
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            totalQuestions={totalQuestions}
            setTotalQuestions={setTotalQuestions}
            apiKey={apiKey}
            loading={loading}
            onStart={startInterview}
          />
        )}

        {stage !== "setup" && (
          <div className="mx-auto max-w-3xl">
            {/* 面試室標頭：職缺 + 進度 */}
            <div className="sticky top-16 z-10 -mx-4 mb-6 border-b border-line bg-paper/85 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    {stage === "result" ? "Interview complete" : `Question ${Math.max(questionNumber, 1)} / ${totalQuestions}`}
                  </div>
                  <div className="mt-1 truncate font-display text-xl">{jobTitle || "模擬面試"}</div>
                </div>
                <div className="flex shrink-0 gap-1.5" aria-label={`進度：已回答 ${answered} / ${totalQuestions} 題`}>
                  {Array.from({ length: totalQuestions }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-4 rounded-full transition-colors sm:w-6 ${
                        i < answered ? "bg-accent" : i === answered && stage === "interview" ? "bg-ink" : "bg-line"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 對話 */}
            <div className="flex flex-col gap-5">
              {history.map((m, i) => (
                <Message key={i} message={m} />
              ))}
              {loading && (
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Avatar />
                  <span className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3">
                    <Dot delay="0ms" />
                    <Dot delay="150ms" />
                    <Dot delay="300ms" />
                    <span className="ml-2">{answered >= totalQuestions ? "面試官正在評分…" : "面試官思考中…"}</span>
                  </span>
                </div>
              )}
            </div>

            {/* 回答輸入框 */}
            {stage === "interview" && questionNumber > 0 && (
              <div className="sticky bottom-4 mt-8">
                <div className="rounded-3xl border border-line bg-surface p-3 shadow-[0_20px_50px_-25px_rgba(22,21,15,0.4)] focus-within:border-ink">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer();
                    }}
                    rows={4}
                    disabled={loading}
                    aria-label="你的回答"
                    placeholder="輸入你的回答……試著具體說明情境、你的做法與結果。"
                    className="w-full resize-none bg-transparent px-3 py-2 leading-relaxed outline-none placeholder:text-muted/70 disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between gap-3 px-2 pt-1">
                    <span className="hidden font-mono text-xs text-muted sm:inline">⌘ / Ctrl + Enter 送出</span>
                    <button
                      onClick={submitAnswer}
                      disabled={!answer.trim() || loading}
                      className="ml-auto inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-ink transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
                    >
                      {answered + 1 >= totalQuestions ? "送出並查看評分" : "送出回答"}
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stage === "result" && evaluation && <EvaluationReport evaluation={evaluation} onRestart={restart} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </main>
  );
}

/* ───────────────────────── 設定畫面 ───────────────────────── */

function SetupView({
  jobDescription,
  setJobDescription,
  totalQuestions,
  setTotalQuestions,
  apiKey,
  loading,
  onStart,
}: {
  jobDescription: string;
  setJobDescription: (v: string) => void;
  totalQuestions: number;
  setTotalQuestions: (n: number) => void;
  apiKey: string | null;
  loading: boolean;
  onStart: () => void;
}) {
  const clamp = (n: number) => Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, n));

  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <div className="animate-rise lg:pt-6">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Step 1 · Setup</span>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          今天要面試
          <br />
          <span className="italic text-accent">哪個職位？</span>
        </h1>
        <p className="mt-5 max-w-md leading-relaxed text-muted">
          把職缺描述貼進來，越完整，題目越貼近真實面試。選好題數後就可以開始。
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted">
          {["面試官一次問一題，可能會追問", "全部答完後產生評分報告", "對話不會被保存"].map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-accent" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="animate-rise rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_60px_-35px_rgba(22,21,15,0.35)] [animation-delay:100ms] sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <label htmlFor="jd" className="font-bold">
            職缺描述
          </label>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted">試試範例：</span>
            {SAMPLE_JDS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setJobDescription(s.text)}
                className="rounded-full border border-line px-2.5 py-0.5 text-xs transition-colors hover:border-accent hover:text-accent"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          id="jd"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
          placeholder={"例如：\n前端工程師\n- 熟悉 React、TypeScript、Next.js\n- 2 年以上經驗……"}
          className="mt-3 w-full resize-y rounded-2xl border border-line bg-paper p-4 leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6">
          <div>
            <div className="font-bold">題數</div>
            <div className="mt-0.5 text-xs text-muted">
              {MIN_QUESTIONS}–{MAX_QUESTIONS} 題，約每題 1–2 分鐘
            </div>
          </div>
          <div className="flex items-center rounded-full border border-line bg-paper p-1">
            <button
              type="button"
              aria-label="減少題數"
              onClick={() => setTotalQuestions(clamp(totalQuestions - 1))}
              disabled={totalQuestions <= MIN_QUESTIONS}
              className="grid size-9 place-items-center rounded-full text-lg transition-colors hover:bg-paper-2 disabled:opacity-30"
            >
              −
            </button>
            <span className="w-12 text-center font-display text-2xl tabular-nums" aria-live="polite">
              {totalQuestions}
            </span>
            <button
              type="button"
              aria-label="增加題數"
              onClick={() => setTotalQuestions(clamp(totalQuestions + 1))}
              disabled={totalQuestions >= MAX_QUESTIONS}
              className="grid size-9 place-items-center rounded-full text-lg transition-colors hover:bg-paper-2 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        {/* BYOK 金鑰狀態 */}
        <div
          className={`mt-6 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${
            apiKey === "" ? "border-accent/40 bg-accent-soft" : "border-line bg-paper"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`size-2 shrink-0 rounded-full ${apiKey === null ? "bg-line" : apiKey ? "bg-emerald-500" : "bg-accent"}`}
            />
            {apiKey === null ? (
              <span className="text-muted">讀取金鑰設定中…</span>
            ) : apiKey ? (
              <span className="truncate">
                使用你的 OpenAI 金鑰 <span className="font-mono text-muted">{maskApiKey(apiKey)}</span>
              </span>
            ) : (
              <span>需要你自己的 OpenAI API 金鑰才能開始</span>
            )}
          </div>
          <button
            type="button"
            onClick={openApiKeySettings}
            className="shrink-0 font-medium text-accent underline-offset-2 hover:underline"
          >
            {apiKey ? "更換" : "設定金鑰"}
          </button>
        </div>

        <button
          onClick={onStart}
          disabled={!jobDescription.trim() || !apiKey || loading}
          className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-medium text-white shadow-[0_10px_30px_-10px_var(--accent)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
        >
          {loading ? "面試官準備中…" : "進入面試室"}
          {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── 對話元件 ───────────────────────── */

function Avatar() {
  return (
    <span className="grid size-9 shrink-0 -rotate-3 place-items-center rounded-lg border-2 border-accent bg-surface font-display text-sm font-bold text-accent">
      官
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return <span className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: delay }} />;
}

function Message({ message }: { message: ChatMessage }) {
  if (message.role === "interviewer") {
    return (
      <div className="flex animate-rise items-start gap-3">
        <Avatar />
        <div className="max-w-[85%]">
          <div className="mb-1 font-mono text-xs text-muted">面試官</div>
          <div className="rounded-2xl rounded-tl-sm border border-line bg-surface px-5 py-4 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex animate-rise justify-end">
      <div className="max-w-[85%]">
        <div className="mb-1 text-right font-mono text-xs text-muted">你</div>
        <div className="rounded-2xl rounded-tr-sm bg-ink px-5 py-4 leading-relaxed whitespace-pre-wrap text-on-ink">
          {message.content}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 評分報告 ───────────────────────── */

function scoreLabel(score: number) {
  if (score >= 85) return "表現優異";
  if (score >= 70) return "表現良好";
  if (score >= 55) return "尚可，仍有進步空間";
  return "需要加強";
}

function EvaluationReport({ evaluation, onRestart }: { evaluation: Evaluation; onRestart: () => void }) {
  return (
    <section className="mt-12 animate-rise" aria-label="評分報告">
      {/* 總分 */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-on-ink sm:p-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
          <div className="grid size-36 shrink-0 rotate-[-8deg] place-items-center rounded-full border-[3px] border-accent text-accent">
            <div className="grid size-[120px] place-items-center rounded-full border border-dashed border-accent/70 text-center">
              <div>
                <div className="font-display text-5xl leading-none">{evaluation.overallScore}</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.25em]">/ 100</div>
              </div>
            </div>
          </div>
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Interview Report</span>
            <h2 className="mt-2 font-display text-3xl">{scoreLabel(evaluation.overallScore)}</h2>
            <p className="mt-3 leading-relaxed text-on-ink/75">{evaluation.summary}</p>
          </div>
        </div>
      </div>

      {/* 優點 / 改進 */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ListCard title="優點" items={evaluation.strengths} marker="＋" />
        <ListCard title="改進建議" items={evaluation.improvements} marker="→" accent />
      </div>

      {/* 逐題 */}
      <h3 className="mt-12 font-display text-3xl">逐題回饋</h3>
      <div className="mt-6 space-y-4">
        {evaluation.questions?.map((q, i) => (
          <article key={i} className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Question {i + 1}</div>
                <h4 className="mt-2 font-display text-xl leading-snug sm:text-2xl">{q.question}</h4>
              </div>
              <div className="shrink-0 rounded-full border-2 border-accent px-3 py-1 font-display text-xl text-accent tabular-nums">
                {q.score}/10
              </div>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-paper-2">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, q.score * 10))}%` }} />
            </div>
            <p className="mt-5 leading-relaxed text-ink-soft">{q.feedback}</p>

            {(q.keyPoints?.length > 0 || q.exampleAnswer) && (
              <details className="group mt-6 rounded-2xl border border-line bg-paper" open>
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-bold">
                  比較好的回答方式
                  <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="border-t border-line px-5 pt-4 pb-5">
                  {q.keyPoints?.length > 0 && (
                    <>
                      <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">作答重點</div>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                        {q.keyPoints.map((k, j) => (
                          <li key={j} className="flex gap-3">
                            <span className="font-mono text-xs leading-6 text-muted">{String(j + 1).padStart(2, "0")}</span>
                            {k}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {q.exampleAnswer && (
                    <>
                      <div className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent">示範回答</div>
                      <blockquote className="mt-3 border-l-2 border-accent pl-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                        {q.exampleAnswer}
                      </blockquote>
                    </>
                  )}
                </div>
              </details>
            )}
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted">示範回答中的情境與數據為 AI 舉例，請替換成你自己的真實經歷。</p>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-white transition-transform hover:-translate-y-0.5"
        >
          再練一場
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </section>
  );
}

function ListCard({ title, items, marker, accent }: { title: string; items: string[]; marker: string; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border p-6 ${accent ? "border-accent/30 bg-accent-soft" : "border-line bg-surface"}`}>
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed">
        {items?.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className={`shrink-0 font-bold ${accent ? "text-accent" : "text-muted"}`}>{marker}</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
