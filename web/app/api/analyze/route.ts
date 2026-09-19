import { NextResponse } from "next/server";
import { pickOutputs, validateInput } from "@/lib/validation";
export const maxDuration = 120;
export const runtime = "nodejs";
const fail = (error: string, status: number) =>
  NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function POST(request: Request) {
  let body: unknown;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 120000)
      return fail("输入内容过长，请精简后重试。", 413);
    body = JSON.parse(raw);
  } catch {
    return fail("提交格式有误，请刷新页面后重试。", 400);
  }
  const validated = validateInput(body);
  if ("error" in validated) return fail(validated.error, 400);
  const key = process.env.DIFY_API_KEY?.trim();
  if (!key)
    return fail("当前未启用真实分析，请刷新页面使用模拟案例预览。", 503);
  try {
    const base = new URL(
      process.env.DIFY_API_BASE_URL || "https://api.dify.ai/v1",
    );
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      base.search ||
      base.hash
    )
      return fail("分析服务配置暂不可用，请稍后重试。", 503);
    const response = await fetch(
      `${base.href.replace(/\/$/, "")}/workflows/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: validated.input,
          response_mode: "blocking",
          user: "web-demo",
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(110000),
        redirect: "error",
      },
    );
    if (!response.ok)
      return fail(
        response.status === 429
          ? "分析服务繁忙，请稍等片刻后重试。"
          : "分析服务暂时未能完成请求，请稍后重试。",
        502,
      );
    const result = await response.json();
    const output = pickOutputs(result?.data);
    if (!output) return fail("本次分析没有返回完整结果，请重试。", 502);
    return NextResponse.json(output, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return fail(
      error instanceof Error &&
        ["TimeoutError", "AbortError"].includes(error.name)
        ? "本次分析等待超时，请稍后重试。你的输入已保留。"
        : "暂时无法连接分析服务，请稍后重试。你的输入已保留。",
      504,
    );
  }
}
