/**
 * POST /api/interview
 *
 * AI 面試模擬器的後端 API（Next.js App Router 的 Route Handler）。
 *
 * 這支 API 是「無狀態」的：伺服器不儲存任何面試資料，
 * 前端每次呼叫都會把「職缺描述 + 題數 + 到目前為止的完整對話」一起送過來，
 * 伺服器再依照「候選人已經回答了幾題」決定這次要做什麼：
 *   - 還沒答完 → 請 AI 出下一題（回傳 type: "question"）
 *   - 全部答完 → 請 AI 評分並給建議（回傳 type: "evaluation"）
 */

// OpenAI 官方 SDK，用來呼叫 Chat Completions API
import OpenAI from "openai";
// 前後端共用的常數與型別（定義在 src/lib/interview.ts）
import {
  MAX_QUESTIONS, // 題數上限（10）
  MIN_QUESTIONS, // 題數下限（1）
  type ChatMessage, // 單則對話：{ role: "interviewer" | "candidate", content }
  type Evaluation, // 最終評分結果的結構
  type InterviewRequest, // 前端送來的請求內容
  type InterviewResponse, // 這支 API 回傳的內容（出題 or 評分）
} from "@/lib/interview";

// 使用的模型：優先讀環境變數 OPENAI_MODEL，沒設定就用 gpt-4o-mini
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/**
 * 產生 system prompt（系統提示詞）。
 * system prompt 用來設定 AI 的角色與規則，整場面試都會帶著它，
 * 讓 AI 知道自己是面試官、職缺內容是什麼、總共要問幾題。
 */
function systemPrompt(jobDescription: string, totalQuestions: number) {
  return `你是一位專業、友善但嚴謹的面試官，正在針對以下職缺進行模擬面試。

【職缺描述】
${jobDescription}

規則：
- 整場面試共 ${totalQuestions} 題，一次只問一題。
- 題目要緊扣職缺描述，涵蓋技術能力、實務經驗與情境/行為題。
- 候選人回答後，先用一兩句話簡短回應（不要給分數），再提出下一題；下一題可以是針對剛才回答的追問，或是新的題目。
- 使用繁體中文，語氣自然，像真人面試官。`;
}

/**
 * 把我們自己的對話格式轉成 OpenAI 要求的格式。
 *   - 面試官（interviewer）的話 = AI 說過的話 → OpenAI 的 "assistant"
 *   - 候選人（candidate）的話   = 使用者說的話 → OpenAI 的 "user"
 * 這樣 AI 才看得懂「哪些是自己問過的題目、哪些是候選人的回答」。
 */
