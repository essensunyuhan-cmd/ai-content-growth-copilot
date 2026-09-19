"use client";
import { ArrowRight, ChevronDown } from "./Icons";
import { fields, type AnalyzeInput, type InputKey } from "@/lib/types";
export function InputPanel({
  input,
  onChange,
  onExample,
  onSubmit,
  loading,
  sample,
  mock,
}: {
  input: AnalyzeInput;
  onChange: (key: InputKey, value: string) => void;
  onExample: () => void;
  onSubmit: () => void;
  loading: boolean;
  sample: boolean;
  mock: boolean;
}) {
  function field(f: (typeof fields)[number]) {
    const optional = "optional" in f;
    return (
      <div className={`form-field field-${f.key}`} key={f.key}>
        <label htmlFor={f.key}>
          {f.label}
          {optional && <span>可选</span>}
        </label>
        {f.rows === 1 ? (
          <input
            id={f.key}
            name={f.key}
            value={input[f.key]}
            placeholder={f.placeholder}
            required={!optional}
            maxLength={12000}
            disabled={loading}
            onChange={(e) => onChange(f.key, e.target.value)}
          />
        ) : (
          <textarea
            id={f.key}
            name={f.key}
            rows={f.rows}
            value={input[f.key]}
            placeholder={f.placeholder}
            required={!optional}
            maxLength={12000}
            disabled={loading}
            onChange={(e) => onChange(f.key, e.target.value)}
          />
        )}
        {f.key === "platforms" && (
          <div className="chips">
            {["小红书", "抖音", "视频号"].map((p) => {
              const platforms = input.platforms
                .split(/[、,，\s]+/)
                .filter(Boolean);
              const selected = platforms.includes(p);
              return (
                <button
                  type="button"
                  key={p}
                  aria-pressed={selected}
                  disabled={loading}
                  onClick={() =>
                    onChange(
                      "platforms",
                      (selected
                        ? platforms.filter((x) => x !== p)
                        : [...platforms, p]
                      ).join("、"),
                    )
                  }
                >
                  {selected ? "✓ " : "+ "}
                  {p}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  return (
    <section className="input-panel" aria-label="业务信息">
      <div className="panel-heading">
        <h2>业务信息</h2>
        <button
          className="secondary-button"
          type="button"
          onClick={onExample}
          disabled={loading}
        >
          使用示例数据
        </button>
      </div>
      {sample && (
        <p className="sample-note">示例数据 · 虚构的二手房内容运营案例</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-grid">
          {[
            fields[0],
            fields[2],
            fields[1],
            fields[4],
            fields[3],
            fields[5],
          ].map(field)}
        </div>
        <details className="optional-inputs">
          <summary>
            <span>
              补充历史表现 <span className="muted">（可选）</span>
            </span>
            <ChevronDown />
          </summary>
          <div className="optional-content">
            <p className="muted">
              有历史数据时，能进一步比较方向与账号表现的匹配程度。
            </p>
            {fields.slice(6).map(field)}
          </div>
        </details>
        <div className="submit-area">
          <p className="muted">
            {mock ? "模拟模式 · 展示固定示例结果" : "分析通常需要 30–45 秒"}
          </p>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "正在分析…" : "生成增长决策"}
            {!loading && <ArrowRight />}
          </button>
        </div>
      </form>
    </section>
  );
}
