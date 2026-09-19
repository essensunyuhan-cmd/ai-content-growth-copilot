"use client";
import { useEffect, useState } from "react";
const stages = [
  "正在分析用户反馈",
  "正在识别内容机会",
  "正在结合历史表现",
  "正在生成平台策略",
];
export function LoadingProgress({ mock }: { mock: boolean }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  const stage = Math.min(3, Math.floor(seconds / (mock ? 1 : 10)));
  return (
    <div className="loading-panel" role="status" aria-live="polite">
      <h2>{mock ? "正在准备模拟案例" : "正在梳理你的内容机会"}</h2>
      <p className="muted">完整分析通常需要约 30–45 秒</p>
      <ol className="loading-stages">
        {stages.map((text, i) => (
          <li
            key={text}
            className={i === stage ? "active" : i < stage ? "done" : ""}
          >
            <span aria-hidden="true">{i < stage ? "✓" : ""}</span>
            {text}
          </li>
        ))}
      </ol>
      <p className="loading-note muted">
        {mock
          ? "模拟加载用于预览交互，不会调用 AI。"
          : "以上为按时间推进的等待提示，并非实时服务器节点状态。"}
      </p>
      {seconds > 50 && <p>分析仍在继续，请稍候；若超时可以保留输入重试。</p>}
    </div>
  );
}
