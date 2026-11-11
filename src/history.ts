import type { ResultEntry } from "./game";
import type { Locale, Mode } from "./schema";

export type HistoryEntry = {
  id: string;
  playedAt: string;
  players: [string, string];
  mode: Mode;
  locale: Locale;
  done: number;
  skip: number;
  results: ResultEntry[];
};
