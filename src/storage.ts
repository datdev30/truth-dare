import type { HistoryEntry } from "./history";
import type { Locale } from "./schema";

const SETTINGS = "date-card:settings";
const HISTORY = "date-card:history";
const SEEN = "date-card:seen";

export type Settings = {
  locale: Locale;
  names: [string, string];
};

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

export function loadSettings(): Settings {
  const fallback: Locale =
    typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")
      ? "en"
      : "vi";
  try {
    const parsed = JSON.parse(read(SETTINGS) ?? "") as Partial<Settings>;
    const locale = parsed.locale === "en" || parsed.locale === "vi" ? parsed.locale : fallback;
    return {
      locale,
      names: [String(parsed.names?.[0] ?? ""), String(parsed.names?.[1] ?? "")],
    };
  } catch {
    return { locale: fallback, names: ["", ""] };
  }
}

export function saveSettings(settings: Settings) {
  write(SETTINGS, JSON.stringify(settings));
}

export function loadSeen(): string[] {
  try {
    const parsed = JSON.parse(read(SEEN) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveSeen(ids: string[]) {
  write(SEEN, JSON.stringify(ids));
}

export function resetAll(locale: Locale) {
  try {
    localStorage.removeItem(HISTORY);
    localStorage.removeItem(SEEN);
  } catch {
    /* private mode */
  }
  saveSettings({ locale, names: ["", ""] });
}

function isEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as HistoryEntry;
  return (
    typeof entry.id === "string" &&
    Array.isArray(entry.players) &&
    entry.players.length === 2 &&
    typeof entry.done === "number" &&
    typeof entry.skip === "number" &&
    Array.isArray(entry.results)
  );
}

export function loadHistory(): HistoryEntry[] {
  try {
    const parsed = JSON.parse(read(HISTORY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry).slice(0, 20);
  } catch {
    return [];
  }
}

// ponytail: last 20 rounds in localStorage; IndexedDB if a round log needs the full text later
export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, 20);
  write(HISTORY, JSON.stringify(next));
  return next;
}
