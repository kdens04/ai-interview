import Link from "next/link";

const ROLES = [
  "前端工程師",
  "產品經理",
  "資料分析師",
  "UI/UX 設計師",
  "後端工程師",
  "行銷企劃",
  "專案經理",
  "業務開發",
  "DevOps 工程師",
  "人資專員",
];

const FEATURES = [
  {
    no: "01",
    title: "依職缺量身出題",
    body: "貼上 JD，面試官會抓出關鍵技能與職責，混合技術題、實務經驗題與情境題，不是通用題庫。",
    wide: true,
  },
  {
    no: "02",
    title: "會追問的面試官",
    body: "回答太籠統？它會像真人一樣接著問下去，逼你把細節講清楚。",
  },
  {
    no: "03",
    title: "題數由你決定",
    body: "1 到 10 題自由設定，通勤十分鐘或完整演練都適合。",
  },
  {
    no: "04",
    title: "逐題評分＋示範回答",
    body: "每一題都有分數、具體回饋、作答重點，以及一段可以直接參考的示範回答，知道自己差在哪、怎麼改。",
    wide: true,
  },
];

const STEPS = [
  { title: "設定金鑰、貼上職缺", body: "輸入你的 OpenAI API 金鑰（只存在你的瀏覽器），再從求職網站複製 JD、選擇題數。" },
  { title: "與 AI 面試官對話", body: "一次一題，認真作答；面試官會回應並追問或出下一題。" },
  { title: "拿到評分報告", body: "總分、逐題回饋、優缺點與每題的示範回答，一頁看完。" },
];

