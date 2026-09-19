"use client";
import { useId, useState } from "react";
import {
  filterUnselectedPlatformMarkdown,
  isSelectedPlatform,
  parseFields,
  parsePlatforms,
  parseSelectedPlatforms,
  splitSections,
  type Section,
} from "@/lib/parsers";
import { Markdown } from "./Markdown";
import { ChevronDown } from "./Icons";
function Strategy({
  section,
  selectedPlatforms,
}: {
  section: Section;
  selectedPlatforms: readonly string[];
}) {
  const id = useId();
  const [active, setActive] = useState(0);
  const { intro, platforms: parsedPlatforms } = parsePlatforms(section.body);
  const platforms = parsedPlatforms.filter((platform) =>
    isSelectedPlatform(platform.title, selectedPlatforms),
  );
  const current = platforms[active] ?? platforms[0];
  const fields = current ? parseFields(current.body) : [];
  return (
    <div className="strategy">
      {intro && platforms.length > 0 && <Markdown>{intro}</Markdown>}
      {platforms.length ? (
        <>
          <div
            className="tabs"
            role="tablist"
            aria-label={`${section.title}平台`}
          >
            {platforms.map((platform, i) => (
              <button
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-controls={`${id}-panel`}
                id={`${id}-tab-${i}`}
                tabIndex={active === i ? 0 : -1}
                key={i}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === "ArrowRight") next = (i + 1) % platforms.length;
                  else if (e.key === "ArrowLeft")
                    next = (i + platforms.length - 1) % platforms.length;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = platforms.length - 1;
                  else return;
                  e.preventDefault();
                  setActive(next);
                  document.getElementById(`${id}-tab-${next}`)?.focus();
                }}
              >
                {platform.title}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${active}`}
            tabIndex={0}
          >
            {fields.length ? (
              <dl className="plan-fields">
                {fields.map((f, i) => (
                  <div
                    key={i}
                    className={
                      f.label.includes("切入") || f.label === "开场方向"
                        ? "opening"
                        : ""
                    }
                  >
                    <dt>{f.label}</dt>
                    <dd>
                      <Markdown>{f.value}</Markdown>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <Markdown>{current.body}</Markdown>
            )}
          </div>
        </>
      ) : parsedPlatforms.length ? (
        <p className="empty-platform-plan">未返回所选平台的执行方案。</p>
      ) : (
        <Markdown>
          {filterUnselectedPlatformMarkdown(section.body, selectedPlatforms)}
        </Markdown>
      )}
    </div>
  );
}
export function PlatformPlan({
  text,
  selectedPlatforms: selectedPlatformsInput,
}: {
  text: string;
  selectedPlatforms: string;
}) {
  const sections = splitSections(text, "内容策略");
  const selectedPlatforms = parseSelectedPlatforms(selectedPlatformsInput);
  const [activeStrategy, setActiveStrategy] = useState(0);
  const id = useId();
  return (
    <details className="result-disclosure execution">
      <summary>
        <span>
          <strong>查看执行方案</strong>
          <span className="disclosure-hint">内容形式、表达与用户行动</span>
        </span>
        <ChevronDown />
      </summary>
      <div className="disclosure-content">
        {sections.length > 1 && (
          <div className="strategy-select">
            <label htmlFor={id}>内容策略</label>
            <select
              id={id}
              value={activeStrategy}
              onChange={(event) =>
                setActiveStrategy(Number(event.target.value))
              }
            >
              {sections.map((section, index) => (
                <option value={index} key={index}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {sections.length ? (
          <Strategy
            section={sections[activeStrategy] ?? sections[0]}
            selectedPlatforms={selectedPlatforms}
            key={activeStrategy}
          />
        ) : (
          <Markdown>
            {filterUnselectedPlatformMarkdown(text, selectedPlatforms)}
          </Markdown>
        )}
      </div>
    </details>
  );
}
