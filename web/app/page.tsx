import { Copilot } from "@/components/Copilot";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductMark } from "@/components/Icons";
import Link from "next/link";
export const dynamic = "force-dynamic";
const repo = "https://github.com/essensunyuhan-cmd/ai-content-growth-copilot";
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#workspace">
        跳转到工作区
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="内容增长决策助手 首页">
            <span className="brand-symbol">
              <ProductMark />
            </span>
            <span>内容增长决策助手</span>
          </Link>
          <span className="header-context">内容决策工作台</span>
          <a
            className="header-link"
            href={repo}
            target="_blank"
            rel="noreferrer"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <main className="main-container" id="workspace">
        <Copilot mock={!process.env.DIFY_API_KEY?.trim()} />
      </main>
      <footer className="site-footer">
        <HowItWorks />
        <a
          href={`${repo}/blob/main/eval/rubric.md`}
          target="_blank"
          rel="noreferrer"
        >
          Eval（评测）<span aria-hidden="true"> ↗</span>
        </a>
      </footer>
    </>
  );
}