const FAQS = [
  {
    q: "需要註冊或付費嗎？",
    a: "不需要註冊，也不用付費給我們。AI 面試室採用 BYOK（自備金鑰）模式，使用你自己的 OpenAI API 金鑰，模型費用直接計入你的 OpenAI 帳戶；一場面試通常只花費很少的額度。",
  },
  {
    q: "我的 API 金鑰安全嗎？",
    a: "金鑰只儲存在你瀏覽器的 localStorage。出題或評分時，金鑰會經由我們的伺服器轉送給 OpenAI，但伺服器不會保存或記錄。建議在 OpenAI 後台為金鑰設定用量上限，在共用電腦上使用後記得移除。",
  },
  {
    q: "我的回答會被保存嗎？",
    a: "不會。面試內容只存在你的瀏覽器分頁中，伺服器不保存任何對話，關掉頁面就消失。",
  },
  {
    q: "可以練習哪些職缺？",
    a: "任何職缺都可以。工程、設計、產品、行銷、業務……只要有職缺描述，面試官就會依內容出題。",
  },
  {
    q: "示範回答可以直接背嗎？",
    a: "建議當作架構參考。示範回答中的情境與數據是 AI 舉例，請換成你自己的真實經歷，面試時才說得自然、經得起追問。",
  },
];

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="grain relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24 lg:pb-28">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs tracking-wide text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              AI MOCK INTERVIEW
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              把下一場面試，
              <br />
              先在這裡
              <span className="relative whitespace-nowrap italic text-accent">
                練一次
                <svg
                  aria-hidden
                  viewBox="0 0 200 12"
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent/60"
                  preserveAspectRatio="none"
                >
                  <path d="M2 9 Q 50 2 100 7 T 198 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              。
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              貼上職缺描述，AI 面試官會依照職缺出題、追問細節，結束後給你逐題評分、具體建議與示範回答。
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/interview"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-white shadow-[0_8px_24px_-8px_var(--accent)] transition-transform hover:-translate-y-0.5"
              >
                開始模擬面試
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="#how" className="rounded-full px-5 py-3.5 font-medium text-ink underline-offset-4 hover:underline">
                看看怎麼運作
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs text-muted">免註冊 · 自備 OpenAI 金鑰 · 不保存對話</p>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* ── 職缺跑馬燈 ── */}
      <section aria-label="適用職缺" className="overflow-hidden border-y border-line bg-ink py-4 text-on-ink">
        <div className="flex w-max animate-marquee">
          {[...ROLES, ...ROLES].map((r, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-display text-xl whitespace-nowrap">
              {r}
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── 功能 ── */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionHeading eyebrow="Features" title="不是題庫，是一位懂你職缺的面試官" />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.no}
                className={`group rounded-3xl border border-line bg-surface p-8 transition-colors hover:border-ink ${
                  f.wide ? "md:col-span-2" : ""
                }`}
              >
                <span className="font-mono text-xs text-accent">{f.no}</span>
                <h3 className="mt-6 font-display text-2xl">{f.title}</h3>
                <p className="mt-3 max-w-md leading-relaxed text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 流程 ── */}
      <section id="how" className="scroll-mt-20 border-t border-line bg-paper-2/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionHeading eyebrow="How it works" title="三個步驟，從 JD 到評分報告" />
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative border-t border-ink pt-6">
                <span className="font-display text-6xl italic text-accent">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 評分報告預覽 ── */}
      <section id="preview" className="scroll-mt-20 bg-ink text-on-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Report</span>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              不只告訴你幾分，
              <br />
              <span className="italic">還告訴你怎麼答</span>
            </h2>
            <ul className="mt-8 space-y-4 text-on-ink/75">
              {["0–100 總分與整體評價", "每題 0–10 分與具體回饋", "每題的作答重點與示範回答", "整體優點與可執行的改進建議"].map(
                (t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <ReportPreview />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="FAQ" title="常見問題" />
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 最終 CTA ── */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="grain relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-accent-soft px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            下一場面試前，
            <span className="italic text-accent">先過我這關。</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted">準備好職缺描述，五分鐘後你會知道自己還差什麼。</p>
          <Link
            href="/interview"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-medium text-on-ink transition-colors hover:bg-accent"
          >
            開始模擬面試
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
      <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
    </div>
  );
}

/** Hero 右側：面試對話的示意卡片 */
function HeroPreview() {
  return (
    <div className="relative animate-rise [animation-delay:150ms]" aria-hidden>
      <div className="absolute -inset-4 -z-10 rotate-2 rounded-[2rem] bg-paper-2" />
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-[0_30px_60px_-30px_rgba(22,21,15,0.35)] sm:p-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <div className="text-sm font-bold">前端工程師 · 模擬面試</div>
            <div className="mt-0.5 font-mono text-xs text-muted">QUESTION 2 / 5</div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`h-1.5 w-5 rounded-full ${n <= 2 ? "bg-accent" : "bg-line"}`} />
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-relaxed">
          <Bubble who="interviewer">你提到用 React.memo 優化列表，當時是怎麼確認瓶頸在重新渲染的？</Bubble>
          <Bubble who="candidate">我先用 React Profiler 錄製操作，發現每次篩選都讓 200 張卡片全部重繪……</Bubble>
          <Bubble who="interviewer">很好。那優化前後的差異，你是用什麼指標衡量的？</Bubble>
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-muted">
          <span className="flex-1">輸入你的回答…</span>
          <span className="rounded-full bg-ink px-3 py-1 text-xs text-on-ink">送出</span>
        </div>
      </div>
      <Stamp score={86} className="absolute -right-3 -bottom-8 sm:-right-8" />
    </div>
  );
}

function Bubble({ who, children }: { who: "interviewer" | "candidate"; children: React.ReactNode }) {
  return who === "interviewer" ? (
    <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-paper-2 px-4 py-3">{children}</div>
  ) : (
    <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-on-ink">{children}</div>
  );
}

/** 印章風格的分數 */
function Stamp({ score, className = "" }: { score: number; className?: string }) {
  return (
    <div
      className={`grid size-28 rotate-[-10deg] place-items-center rounded-full border-[3px] border-accent bg-surface/90 text-accent shadow-lg backdrop-blur ${className}`}
    >
      <div className="grid size-[92px] place-items-center rounded-full border border-dashed border-accent/70 text-center">
        <div>
          <div className="font-display text-4xl leading-none">{score}</div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.2em]">SCORE</div>
        </div>
      </div>
    </div>
  );
}

/** 評分報告的示意卡片 */
function ReportPreview() {
  return (
    <div className="rounded-3xl bg-paper p-6 text-ink sm:p-8" aria-hidden>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Q2 · 效能優化</div>
          <div className="mt-2 font-display text-2xl">如何衡量優化成效？</div>
        </div>
        <div className="shrink-0 rounded-full border-2 border-accent px-3 py-1 font-display text-xl text-accent">7/10</div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        有提到 Profiler 工具，但缺少優化前後的量化數據，說服力不足。
      </p>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <div className="text-sm font-bold">作答重點</div>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>— 說明使用的量測工具與指標</li>
          <li>— 提供優化前後的具體數字</li>
          <li>— 連結到使用者體驗或商業成效</li>
        </ul>
        <div className="mt-5 text-sm font-bold">示範回答</div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          「我用 Profiler 記錄篩選操作的 commit 時間，優化前平均約 120ms，套用 memo 與虛擬列表後降到 30ms 以下……」
        </p>
      </div>
    </div>
  );
}
