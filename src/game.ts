import type { Card, CardType, Difficulty, Locale } from "./schema";

export type Player = { name: string; avatar: string };

export type GameConfig = {
  categories: string[];
  difficulties: Difficulty[];
  locale: Locale;
  cardCount: number;
  firstPlayer: 0 | 1 | "random";
};

export type PlayAction = "done" | "skip";

export type Pair = { id: string; truth: Card; dare: Card };

export type ResultEntry = {
  cardId: string;
  type: CardType;
  category: string;
  content: string;
  playerIndex: 0 | 1;
  action: PlayAction;
};

export type Session = {
  players: [Player, Player];
  locale: Locale;
  turn: 0 | 1;
  deck: Pair[];
  activeId: string | null;
  results: ResultEntry[];
};

type Filter = Pick<GameConfig, "categories" | "difficulties" | "locale">;

export function eligibleCards(cards: Card[], filter: Filter): Card[] {
  const categories = new Set(filter.categories);
  const difficulties = new Set(filter.difficulties);
  return cards.filter((card) => {
    if (!card.enabled) return false;
    if (card.locale !== filter.locale) return false;
    if (!categories.has(card.category)) return false;
    if (!difficulties.has(card.difficulty)) return false;
    return true;
  });
}

export function pairCount(cards: Card[], filter: Filter): number {
  const pool = eligibleCards(cards, filter);
  const truths = pool.filter((card) => card.type === "truth").length;
  return Math.min(truths, pool.length - truths);
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = items.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

export function buildSession(
  cards: Card[],
  players: [Player, Player],
  config: GameConfig,
  rng: () => number = Math.random,
): Session {
  const pool = eligibleCards(cards, config);
  const truths = shuffle(pool.filter((card) => card.type === "truth"), rng);
  const dares = shuffle(pool.filter((card) => card.type === "dare"), rng);
  const count = Math.min(Math.max(config.cardCount, 0), truths.length, dares.length);
  const first = config.firstPlayer === "random" ? (rng() < 0.5 ? 0 : 1) : config.firstPlayer;
  return {
    players,
    locale: config.locale,
    turn: first,
    deck: truths.slice(0, count).map((truth, i) => ({ id: `${truth.id}+${dares[i].id}`, truth, dare: dares[i] })),
    activeId: null,
    results: [],
  };
}

export function selectCard(session: Session, pairId: string): Session {
  if (session.activeId) return session;
  if (!session.deck.some((pair) => pair.id === pairId)) return session;
  return { ...session, activeId: pairId };
}

export function resolveCard(session: Session, action: PlayAction, choice: CardType): Session {
  const pair = session.deck.find((item) => item.id === session.activeId);
  if (!pair) return session;
  const card = pair[choice];
  return {
    ...session,
    activeId: null,
    turn: session.turn === 0 ? 1 : 0,
    deck: session.deck.filter((item) => item.id !== pair.id),
    results: [
      ...session.results,
      {
        cardId: card.id,
        type: card.type,
        category: card.category,
        content: card.content,
        playerIndex: session.turn,
        action,
      },
    ],
  };
}

export function isFinished(session: Session): boolean {
  return session.activeId === null && session.deck.length === 0 && session.results.length > 0;
}

export function tally(session: Session): { done: number; skip: number } {
  return {
    done: session.results.filter((result) => result.action === "done").length,
    skip: session.results.filter((result) => result.action === "skip").length,
  };
}
