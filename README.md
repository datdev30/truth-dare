# Truth or Dare

A two-player Truth or Dare game for one shared phone. Pass the phone, roll the die, draw a card, and answer or do the dare. The interface is in Vietnamese and English.

There is no account and no server. The deck ships with the app, a round lives in memory, and names, language, opened cards, and recent rounds stay in the browser.

## How a round works

1. Choose a language, then enter both names and an avatar.
2. Pick who starts (or leave it random), the topics, the difficulty, and how many cards to deal. The default round is 10 cards.
3. On your turn, roll the die. An odd face is a Truth. An even face is a Dare.
4. Swipe the fan and flick the front card upward, or use the arrow keys and Enter, to draw it.
5. Read the prompt. Tap **Done** when you finish, or **Skip** if you would rather not.
6. The turn passes to the other player. A drawn pair does not return in later rounds until you bring the played questions back.
7. The round ends when the cards you asked for are gone. The summary counts how many were done and how many were skipped.

The deck is shuffled with a short deal animation. That animation is skipped when the device asks for reduced motion.

## What you can change before a round

| Setting | Options |
|---|---|
| Language | Vietnamese or English. The choice also selects which prompts are dealt. |
| Topics | Romantic, Funny, Deep talk. Turn any of them off. |
| Level | Easy, Medium, Hard, Extra hard. More than one level can be on at once. |
| Cards this round | From 1 up to the number of matching unopened pairs. |
| Who starts | Random, or a named player. |

**Start over** clears saved names, opened questions, and the last rounds. **Bring back every played question** clears only the opened-card list, so those prompts can be dealt again.

## Deck

Prompts live in `public/data/` and are checked with Zod before they are used.

| File | Role |
|---|---|
| `manifest.json` | App version, data version, and the paths of the other files. |
| `categories.json` | Topic id, icon, and the name and description in both languages. |
| `truth.json` | Truth prompts. |
| `dare.json` | Dare prompts. |

The shipped deck has 400 enabled truth prompts and 400 enabled dare prompts. Each language has its own copy. A prompt belongs to one topic and one difficulty: `easy`, `medium`, `hard`, or `extreme`.

A card looks like this:

```json
{
  "id": "truth_en_001",
  "category": "romantic",
  "difficulty": "easy",
  "locale": "en",
  "content": "What was your first impression of them?",
  "target": "current_player",
  "enabled": true
}
```

`target` is `current_player`, `partner`, or `both`, and only changes who the prompt is addressed to. `enabled: false` hides a prompt without deleting it. Ids must be unique, and `category` must match an id in `categories.json`. Truth and dare files are stored separately. The app pairs one unused truth with one unused dare when it deals.

After a valid load, the deck is cached in `localStorage` under `date-card:data`. If a later fetch fails, the app keeps playing with that copy and says it is using the saved deck. Bump `dataVersion` in `manifest.json` when you publish a new deck. The same version is not downloaded again.

The other saved keys are `date-card:settings` (language and names), `date-card:seen` (opened card ids), and `date-card:history` (the last 20 rounds).

Card faces are `public/card-back.png`, `public/card-truth.png`, and `public/card-dare.png`.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (the range Vite 8 asks for)
- npm

## Scripts

```bash
npm install
npm run dev
```

The dev server prints a local URL, usually `http://localhost:5173/`.

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm test` | Run the Vitest suite once. Tests cover dealing, the die, filtering, and the fan gesture. |
| `npm run build` | Typecheck with `tsc --noEmit`, then build the static site into `dist/`. |
| `npm run preview` | Serve the production build locally. |

## Project layout

```
public/data/          deck JSON
public/card-*.png     card faces
src/App.tsx           screens, saved settings, and the round lifecycle
src/screens.tsx       home, setup, topics, the table, and the summary
src/game.ts           filtering, dealing, the die, and resolving a card
src/fan.ts            fan positions and shuffle tracks
src/schema.ts         deck types and Zod checks
src/data.ts           load and cache the deck
src/storage.ts        names, language, opened cards, and recent rounds
src/copy.ts           Vietnamese and English interface text
src/*.test.ts         game and fan tests
```

## Stack

React 19, TypeScript, Vite 8, and Tailwind CSS 4. The UI is a single page with no router. Tests run in Vitest on Node, without a browser.
