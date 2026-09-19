import test from "node:test";
import assert from "node:assert/strict";
import { splitSections, parseFields, parsePlatforms } from "./parsers";
import { pickOutputs, validateInput } from "./validation";
import { mockResult, sampleInput } from "./mock";
import { POST, maxDuration } from "../app/api/analyze/route";

test("输入拒绝空白、非字符串和超长字段；允许省略可选字段", () => {
  assert.ok("error" in validateInput({ ...sampleInput, user_feedback: "  " }));
  assert.ok(
    "error" in validateInput({ ...sampleInput, platforms: ["小红书"] }),
  );
  assert.ok(
    "error" in
      validateInput({ ...sampleInput, product_info: "字".repeat(12001) }),
  );
  const result = validateInput({
    ...sampleInput,
    product_info: " 产品 ",
    baseline_metrics: undefined,
  });
  assert.ok("input" in result);
  assert.equal(result.input.product_info, "产品");
  assert.equal(result.input.baseline_metrics, "");
});
test("机会保留独立评分、重复评分依据和多行证据", () => {
  const sections = splitSections(mockResult.content_opportunities, "内容机会");
  assert.equal(sections.length, 2);
  const fields = parseFields(sections[0].body);
  assert.equal(fields.filter((f) => f.label === "评分依据").length, 2);
  assert.match(
    fields.find((f) => f.label === "用户证据")!.value,
    /之前到底成交/,
  );
  assert.equal(fields.find((f) => f.label === "用户需求强度")?.value, "5/5");
});
test("平台分组、Markdown 加粗字段与格式变化回退", () => {
  const strategy = splitSections(mockResult.platform_plan, "内容策略")[0];
  const result = parsePlatforms(strategy.body);
  assert.deepEqual(
    result.platforms.map((p) => p.title),
    ["小红书", "抖音"],
  );
  assert.equal(
    parseFields(
      "- **推荐内容形式**：图文\n- 内容结构：\n  1. 引入\n  2. 对比",
    )[1].value,
    "1. 引入\n  2. 对比",
  );
  assert.deepEqual(splitSections("格式变化后的普通 Markdown", "内容机会"), []);
  assert.deepEqual(
    splitSections("额外重要说明\n【内容机会1】\n内容机会：例子", "内容机会"),
    [],
  );
  assert.deepEqual(parseFields("不能被忽略的说明\n内容机会：例子"), []);
});
test("只提取业务字段和性能数据，拒绝错误或不完整结果", () => {
  const source = {
    status: "succeeded",
    outputs: { ...mockResult, internal: "not-public" },
    elapsed_time: 37.288,
    total_tokens: 16469,
    secret: "not-public",
  };
  const output = pickOutputs(source)!;
  assert.deepEqual(Object.keys(output).sort(), [
    "content_opportunities",
    "elapsed_time",
    "platform_plan",
    "total_tokens",
    "user_insight",
  ]);
  assert.equal(pickOutputs({ ...source, status: "failed" }), null);
  assert.equal(
    pickOutputs({ ...source, outputs: { ...mockResult, user_insight: null } }),
    null,
  );
  assert.equal(
    pickOutputs({ ...source, outputs: { ...mockResult, platform_plan: " " } }),
    null,
  );
});
test("API 请求协议、超时、上游错误脱敏及无密钥状态", async () => {
  assert.equal(maxDuration, 120);
  const originalFetch = globalThis.fetch;
  delete process.env.DIFY_API_KEY;
  const request = (body: unknown) =>
    new Request("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify(body),
    });
  assert.equal((await POST(request(sampleInput))).status, 503);
  assert.equal((await POST(request({}))).status, 400);
  assert.equal(
    (
      await POST(
        new Request("http://localhost/api/analyze", {
          method: "POST",
          body: "{broken",
        }),
      )
    ).status,
    400,
  );
  process.env.DIFY_API_KEY = "test-only-not-a-real-key";
  process.env.DIFY_API_BASE_URL = "https://example.test/v1";
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, "https://example.test/v1/workflows/run");
      assert.equal(init?.redirect, "error");
      assert.deepEqual(JSON.parse(init!.body as string), {
        inputs: sampleInput,
        response_mode: "blocking",
        user: "web-demo",
      });
      assert.equal(
        (init?.headers as Record<string, string>).Authorization,
        "Bearer test-only-not-a-real-key",
      );
      return Response.json({
        data: {
          status: "succeeded",
          outputs: mockResult,
          elapsed_time: 1,
          total_tokens: 2,
        },
        internal: "secret",
      });
    };
    const success = await POST(request(sampleInput));
    assert.equal(success.status, 200);
    assert.equal(success.headers.get("cache-control"), "no-store");
    assert.deepEqual(Object.keys(await success.json()).sort(), [
      "content_opportunities",
      "elapsed_time",
      "platform_plan",
      "total_tokens",
      "user_insight",
    ]);
    globalThis.fetch = async () =>
      new Response("private-upstream-stack", { status: 401 });
    const failure = await POST(request(sampleInput));
    assert.equal(failure.status, 502);
    assert.doesNotMatch(
      await failure.text(),
      /private-upstream-stack|test-only/,
    );
    globalThis.fetch = async () => {
      throw new DOMException("private-timeout", "TimeoutError");
    };
    const timeout = await POST(request(sampleInput));
    assert.equal(timeout.status, 504);
    assert.match(await timeout.text(), /超时/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.DIFY_API_KEY;
    delete process.env.DIFY_API_BASE_URL;
  }
});
