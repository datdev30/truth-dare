import { useEffect, useRef, useState } from "react";
import { CardArt } from "./card";
import { copy } from "./copy";
import { loadDataset } from "./data";
import {
  buildSession,
  isFinished,
  pairCount,
  resolveCard,
  selectCard,
  tally,
  type Player,
  type Session,
} from "./game";
import type { HistoryEntry } from "./history";
import { Board, Config, Home, Setup, Shell, Summary } from "./screens";
import type { CardType, Dataset, Difficulty, Locale } from "./schema";
import { loadHistory, loadSeen, loadSettings, pushHistory, resetAll, saveSeen, saveSettings } from "./storage";

type Phase =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: Dataset; stale: boolean };

type Screen = "home" | "setup" | "config" | "board" | "summary";

const levels: Difficulty[] = ["easy", "medium", "hard"];

export default function App() {
  const [phase, setPhase] = useState<Phase>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [settings, setSettings] = useState(loadSettings);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [screen, setScreen] = useState<Screen>("home");
  const [players, setPlayers] = useState<[Player, Player]>(() => {
    const saved = loadSettings();
    return [
      { name: saved.names[0], avatar: "🐯" },
      { name: saved.names[1], avatar: "🐱" },
    ];
  });
  const [first, setFirst] = useState<0 | 1 | "random">("random");
  const [selected, setSelected] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>(levels);
  const [cardCount, setCardCount] = useState(10);
  const [seeded, setSeeded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [seen, setSeen] = useState(loadSeen);
  const lock = useRef(false);

  const t = copy[settings.locale];
  const used = new Set(seen);
  const fresh = phase.status === "ready" ? phase.data.cards.filter((card) => !used.has(card.id)) : [];
  const available = pairCount(fresh, { categories: selected, difficulties, locale: settings.locale });
  const count = Math.min(cardCount, available);

  useEffect(() => {
    document.documentElement.lang = settings.locale;
    saveSettings(settings);
  }, [settings]);

  useEffect(() => saveSeen(seen), [seen]);

  useEffect(() => {
    let live = true;
    loadDataset().then((result) => {
      if (!live) return;
      if (!result.data) setPhase({ status: "error" });
      else setPhase({ status: "ready", data: result.data, stale: result.stale });
    });
    return () => {
      live = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (phase.status !== "ready" || seeded) return;
    setSelected(phase.data.categories.map((category) => category.id));
    setSeeded(true);
  }, [phase, seeded]);

  function setLocale(locale: Locale) {
    setSettings((current) => ({ ...current, locale }));
  }

  function continueSetup() {
    const names: [string, string] = [players[0].name.trim(), players[1].name.trim()];
    if (!names[0] || !names[1]) return;
    setPlayers([
      { ...players[0], name: names[0] },
      { ...players[1], name: names[1] },
    ]);
    setSettings((current) => ({ ...current, names }));
    setScreen("config");
  }

  function deal() {
    if (phase.status !== "ready") return;
    const next = buildSession(fresh, players, {
      categories: selected,
      difficulties,
      locale: settings.locale,
      cardCount: count,
      firstPlayer: first,
    });
    if (next.deck.length === 0) return;
    setSession(next);
    setScreen("board");
  }

  function pick(id: string) {
    const pair = session?.deck.find((item) => item.id === id);
    if (pair) setSeen((current) => [...current, pair.truth.id, pair.dare.id]);
    setSession((current) => (current ? selectCard(current, id) : current));
  }

  function finish(action: "done" | "skip", choice: CardType) {
    if (!session?.activeId || lock.current) return;
    lock.current = true;
    const next = resolveCard(session, action, choice);
    setSession(next);
    if (isFinished(next)) {
      const score = tally(next);
      setHistory(
        pushHistory({
          id: crypto.randomUUID(),
          playedAt: new Date().toISOString(),
          players: [next.players[0].name, next.players[1].name],
          mode: "mixed",
          locale: next.locale,
          done: score.done,
          skip: score.skip,
          results: next.results,
        }),
      );
      setScreen("summary");
    }
    lock.current = false;
  }

  if (phase.status === "loading") {
    return (
      <Shell>
        <div className="hero-card m-auto w-40">
          <CardArt face="back">
            <p className="text-sm font-semibold text-white">{t.loading}</p>
          </CardArt>
        </div>
      </Shell>
    );
  }

  if (phase.status === "error") {
    return (
      <Shell>
        <div className="m-auto w-full">
          <p className="text-center font-display text-4xl leading-tight">{t.error}</p>
          <button type="button" className="btn mt-8" onClick={() => {
            setPhase({ status: "loading" });
            setAttempt((n) => n + 1);
          }}>
            {t.retry}
          </button>
        </div>
      </Shell>
    );
  }

  if (screen === "setup") {
    return (
      <Setup
        t={t}
        players={players}
        first={first}
        onPlayers={setPlayers}
        onFirst={setFirst}
        onBack={() => setScreen("home")}
        onContinue={continueSetup}
      />
    );
  }

  if (screen === "config") {
    return (
      <Config
        t={t}
        locale={settings.locale}
        categories={phase.data.categories}
        selected={selected}
        difficulties={difficulties}
        cardCount={count}
        available={available}
        opened={seen.length > 0}
        onReset={() => setSeen([])}
        onToggleCategory={(id) =>
          setSelected((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
          )
        }
        onToggleDifficulty={(level) =>
          setDifficulties((current) =>
            current.includes(level) ? current.filter((item) => item !== level) : [...current, level],
          )
        }
        onCount={(next) => setCardCount(Math.max(Math.min(4, available), Math.min(available, next)))}
        onBack={() => setScreen("setup")}
        onDeal={deal}
      />
    );
  }

  if (screen === "board" && session) {
    return (
      <Board
        t={t}
        session={session}
        onPick={pick}
        onResolve={finish}
        onBack={() => {
          setSession(null);
          setScreen("config");
        }}
      />
    );
  }

  if (screen === "summary" && session) {
    return (
      <Summary
        t={t}
        locale={settings.locale}
        session={session}
        categories={phase.data.categories}
        onAgain={() => setScreen("config")}
        onHome={() => setScreen("home")}
      />
    );
  }

  return (
    <Home
      t={t}
      locale={settings.locale}
      stale={phase.stale}
      history={history}
      onLocale={setLocale}
      onStart={() => setScreen("setup")}
      onReset={
        history.length > 0 || seen.length > 0
          ? () => {
              resetAll(settings.locale);
              window.location.reload();
            }
          : undefined
      }
    />
  );
}