function toOpenAIMessages(history: ChatMessage[]) {
  return history.map((m) => ({
    // `as const` 讓 TypeScript 把型別鎖定成字面值 "assistant" / "user"，
    // 而不是一般的 string，才符合 OpenAI SDK 的型別要求
    role: m.role === "interviewer" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
}

/**
 * 驗證前端送來的資料格式是否正確。
 * 前端的資料不能完全信任（可能被竄改或格式錯誤），所以後端一定要再檢查一次。
 *
 * 回傳型別 `body is InterviewRequest` 是 TypeScript 的「型別守衛」：
 * 這個函式回傳 true 之後，TypeScript 就會把 body 當成 InterviewRequest 型別使用。
 */
function isValidRequest(body: unknown): body is InterviewRequest {
  // 必須是物件（排除 null、字串、數字等）
  if (!body || typeof body !== "object") return false;
  // 先當成「任意 key 的物件」來逐一檢查欄位
  const b = body as Record<string, unknown>;
  return (
    // 職缺描述：必須是字串，且去掉空白後不能是空的
    typeof b.jobDescription === "string" &&
    b.jobDescription.trim().length > 0 &&
    // 題數：必須是整數，且在 MIN_QUESTIONS ~ MAX_QUESTIONS 之間
    Number.isInteger(b.totalQuestions) &&
    (b.totalQuestions as number) >= MIN_QUESTIONS &&
    (b.totalQuestions as number) <= MAX_QUESTIONS &&
    // 對話紀錄：必須是陣列，而且每一則都要符合 ChatMessage 的格式
    Array.isArray(b.history) &&
    b.history.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "interviewer" || m.role === "candidate") &&
        typeof m.content === "string",
    )
  );
}

/**
 * 處理 POST 請求的主函式。
 * 在 App Router 中，route.ts 匯出名為 POST 的函式，就代表這個路徑接受 POST 請求。
 */
export async function POST(request: Request) {
  // ── 步驟 1：確認伺服器有設定 API 金鑰（來自 .env.local） ──
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "伺服器未設定 OPENAI_API_KEY" }, { status: 500 });
  }

  // ── 步驟 2：解析請求的 JSON 內容 ──
  // 如果前端送來的不是合法 JSON，request.json() 會丟出錯誤，這裡接住並回 400
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  // ── 步驟 3：驗證欄位內容 ──
  if (!isValidRequest(body)) {
    return Response.json(
      { error: `缺少職缺描述、題數需為 ${MIN_QUESTIONS}-${MAX_QUESTIONS}，或對話紀錄格式錯誤` },
      { status: 400 },
    );
  }

  // 驗證通過後，TypeScript 已知道 body 是 InterviewRequest，可以直接解構取值
  const { jobDescription, totalQuestions, history } = body;

  // ── 步驟 4：算出候選人「已經回答了幾題」 ──
  // 這是整支 API 的核心判斷依據：數對話紀錄中 role 為 candidate 的訊息數量
  const answered = history.filter((m) => m.role === "candidate").length;

  // 回答數超過總題數，代表面試早就結束了，不該再呼叫
  if (answered > totalQuestions) {
    return Response.json({ error: "面試已結束" }, { status: 400 });
  }

  // ── 步驟 5：準備要送給 OpenAI 的訊息 ──
  // new OpenAI() 不帶參數時，會自動讀取環境變數 OPENAI_API_KEY
  const client = new OpenAI();
  // 訊息順序：先放 system prompt（設定角色），再接上完整的對話紀錄
  const messages = [
    { role: "system" as const, content: systemPrompt(jobDescription, totalQuestions) },
    ...toOpenAIMessages(history),
  ];

  try {
    // ── 步驟 6A：還沒答完 → 出下一題 ──
    if (answered < totalQuestions) {
      // 根據目前進度，給 AI 一個「這一輪要做什麼」的額外指示
      const instruction =
        answered === 0
          ? // 第一次呼叫（還沒有任何回答）：打招呼 + 出第 1 題
            `請先簡短打招呼，然後提出第 1 題（共 ${totalQuestions} 題）。`
          : // 之後的呼叫：先回應上一題的回答，再出下一題
            `請簡短回應候選人的回答，然後提出第 ${answered + 1} 題（共 ${totalQuestions} 題）。`;

      const completion = await client.chat.completions.create({
        model: MODEL,
        // temperature 控制隨機性（0~2）。0.7 讓題目有些變化，不會每次都一樣
        temperature: 0.7,
        // 把這一輪的指示附加在最後面，讓 AI 優先遵守
        messages: [...messages, { role: "system", content: instruction }],
      });

      // 取出 AI 回覆的文字；用 ?. 和 ?? 防止回應是空的時候程式出錯
      const content = completion.choices[0]?.message.content?.trim() ?? "";

      // 回傳給前端：告訴它這是「題目」，以及現在是第幾題
      const result: InterviewResponse = {
        type: "question",
        questionNumber: answered + 1,
        content,
      };
      return Response.json(result);
    }

    // ── 步驟 6B：全部答完（answered === totalQuestions）→ 評分 ──
    const completion = await client.chat.completions.create({
      model: MODEL,
      // 評分需要穩定、一致，所以 temperature 調低
      temperature: 0.3,
      // JSON 模式：強制 AI 只輸出合法的 JSON，方便後面直接解析
      response_format: { type: "json_object" },
      messages: [
        ...messages,
        {
          role: "system",
          // 明確告訴 AI 要輸出的 JSON 結構，欄位要對應 Evaluation 型別
          content: `面試已結束。請根據職缺需求與候選人的 ${totalQuestions} 個回答給出評分與建議，只輸出 JSON，格式如下：
{
  "overallScore": 0-100 的整數,
  "summary": "整體評價，2-3 句",
  "questions": [{ "question": "題目摘要", "score": 0-10 的整數, "feedback": "針對該題回答的具體回饋", "keyPoints": ["這題好的回答應涵蓋的重點，2-4 點"], "exampleAnswer": "示範回答" }],
  "strengths": ["優點"],
  "improvements": ["具體可行的改進建議"]
}
questions 陣列需剛好 ${totalQuestions} 筆，順序與面試題目一致。
exampleAnswer 必須是一段 150-250 字、以第一人稱撰寫的完整示範回答，要有具體情境、做法與可量化的成果，並貼合職缺需求；不要只描述作答方法。評分要客觀，回答空泛或離題請如實反映。使用繁體中文。`,
        },
      ],
    });

    // 取出 AI 回傳的 JSON 字串，並轉成 JavaScript 物件
    const raw = completion.choices[0]?.message.content ?? "{}";
    const evaluation = JSON.parse(raw) as Evaluation;

    // 回傳給前端：告訴它這是「評分結果」
    const result: InterviewResponse = { type: "evaluation", evaluation };
    return Response.json(result);
  } catch (err) {
    // ── 錯誤處理 ──
    // 呼叫 OpenAI 失敗（網路問題、金鑰錯誤、額度用完…）或 JSON 解析失敗都會到這裡。
    // 詳細錯誤只印在伺服器 log，不直接回傳給前端，避免洩漏內部資訊
    console.error("[api/interview]", err);
    // 502 Bad Gateway：代表「我們依賴的外部服務出問題」
    return Response.json({ error: "AI 服務暫時無法使用，請稍後再試" }, { status: 502 });
  }
}
