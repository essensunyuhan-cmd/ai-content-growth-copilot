export const fields = [
  {
    key: "product_info",
    label: "产品介绍",
    placeholder: "你的产品帮助用户解决什么问题？",
    rows: 2,
  },
  {
    key: "target_user",
    label: "目标用户",
    placeholder: "例如：正在比较二手房的首次购房者",
    rows: 1,
  },
  {
    key: "selling_points",
    label: "核心卖点",
    placeholder: "已确认的产品能力与差异点",
    rows: 2,
  },
  {
    key: "user_feedback",
    label: "用户反馈",
    placeholder: "粘贴用户原话，每条一行。具体的困惑比概括更有帮助。",
    rows: 5,
  },
  {
    key: "operation_goal",
    label: "运营目标",
    placeholder: "例如：增加有明确需求的产品访问",
    rows: 1,
  },
  { key: "platforms", label: "目标平台", placeholder: "小红书、抖音", rows: 1 },
  {
    key: "historical_content_data",
    label: "历史内容数据",
    placeholder: "内容主题、曝光、收藏、访问等；没有可留空",
    rows: 4,
    optional: true,
  },
  {
    key: "baseline_metrics",
    label: "账号基线指标",
    placeholder: "统计周期、指标口径与通常表现；没有可留空",
    rows: 2,
    optional: true,
  },
] as const;
export type InputKey = (typeof fields)[number]["key"];
export type AnalyzeInput = Record<InputKey, string>;
export interface Insight {
  user_need: string;
  type: string;
  evidence_count: number;
  evidence: string[];
  scenario?: string;
  emotion?: string;
  content_need?: string;
}
export interface UserInsight {
  core_problem: string;
  insights: Insight[];
  evidence_gaps?: string[];
}
export interface AnalyzeResponse {
  platform_plan: string;
  content_opportunities: string;
  user_insight: UserInsight;
  elapsed_time?: number;
  total_tokens?: number;
}
export interface ApiError {
  error: string;
}
export const emptyInput = Object.fromEntries(
  fields.map(({ key }) => [key, ""]),
) as AnalyzeInput;
