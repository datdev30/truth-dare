import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildSession,
  diceSide,
  eligibleCards,
  isFinished,
  pairCount,
  resolveCard,
  rollDie,
  selectCard,
  tally,
  type Player,
} from "./game";
import { acceptUpdate, needsFetch, parseDataset, type Card, type Dataset } from "./schema";

const players: [Player, Player] = [
  { name: "Lan", avatar: "🌙" },
  { name: "Minh", avatar: "☀️" },
];

function card(partial: Partial<Card> & Pick<Card, "id" | "type">): Card {
  return {
    category: "romantic",
    difficulty: "easy",
    locale: "vi",
    content: partial.id,
    target: "current_player",
    enabled: true,
    ...partial,
  };
}

const base = {
  categories: ["romantic", "funny", "deep"],
  difficulties: ["easy", "medium", "hard"] as Array<"easy" | "medium" | "hard">,
  locale: "vi" as const,
  cardCount: 10,
  firstPlayer: 0 as const,
};

const category = {
  id: "romantic",
  name: { vi: "Lãng mạn", en: "Romantic" },
  description: { vi: "Hai người", en: "Two" },
  icon: "♥",
};

function files(truthIds: string[], dareIds: string[] = [], categoryId = "romantic") {
  const raw = (id: string) => ({
    id,
    category: categoryId,
    difficulty: "easy" as const,
    locale: "vi" as const,
    content: id,
    target: "current_player" as const,
    enabled: true,
  });
  return {
    dataVersion: "1",
    categories: { categories: [category] },
    truth: { cards: truthIds.map(raw) },
    dare: { cards: dareIds.map(raw) },
  };
}

describe("deck", () => {
  const cards = [
    card({ id: "t1", type: "truth" }),
    card({ id: "t2", type: "truth", category: "funny", difficulty: "hard" }),
    card({ id: "d1", type: "dare" }),
    card({ id: "d2", type: "dare", category: "deep", difficulty: "medium" }),
    card({ id: "off", type: "truth", enabled: false }),
    card({ id: "en", type: "truth", locale: "en" }),
  ];

  it("filters category, difficulty, locale, and disabled cards", () => {
    expect(eligibleCards(cards, { ...base, categories: ["funny"] }).map((c) => c.id)).toEqual([
      "t2",
    ]);
    expect(eligibleCards(cards, { ...base, difficulties: ["medium"] }).map((c) => c.id)).toEqual([
      "d2",
    ]);
    expect(eligibleCards(cards, { ...base, locale: "en" }).map((c) => c.id)).toEqual(["en"]);
    expect(eligibleCards(cards, base).some((c) => c.id === "off")).toBe(false);
  });

  const many = [
    ...Array.from({ length: 8 }, (_, i) => card({ id: `t${i}`, type: "truth" })),
    ...Array.from({ length: 6 }, (_, i) => card({ id: `d${i}`, type: "dare" })),
  ];

  it("pairs one truth with one dare per card, capped by the shorter side", () => {
    expect(pairCount(many, base)).toBe(6);
    const short = buildSession(many, players, { ...base, cardCount: 4 });
    expect(short.deck).toHaveLength(4);
    expect(short.deck.every((p) => p.truth.type === "truth" && p.dare.type === "dare")).toBe(true);
    expect(buildSession(many, players, { ...base, cardCount: 10 }).deck).toHaveLength(6);
    expect(pairCount(many.slice(0, 8), base)).toBe(0);
  });

  it("records the chosen side, never repeats, and alternates turns", () => {
    let session = buildSession(many, players, { ...base, cardCount: 5, firstPlayer: 0 }, () => 0.3);
    const ids: string[] = [];
    const actors: number[] = [];
    while (session.deck.length) {
      const pair = session.deck[0];
      const picked = selectCard(session, pair.id);
      expect(picked.deck).toHaveLength(session.deck.length);
      const choice = ids.length % 2 === 0 ? "truth" : "dare";
      session = resolveCard(picked, ids.length % 2 === 0 ? "done" : "skip", choice);
      expect(session.results.at(-1)!.cardId).toBe(pair[choice].id);
      ids.push(pair.id);
      actors.push(session.results.at(-1)!.playerIndex);
    }
    expect(new Set(ids).size).toBe(5);
    expect(actors).toEqual([0, 1, 0, 1, 0]);
    expect(isFinished(session)).toBe(true);
    expect(tally(session)).toEqual({ done: 3, skip: 2 });
    expect(session.results.map((r) => r.type)).toEqual(["truth", "dare", "truth", "dare", "truth"]);
  });

  it("rolls 1-6 and maps odd to truth, even to dare", () => {
    expect([0, 0.17, 0.34, 0.5, 0.67, 0.999].map((r) => rollDie(() => r))).toEqual([1, 2, 3, 4, 5, 6]);
    expect([1, 2, 3, 4, 5, 6].map(diceSide)).toEqual(["truth", "dare", "truth", "dare", "truth", "dare"]);
  });

  it("randomizes the first player", () => {
    const second = buildSession(many, players, { ...base, firstPlayer: "random" }, () => 0.9);
    expect(second.turn).toBe(1);
  });
});

describe("dataset", () => {
  it("rejects duplicate ids and unknown categories", () => {
    const dup = parseDataset(files(["a", "a"]));
    expect(dup.ok).toBe(false);
    const unknown = parseDataset(files(["a"], [], "missing"));
    expect(unknown.ok).toBe(false);
  });

  it("keeps the previous dataset when the next one is invalid", () => {
    const good = parseDataset(files(["a"], ["b"]));
    expect(good.ok).toBe(true);
    if (!good.ok) return;
    const bad = parseDataset({ dataVersion: "2", categories: {}, truth: {}, dare: {} });
    expect(bad.ok).toBe(false);
    expect(acceptUpdate(good.data, bad)).toBe(good.data);
    const prev: Dataset | null = null;
    expect(acceptUpdate(prev, bad)).toBeNull();
  });

  it("accepts the shipped deck", () => {
    const load = (name: string) => JSON.parse(readFileSync(`public/data/${name}`, "utf8")) as unknown;
    const manifest = load("manifest.json") as { dataVersion: string };
    const parsed = parseDataset({
      dataVersion: manifest.dataVersion,
      categories: load("categories.json"),
      truth: load("truth.json"),
      dare: load("dare.json"),
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.cards.filter((card) => card.enabled && card.locale === "vi")).toHaveLength(400);
    expect(parsed.data.cards.some((card) => card.id === "truth_vi_off" && !card.enabled)).toBe(true);
  });

  it("downloads only when the manifest version changes", () => {
    expect(needsFetch("1.0.0", "1.0.0")).toBe(false);
    expect(needsFetch("1.0.0", "1.1.0")).toBe(true);
    expect(needsFetch(null, "1.0.0")).toBe(true);
  });
});
