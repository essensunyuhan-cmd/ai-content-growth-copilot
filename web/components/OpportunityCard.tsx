import { parseFields, type Section } from "@/lib/parsers";
import { Markdown } from "./Markdown";
import { ChevronDown } from "./Icons";

function summarize(value: string, maxLength = 96): string {
  const plain = value
    .replace(/[#*_`>\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).replace(/[，,；;：:\s]+$/, "")}…`;
}

export function OpportunityCard({
  section,
  index,
}: {
  section: Section;
  index: number;
}) {
  const fields = parseFields(section.body);
  const get = (label: string) => fields.find((f) => f.label === label)?.value;
  if (!get("内容机会"))
    return (
      <article className="opportunity markdown-fallback">
        <h3>{section.title}</h3>
        <Markdown>{section.body}</Markdown>
      </article>
    );
  const core = get("机会类型")?.trim() === "核心机会";
  const compact = !core;
  const recommendation = get("推荐理由") || "暂无推荐理由";
  const scores = ["用户需求强度", "产品匹配度", "传播潜力预估"];
  const used = [
    "内容机会",
    "机会类型",
    "推荐理由",
    "验证假设",
    "成功信号",
    ...scores,
  ];
  return (
    <article
      className={`opportunity ${core ? "core" : "compact"}`}
      aria-labelledby={`opportunity-${index}`}
    >
      <div className="opportunity-heading">
        <h3 id={`opportunity-${index}`}>{get("内容机会")}</h3>
        <span className="opportunity-type">
          {get("机会类型") || "类型待确认"}
        </span>
      </div>
      {compact ? (
        <p className="opportunity-reason compact-reason">
          {summarize(recommendation)}
        </p>
      ) : (
        <div className="opportunity-reason">
          <Markdown>{recommendation}</Markdown>
        </div>
      )}
      {core && (
        <dl className="core-validation">
          {["验证假设", "成功信号"].map((label) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                <Markdown>{get(label) || "待补充"}</Markdown>
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div className="opportunity-footer">
        <dl className="scores">
          {scores.map((label, i) => {
            const raw = get(label);
            const score = raw?.match(/(?:^|\s)([1-5])\s*[/／]\s*5/);
            const position = fields.findIndex((f) => f.label === label);
            const reason = fields[position + 1];
            return (
              <div
                key={label}
                title={
                  reason?.label.endsWith("依据") ? reason.value : undefined
                }
              >
                <dt>{["用户需求", "产品匹配", "传播潜力"][i]}</dt>
                <dd>
                  <strong>{score ? score[1] : "待确认"}</strong>
                  {score && <span> / 5</span>}
                  {raw && !score && <span>{raw}</span>}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      <details className="opportunity-details">
        <summary>
          {compact ? "展开详细内容" : "查看完整依据"}
          <ChevronDown />
        </summary>
        <div className="opportunity-detail-content">
          {compact && (
            <>
              <div className="expanded-recommendation">
                <h4>推荐理由</h4>
                <Markdown>{recommendation}</Markdown>
              </div>
              <dl className="validation-fields">
                {["验证假设", "成功信号"].map((label) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>
                      <Markdown>{get(label) || "待补充"}</Markdown>
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          <dl className="evidence-fields">
            {fields
              .filter((f) => !used.includes(f.label))
              .map((f, i) => (
                <div key={i}>
                  <dt>{f.label}</dt>
                  <dd>
                    <Markdown>{f.value}</Markdown>
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </details>
    </article>
  );
}
