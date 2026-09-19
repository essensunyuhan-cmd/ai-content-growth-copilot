import ReactMarkdown from "react-markdown";
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown>{children || "暂无补充信息"}</ReactMarkdown>
    </div>
  );
}
