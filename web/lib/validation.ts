import {
  fields,
  type AnalyzeInput,
  type AnalyzeResponse,
  type UserInsight,
} from "./types";
export function validateInput(
  value: unknown,
): { input: AnalyzeInput } | { error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { error: "请填写业务信息后重试。" };
  const source = value as Record<string, unknown>;
  const input = {} as AnalyzeInput;
  for (const field of fields) {
    const raw = source[field.key];
    const optional = "optional" in field;
    if (raw !== undefined && typeof raw !== "string")
      return { error: `${field.label}需要是文本。` };
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!optional && !text) return { error: `请填写${field.label}。` };
    if (text.length > 12000)
      return { error: `${field.label}请控制在 12,000 字以内。` };
    input[field.key] = text;
  }
  return { input };
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
export function isUserInsight(v: unknown): v is UserInsight {
  return (
    record(v) &&
    typeof v.core_problem === "string" &&
    Array.isArray(v.insights) &&
    v.insights.every(
      (i) =>
        record(i) &&
        typeof i.user_need === "string" &&
        typeof i.type === "string" &&
        typeof i.evidence_count === "number" &&
        Number.isFinite(i.evidence_count) &&
        strings(i.evidence) &&
        ["scenario", "emotion", "content_need"].every(
          (k) => i[k] === undefined || typeof i[k] === "string",
        ),
    ) &&
    (v.evidence_gaps === undefined || strings(v.evidence_gaps))
  );
}
export function pickOutputs(data: unknown): AnalyzeResponse | null {
  if (!record(data) || data.status !== "succeeded" || !record(data.outputs))
    return null;
  const o = data.outputs;
  if (
    typeof o.platform_plan !== "string" ||
    !o.platform_plan.trim() ||
    typeof o.content_opportunities !== "string" ||
    !o.content_opportunities.trim() ||
    !isUserInsight(o.user_insight)
  )
    return null;
  return {
    platform_plan: o.platform_plan,
    content_opportunities: o.content_opportunities,
    user_insight: o.user_insight,
    ...(typeof data.elapsed_time === "number" &&
    Number.isFinite(data.elapsed_time)
      ? { elapsed_time: data.elapsed_time }
      : {}),
    ...(typeof data.total_tokens === "number" &&
    Number.isFinite(data.total_tokens)
      ? { total_tokens: data.total_tokens }
      : {}),
  };
}
