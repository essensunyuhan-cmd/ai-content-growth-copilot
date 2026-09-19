export interface Section {
  title: string;
  body: string;
}
export interface Field {
  label: string;
  value: string;
}

const platformAliases: Record<string, string[]> = {
  小红书: ["小红书", "xiaohongshu"],
  抖音: ["抖音", "douyin"],
  视频号: ["视频号", "微信视频号"],
  公众号: ["公众号", "微信公众号"],
  B站: ["b站", "哔哩哔哩", "bilibili"],
  快手: ["快手", "kuaishou"],
  微博: ["微博", "weibo"],
  知乎: ["知乎", "zhihu"],
};

function cleanPlatformName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/, "")
    .replace(/[（(【\[].*?[）)】\]]/g, "")
    .replace(/[\s·._-]/g, "")
    .trim();
}

function canonicalPlatformName(value: string): string {
  const cleaned = cleanPlatformName(value);
  for (const [canonical, aliases] of Object.entries(platformAliases)) {
    if (aliases.some((alias) => cleaned.includes(cleanPlatformName(alias)))) {
      return canonical;
    }
  }
  return cleaned;
}

export function parseSelectedPlatforms(value: string): string[] {
  const selected = new Set<string>();
  const cleaned = cleanPlatformName(value);

  for (const [canonical, aliases] of Object.entries(platformAliases)) {
    if (aliases.some((alias) => cleaned.includes(cleanPlatformName(alias)))) {
      selected.add(canonical);
    }
  }

  for (const token of value.split(/[、,，;；/|+＋\n]|(?:和|及|与)/)) {
    const canonical = canonicalPlatformName(token);
    if (canonical) selected.add(canonical);
  }

  return [...selected];
}

export function isSelectedPlatform(
  platform: string,
  selectedPlatforms: readonly string[],
): boolean {
  const canonical = canonicalPlatformName(platform);
  return selectedPlatforms.some(
    (selected) => canonical === canonicalPlatformName(selected),
  );
}

export function filterUnselectedPlatformMarkdown(
  text: string,
  selectedPlatforms: readonly string[],
): string {
  if (!selectedPlatforms.length) return text;

  const lines = text.split("\n");
  const kept: string[] = [];
  let skippedPlatformLevel: number | null = null;

  for (const line of lines) {
    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
    if (heading) {
      const level = heading[1].length;
      const name = heading[2];
      const isPlatformHeading = Object.keys(platformAliases).some(
        (platform) => canonicalPlatformName(name) === platform,
      );

      if (isPlatformHeading) {
        skippedPlatformLevel = isSelectedPlatform(name, selectedPlatforms)
          ? null
          : level;
        if (skippedPlatformLevel !== null) continue;
      } else if (
        skippedPlatformLevel !== null &&
        level <= skippedPlatformLevel
      ) {
        skippedPlatformLevel = null;
      }
    }

    if (skippedPlatformLevel === null) kept.push(line);
  }

  return kept.join("\n").trim();
}
export function splitSections(
  text: string,
  kind: "内容机会" | "内容策略",
): Section[] {
  const regex = new RegExp(
    `^\\s*(?:#{1,6}\\s*)?(?:\\*\\*)?【${kind}\\s*([1-3１-３])】[^\\n]*`,
    "gm",
  );
  const matches = [...text.matchAll(regex)];
  if (!matches.length || text.slice(0, matches[0].index).trim()) return [];
  return matches.map((m, i) => ({
    title: `${kind}${m[1]}`,
    body: text
      .slice(m.index! + m[0].length, matches[i + 1]?.index ?? text.length)
      .trim(),
  }));
}
export function parseFields(text: string): Field[] {
  const fields: Field[] = [];
  for (const line of text.split("\n")) {
    const clean = line
      .replace(/^\s*(?:[-*]\s+|\d+[.、]\s*)?/, "")
      .replace(/\*\*/g, "");
    const m = clean.match(/^([^：:\n]{1,22})[：:]\s*(.*)$/);
    if (m) fields.push({ label: m[1].trim(), value: m[2] });
    else if (fields.length) fields[fields.length - 1].value += `\n${line}`;
    else if (line.trim()) return [];
  }
  return fields.map((f) => ({ ...f, value: f.value.trim() }));
}
export function parsePlatforms(text: string): {
  intro: string;
  platforms: Section[];
} {
  const matches = [...text.matchAll(/^\s*###\s+([^\n]+)\s*$/gm)];
  return {
    intro: text.slice(0, matches[0]?.index ?? text.length).trim(),
    platforms: matches.map((m, i) => ({
      title: m[1].trim().replace(/\*\*/g, ""),
      body: text
        .slice(m.index! + m[0].length, matches[i + 1]?.index ?? text.length)
        .trim(),
    })),
  };
}
