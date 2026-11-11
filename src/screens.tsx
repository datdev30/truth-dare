import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type Dispatch, type PointerEvent, type ReactNode, type SetStateAction } from "react";
import { CardArt, CategoryMark, SeatMark } from "./card";
import { avatars, type Copy } from "./copy";
import type { Pair, Player, Session } from "./game";
import { fanMiddle, fanStep } from "./fan";
import type { HistoryEntry } from "./history";
import type { Card, CardType, Category, Difficulty, Locale } from "./schema";

const primary = "btn";
const quiet = "quiet";

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="back" onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.5 6.5 9 12l5.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="rise mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-clip px-5 pt-[calc(env(safe-area-inset-top,0px)+2.75rem)] pb-8">
      {children}
    </main>
  );
}

function choiceClass() {
  return "chip text-sm";
}

export function Home({
  t,
  locale,
  stale,
  history,
  onLocale,
  onStart,
  onReset,
}: {
  t: Copy;
  locale: Locale;
  stale: boolean;
  history: HistoryEntry[];
  onLocale: (locale: Locale) => void;
  onStart: () => void;
  onReset?: () => void;
}) {
  const [open, setOpen] = useState<"how" | "reset" | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[18rem] flex-1 flex-col">
        <div className="flex items-center">
          {onReset ? (
            <button type="button" className="round" aria-label={t.restart} title={t.restart} onClick={() => setOpen("reset")}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.7h3.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
          <div role="group" aria-label={t.lang} className="lang ml-auto">
            {(["vi", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={locale === code}
                onClick={() => onLocale(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center py-6">
          <div className="hero-card w-full">
            <CardArt face="back" shine>
              <h1 className="font-display text-[1.55rem] leading-none text-[#a12d55]">
                Truth
                <span className="mt-1 block font-sans text-[0.62rem] tracking-[0.28em]">OR</span>
                Dare
              </h1>
            </CardArt>
          </div>
          {stale ? <p className="mt-6 text-center text-sm text-mist">{t.stale}</p> : null}
          <div className="mt-7 flex w-full flex-col items-center gap-1">
            <button type="button" className={primary} onClick={onStart}>
              {t.start}
            </button>
            <button type="button" className={quiet} onClick={() => setOpen("how")}>
              {t.howTo}
            </button>
          </div>
        </div>
        {history.length > 0 ? (
          <section>
            <h2 className="text-sm text-mist">{t.recent}</h2>
            <ul className="mt-2">
              {history.slice(0, 5).map((entry) => (
                <li key={entry.id} className="border-t border-white/40 py-3 text-sm">
                  <p>{t.roundLine(entry.players[0], entry.players[1], entry.done, entry.skip)}</p>
                  <p className="text-mist">
                    {new Intl.DateTimeFormat(locale, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(entry.playedAt))}
                    {" · "}
                    {entry.mode === "truth" ? t.truth : entry.mode === "dare" ? t.dare : t.mixed}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      {open ? (
        <div className="veil fixed inset-0 z-20 flex items-end bg-black/60" onClick={() => setOpen(null)}>
          <div
            role={open === "reset" ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="sheet max-h-[85dvh] w-full overflow-auto rounded-t-3xl bg-night px-5 pt-6 pb-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto max-w-[430px]">
              <h2 id="sheet-title" className="font-display text-4xl">
                {open === "reset" ? t.restart : t.howTitle}
              </h2>
              {(open === "reset" ? [t.restartConfirm] : t.howBody).map((line) => (
                <p key={line} className="mt-3 text-base leading-relaxed text-mist">
                  {line}
                </p>
              ))}
              {open === "reset" ? (
                <div className="mt-6 flex flex-col items-center gap-1">
                  <button type="button" className={primary} onClick={onReset}>
                    {t.restartYes}
                  </button>
                  <button ref={closeRef} type="button" className={quiet} onClick={() => setOpen(null)}>
                    {t.back}
                  </button>
                </div>
              ) : (
                <button ref={closeRef} type="button" className={`${primary} mt-6`} onClick={() => setOpen(null)}>
                  {t.close}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

export function Setup({
  t,
  players,
  first,
  onPlayers,
  onFirst,
  onBack,
  onContinue,
}: {
  t: Copy;
  players: [Player, Player];
  first: 0 | 1 | "random";
  onPlayers: Dispatch<SetStateAction<[Player, Player]>>;
  onFirst: (first: 0 | 1 | "random") => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const ready = players.every((player) => player.name.trim().length > 0);
  return (
    <Shell>
      <BackButton label={t.back} onClick={onBack} />
      <form
        className="mt-4 flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onContinue();
        }}
      >
        {players.map((player, index) => (
          <fieldset key={index} className={index === 0 ? "" : "mt-7"}>
            <legend className="text-sm text-mist">{t.player(index + 1)}</legend>
            <div className="seat">
            <SeatMark emoji={player.avatar} />
            <label className="block min-w-0 flex-1">
              <span className="sr-only">{t.name}</span>
              <input
                value={player.name}
                maxLength={16}
                autoComplete="off"
                className="name"
                onChange={(event) => {
                  const value = event.target.value.slice(0, 16);
                  onPlayers((current) => {
                    const next: [Player, Player] = [current[0], current[1]];
                    next[index] = { ...current[index], name: value };
                    return next;
                  });
                }}
              />
            </label>
            </div>
            <div className="mt-3 grid grid-cols-6 justify-items-center gap-1" role="group" aria-label={t.player(index + 1)}>
                {avatars.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-pressed={player.avatar === emoji}
                    aria-label={t.avatar(emoji)}
                    className="face-btn"
                    onClick={() => {
                      onPlayers((current) => {
                        const next: [Player, Player] = [current[0], current[1]];
                        next[index] = { ...current[index], avatar: emoji };
                        return next;
                      });
                    }}
                  >
                    {emoji}
                  </button>
                ))}
            </div>
          </fieldset>
        ))}
        <fieldset className="mt-8">
          <legend className="text-sm text-mist">{t.first}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(
              [
                ["random", t.random],
                ["0", players[0].name.trim() || t.player(1)],
                ["1", players[1].name.trim() || t.player(2)],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={String(first) === value}
                className={choiceClass()}
                onClick={() => onFirst(value === "random" ? "random" : value === "0" ? 0 : 1)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" className={`${primary} mt-auto`} disabled={!ready}>
          {t.continue}
        </button>
      </form>
    </Shell>
  );
}

export function Config({
  t,
  locale,
  categories,
  selected,
  difficulties,
  cardCount,
  available,
  opened,
  onReset,
  onToggleCategory,
  onToggleDifficulty,
  onCount,
  onBack,
  onDeal,
}: {
  t: Copy;
  locale: Locale;
  categories: Category[];
  selected: string[];
  difficulties: Difficulty[];
  cardCount: number;
  available: number;
  opened: boolean;
  onReset: () => void;
  onToggleCategory: (id: string) => void;
  onToggleDifficulty: (level: Difficulty) => void;
  onCount: (count: number) => void;
  onBack: () => void;
  onDeal: () => void;
}) {
  const levels: Difficulty[] = ["easy", "medium", "hard", "extreme"];
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <Shell>
      <BackButton label={t.back} onClick={onBack} />
      <form
        noValidate
        className="mt-2 flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (available > 0) onDeal();
        }}
      >
        <fieldset>
          <legend className="text-sm text-mist">{t.categories}</legend>
          <div className="mt-2 flex flex-col gap-2">
            {categories.map((category) => {
              const on = selected.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={on}
                  className="pick"
                  onClick={() => onToggleCategory(category.id)}
                >
                  <span className="tick" aria-hidden="true" />
                  <span>
                    <span className="block">
                      <CategoryMark id={category.id} /> {category.name[locale]}
                    </span>
                    <span className="mt-0.5 block text-sm text-mist">{category.description[locale]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="text-sm text-mist">{t.difficulty}</legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {levels.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={difficulties.includes(level)}
                className={choiceClass()}
                onClick={() => onToggleDifficulty(level)}
              >
                {t[level]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="text-sm text-mist">{t.cards}</legend>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              className="step"
              aria-label={t.fewer}
              disabled={cardCount <= Math.min(4, available)}
              onClick={() => onCount(cardCount - 1)}
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={Math.min(4, available)}
              max={available}
              aria-label={t.cards}
              className="count-input"
              value={draft ?? cardCount}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                setDraft(event.target.value);
                if (event.target.value) onCount(Number(event.target.value));
              }}
              onBlur={() => setDraft(null)}
            />
            <button
              type="button"
              className="step"
              aria-label={t.more}
              disabled={cardCount >= available}
              onClick={() => onCount(cardCount + 1)}
            >
              +
            </button>
          </div>
        </fieldset>
        <p className="mt-4 text-center text-sm text-mist">
          {available === 0 ? (opened ? t.allOpened : t.noCards) : t.match(available)}
        </p>
        {opened ? (
          <button type="button" className={`${quiet} mx-auto`} onClick={onReset}>
            {t.reset}
          </button>
        ) : null}
        <button type="submit" className={`${primary} mt-auto`} disabled={available === 0}>
          {t.deal}
        </button>
      </form>
    </Shell>
  );
}

function audience(card: Card, session: Session, t: Copy) {
  const me = session.players[session.turn].name;
  const them = session.players[session.turn === 0 ? 1 : 0].name;
  if (card.target === "both") return t.forBoth(me, them);
  if (card.target === "partner") return t.forPlayer(them);
  return t.forPlayer(me);
}

function Reveal({
  pair,
  session,
  t,
  onResolve,
}: {
  pair: Pair;
  session: Session;
  t: Copy;
  onResolve: (action: "done" | "skip", choice: CardType) => void;
}) {
  const [face, setFace] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [choice, setChoice] = useState<CardType | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setFace(true);
      cardRef.current?.focus();
      return;
    }
    setFace(false);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        setFace(true);
        cardRef.current?.focus();
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pair.id]);

  return (
    <div className="mt-6 flex flex-1 flex-col">
      <div className="flip">
        <div className={`flip-inner ${face ? "is-flipped" : ""}`}>
          <div className="face" aria-hidden="true">
            <CardArt face="back" />
          </div>
          <article ref={cardRef} tabIndex={-1} className="face front">
            <CardArt face="front">
              <div className="ink pair">
                {(["truth", "dare"] as const).map((type) => {
                  const card = pair[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      className="pair-option"
                      aria-pressed={choice === type}
                      onClick={() => setChoice(type)}
                    >
                      <span className="flex items-center gap-2 text-sm text-ink">
                        <span
                          className={`h-2 w-2 rounded-full ${type === "truth" ? "bg-rose" : "bg-ink"}`}
                          aria-hidden="true"
                        />
                        {t[type]}
                      </span>
                      <span className="pair-text font-display">{card.content}</span>
                      <span className="text-xs text-[#5c5168]">{audience(card, session, t)}</span>
                    </button>
                  );
                })}
              </div>
            </CardArt>
          </article>
        </div>
      </div>
      <div className="face-actions ink mt-5 flex flex-col items-center gap-1">
        <button
          type="button"
          className={primary}
          disabled={!choice}
          onClick={() => choice && onResolve("done", choice)}
        >
          {choice ? t.done : t.choose}
        </button>
        <button type="button" className={quiet} onClick={() => onResolve("skip", choice ?? "truth")}>
          {t.skip}
        </button>
      </div>
    </div>
  );
}

function Fan({
  cards,
  pickLabel,
  enter,
  onPick,
}: {
  cards: { id: string }[];
  pickLabel: string;
  enter: boolean;
  onPick: (id: string) => void;
}) {
  const start = fanMiddle(cards.length);
  const [index, setIndex] = useState(start);
  const fanRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(start);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const gesture = useRef<{ x: number; y: number; axis: "x" | "y" | null; dx: number; dy: number } | null>(null);
  const [dealing, setDealing] = useState(
    () => enter && (typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches),
  );

  function place(shift: number, lift: number, animate: boolean) {
    const el = fanRef.current;
    if (!el) return;
    el.classList.toggle("is-drag", !animate);
    if (animate) void el.offsetWidth;
    el.style.setProperty("--shift", String(shift));
    el.style.setProperty("--lift", `${lift}px`);
  }

  function settle(next: number) {
    const count = cardsRef.current.length;
    const clamped = Math.max(0, Math.min(count - 1, next));
    indexRef.current = clamped;
    place(clamped, 0, true);
    setIndex(clamped);
  }

  useLayoutEffect(() => {
    fanRef.current?.style.setProperty("--n", String(cardsRef.current.length));
    settle(indexRef.current);
  }, [cards.length]);

  useEffect(() => {
    if (!dealing) return;
    const last = fanRef.current?.querySelector<HTMLElement>(".fan-card:last-child");
    if (!last) return;
    const stop = () => setDealing(false);
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName !== "shuffle-in") return;
      stop();
    };
    last.addEventListener("animationend", onEnd);
    const timer = window.setTimeout(stop, 4600);
    return () => {
      last.removeEventListener("animationend", onEnd);
      window.clearTimeout(timer);
    };
  }, [dealing]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    gesture.current = { x: event.clientX, y: event.clientY, axis: null, dx: 0, dy: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-drag");
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    const el = fanRef.current;
    if (!g || !el) return;
    g.dx = event.clientX - g.x;
    g.dy = event.clientY - g.y;
    if (!g.axis && Math.hypot(g.dx, g.dy) > 6) g.axis = Math.abs(g.dx) > Math.abs(g.dy) ? "x" : "y";
    const max = cardsRef.current.length - 1;
    if (g.axis === "x") {
      let shift = indexRef.current - g.dx / 72;
      if (shift < 0) shift *= 0.35;
      else if (shift > max) shift = max + (shift - max) * 0.35;
      el.style.setProperty("--shift", String(shift));
      el.style.setProperty("--lift", "0px");
    } else if (g.axis === "y") {
      el.style.setProperty("--lift", `${Math.max(0, -g.dy)}px`);
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const deck = cardsRef.current;
    if (g.axis === "x") settle(fanStep(indexRef.current, deck.length, g.dx));
    else if (g.axis === "y" && g.dy < -88 && deck[indexRef.current]) onPick(deck[indexRef.current].id);
    else if (g.axis === "y") place(indexRef.current, 0, true);
    else {
      const hit = (event.target as HTMLElement).closest("[data-i]");
      const next = hit ? Number(hit.getAttribute("data-i")) : indexRef.current;
      if (!Number.isNaN(next)) settle(next);
      else event.currentTarget.classList.remove("is-drag");
    }
  }

  return (
    <div
      ref={fanRef}
      className={dealing ? "fan is-dealing" : "fan"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          settle(indexRef.current + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          settle(indexRef.current - 1);
        } else if ((event.key === "ArrowUp" || event.key === "Enter") && cardsRef.current[indexRef.current]) {
          event.preventDefault();
          onPick(cardsRef.current[indexRef.current].id);
        }
      }}
      tabIndex={0}
      aria-label={pickLabel}
    >
      {cards.map((card, i) => (
        <button
          key={card.id}
          type="button"
          data-i={i}
          tabIndex={-1}
          className="fan-card"
          aria-current={i === index ? "true" : undefined}
          aria-label={i === index ? `${pickLabel} ${i + 1}` : undefined}
          style={{ "--i": i } as CSSProperties}
        >
          <CardArt face="back" />
        </button>
      ))}
    </div>
  );
}

export function Board({
  t,
  session,
  onPick,
  onResolve,
  onBack,
}: {
  t: Copy;
  session: Session;
  onPick: (id: string) => void;
  onResolve: (action: "done" | "skip", choice: CardType) => void;
  onBack: () => void;
}) {
  const seen = useRef(false);
  const enter = !seen.current;
  useEffect(() => {
    seen.current = true;
  }, []);
  const player = session.players[session.turn];
  const active = session.deck.find((pair) => pair.id === session.activeId) ?? null;
  return (
    <Shell>
      {session.results.length === 0 && !active ? (
        <BackButton label={t.back} onClick={onBack} />
      ) : (
        <span className="min-h-12" />
      )}
      <div key={session.turn} className="swap">
        <p className="text-sm text-mist" aria-live="polite">
          {t.turn(player.name)}
        </p>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="truncate font-display text-4xl">
            <span aria-hidden="true">{player.avatar} </span>
            {player.name}
          </h1>
          <p className="shrink-0 text-sm text-mist">{t.left(session.deck.length)}</p>
        </div>
      </div>
      {active ? (
        <Reveal
          key={active.id}
          pair={active}
          session={session}
          t={t}
          onResolve={onResolve}
        />
      ) : (
        <div className="flex flex-1 flex-col justify-center">
          <Fan cards={session.deck} pickLabel={t.pickCard} enter={enter} onPick={onPick} />
        </div>
      )}
    </Shell>
  );
}

export function Summary({
  t,
  locale,
  session,
  categories,
  onAgain,
  onHome,
}: {
  t: Copy;
  locale: Locale;
  session: Session;
  categories: Category[];
  onAgain: () => void;
  onHome: () => void;
}) {
  const done = session.results.filter((result) => result.action === "done").length;
  const skip = session.results.length - done;
  return (
    <Shell>
      <h1 className="font-display text-5xl">{t.deckTitle}</h1>
      <p className="mt-2 text-mist">{t.endLine(done, skip)}</p>
      <ul className="mt-6">
        {session.results.map((result, index) => {
          const category = categories.find((item) => item.id === result.category);
          return (
            <li key={result.cardId} className="slip" style={{ animationDelay: `${index * 70}ms` }}>
              <p className="text-sm text-mist">
                {session.players[result.playerIndex].name}
                {" · "}
                {result.type === "truth" ? t.truth : t.dare}
                {category ? ` · ${category.name[locale]}` : ""}
              </p>
              <p className="mt-1 font-display text-2xl leading-snug">{result.content}</p>
              <p className="mt-1 text-sm text-gold">{result.action === "done" ? t.done : t.skip}</p>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto flex flex-col items-center gap-1 pt-8">
        <button type="button" className={primary} onClick={onAgain}>
          {t.playAgain}
        </button>
        <button type="button" className={quiet} onClick={onHome}>
          {t.home}
        </button>
      </div>
    </Shell>
  );
}
