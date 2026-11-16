import Link from "next/link";

/** 品牌標誌：朱紅印章「面」字 + 字標 */
export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="AI 面試室 首頁">
      <span className="grid size-8 -rotate-3 place-items-center rounded-[6px] border-2 border-accent font-display text-lg font-bold leading-none text-accent transition-transform group-hover:rotate-0">
        面
      </span>
      <span className="font-display text-xl tracking-tight">
        AI <span className="italic">面試室</span>
      </span>
    </Link>
  );
}
