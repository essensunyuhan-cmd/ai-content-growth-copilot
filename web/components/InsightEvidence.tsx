import { ChevronDown } from "./Icons";
import type { UserInsight } from "@/lib/types";
export function InsightEvidence({ insight }: { insight: UserInsight }) {
  return (
    <details className="result-disclosure evidence">
      <summary>
        <span>
          <strong>查看决策依据</strong>
          <span className="disclosure-hint">用户反馈、推断与证据缺口</span>
        </span>
        <ChevronDown />
      </summary>
      <div className="disclosure-content evidence-content">
        <h3>{insight.core_problem || "核心问题待确认"}</h3>
        {insight.insights.map((item, i) => (
          <article className="insight" key={i}>
            <div className="insight-meta">
              <span
                className={
                  item.type === "用户明确表达" ? "explicit-source" : ""
                }
              >
                {item.type}
              </span>
              <span>
                {item.evidence.length} 条证据
                {item.evidence_count !== item.evidence.length
                  ? `（模型报告 ${item.evidence_count} 条，数量待核对）`
                  : ""}
              </span>
            </div>
            <h4>{item.user_need}</h4>
            {item.evidence.map((quote, j) => (
              <blockquote key={j}>{quote}</blockquote>
            ))}
            <dl>
              {[
                ["场景", item.scenario],
                ["情绪", item.emotion],
                ["内容需求", item.content_need],
              ].map(
                ([label, value]) =>
                  value && (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ),
              )}
            </dl>
          </article>
        ))}
        {!!insight.evidence_gaps?.length && (
          <div className="gaps">
            <h4>仍缺少哪些证据</h4>
            <ul>
              {insight.evidence_gaps.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
