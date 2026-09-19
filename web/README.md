# AI Content Growth Copilot · Web

中文内容增长决策 Demo。使用 Next.js App Router、React、TypeScript、Tailwind CSS 与 react-markdown。原有 Dify Workflow、Eval 和产品文档保持原样。

## 1. 安装

需要 Node.js 20.9 或更新的受支持版本（开发验证使用 Node.js 24）。在仓库根目录的终端运行：

```bash
cd web
npm ci
```

## 2. 环境变量

没有真实密钥也可以直接启动：界面自动显示「模拟模式」，提交后展示固定房产示例。模拟结果不会根据输入改变，不会调用 Dify，也不冒充真实分析。

如需连接自己的 Dify Workflow，在 `web/` 创建 `.env.local`（可以复制 `.env.example`），填入：

```dotenv
DIFY_API_KEY=你的真实Key
DIFY_API_BASE_URL=https://api.dify.ai/v1
```

密钥应对应已发布、输出字段与仓库 V1.2 一致的 Workflow。自托管地址也须使用 HTTPS。修改环境变量后重启。真实 API 失败时显示错误，不会自动切换为模拟结果。

## 3. 本地启动与检查

以下命令均在 `web/` 运行：

```bash
npm run dev
```

打开 http://localhost:3000 。点击「使用示例数据」，再点击「生成增长决策」。

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm start` 运行已经生成的生产构建。

## 4. Vercel 部署

在 Vercel 导入本 GitHub 仓库，将 **Root Directory 设为 `web`**，框架选 Next.js。安装使用 `npm ci`，构建使用 `npm run build`，输出目录保留默认。

需要真实分析时，在 Vercel 项目环境变量中配置 `DIFY_API_KEY` 和 `DIFY_API_BASE_URL`，然后重新部署；不配置密钥则公开展示明确标识的固定模拟案例。无需数据库或其他集成。

`POST /api/analyze` 设置 `maxDuration = 120`；Dify 请求在 110 秒超时，浏览器在 115 秒超时。部署时应确保所选 Vercel 方案支持该运行时长。本次实现不执行部署。

## 5. 架构

- `app/page.tsx`：服务端读取配置是否存在，仅传递模拟模式布尔值。
- `components/Copilot.tsx`：输入、等待、错误、结果状态；重复提交锁。
- `components/InputPanel.tsx`：业务表单、平台选择、示例填充。
- `components/OpportunityCard.tsx`：机会与独立评分，不计算综合分。
- `components/InsightEvidence.tsx`：用户证据、明确表达与 AI 推断、证据缺口。
- `components/PlatformPlan.tsx`：策略分组、支持键盘切换的平台 Tab。
- `components/LoadingProgress.tsx`：按时间推进的等待提示，非实时节点事件。
- `components/HowItWorks.tsx`：方法与固定 Case 性能实验。
- `lib/types.ts`：输入、API 返回与洞察类型。
- `lib/parsers.ts`：按 Workflow 标记分组、字段解析；未识别内容保留 Markdown 展示。
- `lib/mock.ts`：明确标识的合成输入及固定模拟结果。
- `lib/validation.ts`：服务端输入校验、上游业务字段白名单。
- `app/api/analyze/route.ts`：仅服务端调用 Dify blocking API。

接口请求是八个字符串字段的 JSON，前六个必填，历史数据和基线可选；每字段最多 12,000 字，总请求最多 120 KB。成功只返回 `platform_plan`、`content_opportunities`、`user_insight` 及存在时的 `elapsed_time` / `total_tokens`。格式不完整的上游结果返回友好错误。

## 6. API Key 安全

密钥只通过服务端 `process.env.DIFY_API_KEY` 读取，不使用 `NEXT_PUBLIC_`，不发送给浏览器、不写入源代码或日志。`.gitignore` 忽略 `.env.local` 等真实环境文件，仅允许提交空值 `.env.example`。Dify HTTP 错误、堆栈和响应正文不直接透传。请求禁止重定向，防止认证头被意外转发；接口响应禁止缓存。

公开配置真实密钥后，访客提交会消耗你的 Dify 配额。这个版本按要求不包含登录、数据库或用户配额系统；无密钥的模拟模式适合无费用的公开作品预览。

## 新建文件清单

所有变更均位于 `web/`，仓库原有文件未修改。

```text
web/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── next-env.d.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/analyze/route.ts
├── components/
│   ├── Copilot.tsx
│   ├── InputPanel.tsx
│   ├── OpportunityCard.tsx
│   ├── InsightEvidence.tsx
│   ├── PlatformPlan.tsx
│   ├── LoadingProgress.tsx
│   ├── HowItWorks.tsx
│   └── Markdown.tsx
└── lib/
    ├── types.ts
    ├── validation.ts
    ├── parsers.ts
    ├── mock.ts
    └── behavior.test.ts
```

## 本次验证

已完成依赖安装、lint、TypeScript 检查、5 项针对性测试、生产构建。通过本地生产服务验证示例填充、等待时禁用提交、机会卡片、证据折叠、平台点击与方向键切换；390px 手机宽度无横向溢出，浏览器未记录控制台错误。API 测试使用模拟的上游响应，覆盖成功字段过滤、非法输入、缺少密钥、上游失败与超时。未使用真实 Dify 密钥，真实 Workflow 联调仍需在配置后确认。
