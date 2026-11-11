import { z } from "zod";

export type Locale = "vi" | "en";
export type Difficulty = "easy" | "medium" | "hard" | "extreme";
export type Target = "current_player" | "partner" | "both";
export type CardType = "truth" | "dare";
export type Mode = "truth" | "dare" | "mixed";

export type Category = {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  icon: string;
};

export type Card = {
  id: string;
  type: CardType;
  category: string;
  difficulty: Difficulty;
  locale: Locale;
  content: string;
  target: Target;
  enabled: boolean;
};

export type Dataset = {
  dataVersion: string;
  categories: Category[];
  cards: Card[];
};

const text = z.object({
  vi: z.string().trim().min(1),
  en: z.string().trim().min(1),
});

const categorySchema = z.object({
  id: z.string().trim().min(1),
  name: text,
  description: text,
  icon: z.string().trim().min(1),
});

const categoriesFile = z.object({
  categories: z.array(categorySchema).min(1),
});

const cardSchema = z.object({
  id: z.string().trim().min(1),
  category: z.string().trim().min(1),
  difficulty: z.enum(["easy", "medium", "hard", "extreme"]),
  locale: z.enum(["vi", "en"]),
  content: z.string().trim().min(1),
  target: z.enum(["current_player", "partner", "both"]),
  enabled: z.boolean(),
});

const cardsFile = z.object({
  version: z.number().optional(),
  cards: z.array(cardSchema),
});

export const manifestSchema = z.object({
  appVersion: z.string().min(1),
  dataVersion: z.string().min(1),
  lastUpdated: z.string().min(1),
  files: z.object({
    categories: z.string().min(1),
    truth: z.string().min(1),
    dare: z.string().min(1),
  }),
});

export type ParseResult =
  | { ok: true; data: Dataset }
  | { ok: false; error: string };

export function parseDataset(input: {
  dataVersion: string;
  categories: unknown;
  truth: unknown;
  dare: unknown;
}): ParseResult {
  if (!input.dataVersion.trim()) return { ok: false, error: "version" };
  const categories = categoriesFile.safeParse(input.categories);
  if (!categories.success) return { ok: false, error: "categories" };
  const truth = cardsFile.safeParse(input.truth);
  if (!truth.success) return { ok: false, error: "truth" };
  const dare = cardsFile.safeParse(input.dare);
  if (!dare.success) return { ok: false, error: "dare" };

  const catIds = new Set<string>();
  for (const category of categories.data.categories) {
    if (catIds.has(category.id)) return { ok: false, error: "duplicate category" };
    catIds.add(category.id);
  }

  const ids = new Set<string>();
  const cards: Card[] = [];
  for (const [type, file] of [
    ["truth", truth.data],
    ["dare", dare.data],
  ] as const) {
    for (const card of file.cards) {
      if (ids.has(card.id)) return { ok: false, error: "duplicate id" };
      if (!catIds.has(card.category)) return { ok: false, error: "unknown category" };
      ids.add(card.id);
      cards.push({ ...card, type });
    }
  }

  return {
    ok: true,
    data: {
      dataVersion: input.dataVersion,
      categories: categories.data.categories,
      cards,
    },
  };
}

export function acceptUpdate(prev: Dataset | null, parsed: ParseResult): Dataset | null {
  return parsed.ok ? parsed.data : prev;
}

export function needsFetch(cachedVersion: string | null, remoteVersion: string): boolean {
  return cachedVersion !== remoteVersion;
}
