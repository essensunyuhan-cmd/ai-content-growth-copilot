"use client";
import { useRef, useState } from "react";
import {
  emptyInput,
  type AnalyzeInput,
  type AnalyzeResponse,
  type InputKey,
} from "@/lib/types";
import { mockResult, sampleInput } from "@/lib/mock";
import { splitSections } from "@/lib/parsers";
import { pickOutputs, validateInput } from "@/lib/validation";
import { InputPanel } from "./InputPanel";
import { OpportunityCard } from "./OpportunityCard";
import { InsightEvidence } from "./InsightEvidence";
import { PlatformPlan } from "./PlatformPlan";
import { LoadingProgress } from "./LoadingProgress";
import { Markdown } from "./Markdown";
import { ChevronDown } from "./Icons";
export function Copilot({ mock }: { mock: boolean }) {
  const [input, setInput] = useState(emptyInput);
  const [sample, setSample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [stale, setStale] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submittedInput, setSubmittedInput] = useState<AnalyzeInput | null>(null);
  const lock = useRef(false);
  const resultRef = useRef<HTMLElement>(null);
  function onChange(key: InputKey, value: string) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setStale(!!result);
  }
  async function submit() {
    if (lock.current) return;
    const validated = validateInput(input);
    if ("error" in validated) {
      setError(validated.error);
      return;
    }
    lock.current = true;
    setSubmittedInput({ ...validated.input });
    setLoading(true);
    setError("");
    setResult(null);
    setStale(false);
    requestAnimationFrame(() => {
      resultRef.current?.focus({ preventScroll: true });
      document.getElementById("workspace")?.scrollIntoView({ block: "start" });
    });
    try {
      if (mock) {
        await new Promise((resolve) => setTimeout(resolve, 3200));
        setResult(mockResult);
      } else {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated.input),
          signal: AbortSignal.timeout(115000),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : "分析暂未完成，请稍后重试。",
          );
        const output = pickOutputs({
          status: "succeeded",
          outputs: data,
          elapsed_time: data?.elapsed_time,
          total_tokens: data?.total_tokens,
        });
        if (!output) throw new Error("返回结果不完整，请稍后重试。");
        setResult(output);
      }
      setEditing(false);
      requestAnimationFrame(() => {
        resultRef.current?.focus({ preventScroll: true });
        document
          .getElementById("workspace")
          ?.scrollIntoView({ block: "start" });
      });
    } catch (e) {
      setError(
        e instanceof Error &&
          !["TimeoutError", "AbortError", "TypeError"].includes(e.name)
          ? e.message
          : "网络连接中断或分析超时，请重试。你的输入已保留。",
      );
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }
  const opportunities = result
    ? splitSections(result.content_opportunities, "内容机会")
    : [];
  const resultContext = result && submittedInput ? submittedInput : input;
  const inputPanel = (
    <InputPanel
      input={input}
      onChange={onChange}
      onExample={() => {
        setInput({ ...sampleInput });
        setSample(true);
        setStale(!!result);
        setError("");
      }}
      onSubmit={submit}
      loading={loading}
      sample={sample}
      mock={mock}
    />
  );
  return (
    <div className={`copilot ${result ? "has-result" : ""}`}>
      <div className="workspace-heading">
        <div>
          <h1>
            {result
              ? "本轮建议"
              : loading
                ? "正在生成内容决策"
                : "新建内容决策"}
          </h1>
          <p className="muted">
            {result
              ? "先确定值得做的方向，再展开依据与执行方案。"
              : "输入业务信息，获得内容方向、判断依据与平台执行方案。"}
          </p>
        </div>
      </div>
      {mock && (
        <p className="mode-notice">
          <span className="status-dot" />
          <strong>模拟模式</strong>
          <span>固定房产案例预览，修改输入不会改变示例结果。</span>
        </p>
      )}
      {(result || loading) && (
        <section className="context-section">
          <button
            className="context-toggle"
            type="button"
            disabled={loading}
            aria-expanded={editing && !loading}
            aria-controls="business-context"
            onClick={() => setEditing(!editing)}
          >
            <span className="context-label">本次业务信息</span>
            <span className="context-preview">
              {resultContext.operation_goal}
            </span>
            <span className="context-platforms">
              {resultContext.platforms}
            </span>
            {!loading && (
              <span className="context-action">
                {editing ? "收起" : "修改"}
              </span>
            )}
            <ChevronDown />
          </button>
          <div id="business-context" hidden={!editing || loading}>
            {inputPanel}
          </div>
        </section>
      )}
      <div
        className={!result && !loading ? "input-workspace" : "result-workspace"}
      >
        {!result && !loading && inputPanel}
        {!result && !loading && (
          <aside className="input-guidance" aria-label="分析结果说明">
            <h2>把信息变成下一步行动</h2>
            <dl>
              <div>
                <dt>做什么内容</dt>
                <dd>找到 1–3 个值得优先验证的方向。</dd>
              </div>
              <div>
                <dt>为什么值得做</dt>
                <dd>结合用户证据、产品匹配与传播潜力，说明推荐理由。</dd>
              </div>
              <div>
                <dt>如何落地执行</dt>
                <dd>给出适合各个平台的内容形式、表达与行动建议。</dd>
              </div>
            </dl>
            <p className="guidance-note">
              从用户原话开始就好。没有历史数据，也可以先探索内容方向。
            </p>
          </aside>
        )}
        <section
          className="results"
          aria-label="分析结果"
          aria-busy={loading}
          tabIndex={-1}
          ref={resultRef}
        >
          {error && (
            <div role="alert" className="error-box">
              <h2>这次分析没有完成</h2>
              <p>{error}</p>
              <button
                className="secondary-button"
                disabled={loading}
                onClick={submit}
              >
                保留输入并重试
              </button>
            </div>
          )}
          {loading ? (
            <LoadingProgress mock={mock} />
          ) : result ? (
            <>
              {stale && (
                <p className="result-note" role="status">
                  业务信息已修改，下方仍是上次结果。重新生成后将更新建议。
                </p>
              )}
              <div className="opportunities-heading">
                <h2>建议优先关注的内容方向</h2>
                <span className="muted">{mock ? "模拟结果" : "分析完成"}</span>
              </div>
              <div className="opportunities-list">
                {opportunities.length ? (
                  opportunities.map((section, index) => (
                    <OpportunityCard
                      section={section}
                      index={index}
                      key={index}
                    />
                  ))
                ) : (
                  <div className="markdown-fallback">
                    <Markdown>{result.content_opportunities}</Markdown>
                  </div>
                )}
              </div>
              <p className="score-note">
                评分为 AI 判断与预估，实际效果仍需通过内容实验验证。
              </p>
              <PlatformPlan
                text={result.platform_plan}
                selectedPlatforms={resultContext.platforms}
              />
              <InsightEvidence insight={result.user_insight} />
              {!mock &&
                (result.elapsed_time !== undefined ||
                  result.total_tokens !== undefined) && (
                  <p className="run-metrics muted">
                    本次分析
                    {result.elapsed_time !== undefined &&
                      ` · ${result.elapsed_time.toFixed(1)} 秒`}
                    {result.total_tokens !== undefined &&
                      ` · ${result.total_tokens.toLocaleString()} Tokens`}
                  </p>
                )}
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
