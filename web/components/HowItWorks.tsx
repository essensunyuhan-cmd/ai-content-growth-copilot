import { ChevronDown } from "./Icons";
export function HowItWorks() {
  return (
    <details id="how-it-works" className="how-it-works">
      <summary>
        工作原理
        <ChevronDown />
      </summary>
      <div className="how-content">
        <p className="flow">
          用户反馈与历史表现<span>→</span>用户洞察<span>→</span>内容机会
          <span>→</span>事实约束<span>→</span>平台执行
        </p>
        <div className="method-grid">
          <p>
            <strong>Workflow（工作流）</strong>让分析过程可控、可观测、可测试。
          </p>
          <p>
            <strong>RAG（检索增强生成）</strong>
            通过检索产品事实与品牌规范，约束建议的表达边界。
          </p>
          <p>
            <strong>Eval（评测）</strong>
            通过固定测试集检查事实边界、平台适配与风险。
          </p>
        </div>
        <div className="benchmark">
          <p>同一固定测试用例的 Workflow 性能实验</p>
          <p>
            V1.1：87.767 秒 / 35,519 Tokens <span>→</span> V1.2：37.288 秒 /
            16,469 Tokens
          </p>
          <p className="muted">仅反映该用例的运行表现，不代表线上业务 KPI。</p>
        </div>
      </div>
    </details>
  );
}
