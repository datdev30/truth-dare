# Couple Truth or Dare -- Project Plan

**Document type:** Technical project plan\
**Version:** 1.0\
**Date:** 2026-11-11

------------------------------------------------------------------------

## 1. Project Overview

Build a mobile-first couple game as a web application, then package it
in a lightweight Android APK using Android WebView.

The APK is installed once and loads the game from a hosted website.
Updates to the web application and question data are deployed to the
server, so users can receive changes without rebuilding or reinstalling
the APK, provided the native Android wrapper and website URL remain
unchanged.

### Core concept

Two players take turns selecting cards. Each card contains either:

-   **Truth:** a question the player must answer.
-   **Dare:** a challenge the player is invited to complete.

Question and challenge content is maintained in JSON files, separately
from the application code.

### MVP goals

-   Two-player, same-device gameplay.
-   Truth, Dare, or mixed card modes.
-   Category and difficulty filters.
-   Randomized card selection without repeats in a session.
-   Turn management.
-   Card reveal and completion/skip actions.
-   Local game history and settings.
-   Responsive mobile-first interface.
-   Android WebView APK wrapper.
-   Web and JSON data updates without rebuilding the APK.

### Out of scope for MVP

-   User accounts and authentication.
-   Online multiplayer.
-   Backend database.
-   Admin dashboard.
-   Cloud synchronization between devices.
-   Payments or subscriptions.

------------------------------------------------------------------------

## 2. Recommended Architecture

``` text
┌──────────────────────────────────────────────┐
│               Android APK                    │
│        Kotlin + Android WebView               │
│   Loads the hosted game using HTTPS URL       │
└──────────────────────┬───────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────┐
│              Web Game Application            │
│                                              │
│  React + TypeScript + Vite                    │
│  UI / Game Engine / State Management          │
│  Question Service / Data Version Manager      │
└───────────────┬──────────────────┬───────────┘
                │                  │
                ▼                  ▼
┌────────────────────────┐  ┌───────────────────┐
│ Hosted JSON files      │  │ Browser Storage   │
│                        │  │                   │
│ categories.json        │  │ LocalStorage      │
│ truth.json             │  │ IndexedDB          │
│ dare.json              │  │ Settings/history  │
│ manifest.json          │  │ Session state     │
└────────────────────────┘  └───────────────────┘
                ▲
                │
┌───────────────┴───────────────────────────────┐
│              Static Hosting / CDN             │
│          HTTPS + deployment + cache           │
└───────────────────────────────────────────────┘
```

### Architecture principles

1.  The Android APK is a native wrapper, not the place where game
    content or gameplay logic lives.
2.  The web application owns the game UI, rules, state, and data-loading
    logic.
3.  Questions and categories are stored in external JSON files.
4.  Browser storage is used for local settings and history.
5.  Web asset versioning and question-data versioning are independent.
6.  The app must handle offline, stale-cache, and failed-update
    scenarios gracefully.

### Why React + Vite instead of Next.js?

The MVP is a client-side game. It does not require SEO, server-side
rendering, or server components. React + Vite is therefore a simpler
starting point. Next.js can be considered later if the project adds a
public content website, server-rendered pages, or backend APIs.

------------------------------------------------------------------------

## 3. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React + TypeScript      Application UI

  Build tool              Vite                    Development and
                                                  production builds

  Styling                 Tailwind CSS            Responsive styling

  Animation               Framer Motion           Card flip and screen
                                                  transitions

  Client state            Zustand                 Current game/session
                                                  state

  Data fetching/cache     TanStack Query          Fetching and caching
                                                  JSON

  Validation              Zod                     Runtime validation of
                                                  JSON data

  Local persistence       LocalStorage /          Settings, history,
                          IndexedDB               cached data

  Android wrapper         Kotlin + Android        Load hosted web
                          WebView                 application

  Hosting                 Static hosting / CDN    Serve web assets and
                                                  JSON

  Transport               HTTPS                   Secure communication
  -----------------------------------------------------------------------

### State-management responsibilities

-   **Zustand:** active players, current turn, selected mode, selected
    category, deck, selected card, and session progress.
-   **TanStack Query:** fetch question files and manifest, cache
    responses, and refresh data when the version changes.
-   **LocalStorage:** lightweight settings and recent session
    information.
-   **IndexedDB:** optional larger local history or offline data cache.

Avoid storing the same state redundantly in multiple systems.

------------------------------------------------------------------------

## 4. Gameplay Design

### 4.1 Game flow

``` mermaid
flowchart TD
    A[Home Screen] --> B[Player Setup]
    B --> C[Choose Game Mode]
    C --> D[Choose Categories]
    D --> E[Choose Difficulty and Card Count]
    E --> F[Initialize Game]
    F --> G[Card Board]
    G --> H[Player selects a card]
    H --> I{Card type}
    I -->|Truth| J[Show Truth question]
    I -->|Dare| K[Show Dare challenge]
    J --> L[Answer / Skip]
    K --> M[Complete / Skip]
    L --> N[Record result]
    M --> N
    N --> O{Cards remaining?}
    O -->|Yes| P[Switch player]
    P --> G
    O -->|No| Q[Game Summary]
```

### 4.2 Screens

  -----------------------------------------------------------------------
  Screen                              Main responsibilities
  ----------------------------------- -----------------------------------
  Home                                Game logo, Start Game, Settings,
                                      How to Play

  Player Setup                        Enter two player names and select
                                      avatars

  Game Configuration                  Choose Truth/Dare/Both, categories,
                                      difficulty, card count

  Card Board                          Display face-down cards and current
                                      player

  Card Detail                         Reveal question/challenge and show
                                      Done/Skip actions

  Game Summary                        Completed cards, skipped cards,
                                      session history, Play Again
  -----------------------------------------------------------------------

### 4.3 Game modes

-   **Truth:** draw only Truth cards.
-   **Dare:** draw only Dare cards.
-   **Mixed:** draw from both Truth and Dare.

### 4.4 Turn rules

-   Two players alternate turns.
-   The first player can be selected or randomized.
-   Each card is used at most once per session.
-   A card is removed from the available deck after selection.
-   Done and Skip both advance the turn.
-   The session ends when no cards remain or the configured card count
    is reached.
-   The game should define whether skipped cards are excluded
    permanently or returned to the deck. Recommended MVP behavior:
    skipped cards are not repeated in the same session.

### 4.5 Safety and player comfort

-   Make participation voluntary.
-   Provide a Skip action that does not penalize players.
-   Avoid requiring users to perform unsafe, illegal, humiliating, or
    non-consensual activities.
-   Consider a content rating or intensity label for each category.
-   Allow players to disable categories they do not want to see.

------------------------------------------------------------------------

## 5. JSON Question Data Design

### 5.1 Suggested file structure

``` text
public/
└── data/
    ├── manifest.json
    ├── categories.json
    ├── truth.json
    └── dare.json
```

### 5.2 `categories.json`

``` json
{
  "categories": [
    {
      "id": "romantic",
      "name": "Romantic",
      "description": "Questions and challenges about love",
      "icon": "heart"
    },
    {
      "id": "funny",
      "name": "Funny",
      "description": "Funny questions and challenges",
      "icon": "smile"
    },
    {
      "id": "deep",
      "name": "Deep Talk",
      "description": "Get to know each other better",
      "icon": "messages"
    }
  ]
}
```

### 5.3 `truth.json`

``` json
{
  "version": 1,
  "cards": [
    {
      "id": "truth_001",
      "category": "romantic",
      "difficulty": "easy",
      "content": "What was your first impression of me?",
      "target": "partner",
      "enabled": true
    },
    {
      "id": "truth_002",
      "category": "deep",
      "difficulty": "medium",
      "content": "What is something you have never told me?",
      "target": "current_player",
      "enabled": true
    }
  ]
}
```

### 5.4 `dare.json`

``` json
{
  "version": 1,
  "cards": [
    {
      "id": "dare_001",
      "category": "romantic",
      "difficulty": "easy",
      "content": "Give your partner a hug for 30 seconds.",
      "target": "both",
      "enabled": true
    },
    {
      "id": "dare_002",
      "category": "funny",
      "difficulty": "medium",
      "content": "Imitate your partner for one minute.",
      "target": "current_player",
      "enabled": true
    }
  ]
}
```

### 5.5 Field definitions

  Field          Type      Description
  -------------- --------- -------------------------------------
  `id`           string    Unique, stable card identifier
  `category`     string    Must match a category ID
  `difficulty`   enum      `easy`, `medium`, `hard`
  `content`      string    Question or challenge text
  `target`       enum      `current_player`, `partner`, `both`
  `enabled`      boolean   Whether the card can be selected

Recommended future fields:

-   `locale`: language code, such as `en` or `vi`.
-   `tags`: additional filtering labels.
-   `estimatedDuration`: expected duration in seconds.
-   `contentRating`: content intensity/rating.
-   `createdAt` and `updatedAt`: content maintenance metadata.

### 5.6 `manifest.json`

``` json
{
  "appVersion": "1.0.0",
  "dataVersion": "1.0.0",
  "lastUpdated": "2026-11-11",
  "files": {
    "categories": "/data/categories.json",
    "truth": "/data/truth.json",
    "dare": "/data/dare.json"
  }
}
```

The manifest is the entry point for data updates. It allows the web app
to check whether the question dataset has changed without tying data
updates to an APK release.

### 5.7 Data loading and validation flow

``` mermaid
flowchart TD
    A[Open Game] --> B[Fetch manifest]
    B --> C{Manifest version changed?}
    C -->|No| D[Use valid cached data]
    C -->|Yes| E[Fetch required JSON files]
    E --> F[Validate schema and references]
    F --> G{All required data valid?}
    G -->|Yes| H[Save new data cache]
    G -->|No| I[Keep last known-good data]
    D --> J[Initialize game]
    H --> J
    I --> J
```

Implementation requirements:

-   Validate JSON with Zod or an equivalent schema validator.
-   Reject duplicate card IDs.
-   Ensure every card category exists.
-   Ignore cards with `enabled: false`.
-   Keep the last known-good dataset if a new deployment is invalid.
-   Handle network errors and missing files.
-   Use stable IDs so history remains meaningful after content updates.

------------------------------------------------------------------------

## 6. Frontend Source Structure

Suggested project structure:

``` text
src/
├── components/
│   ├── Card/
│   ├── GameBoard/
│   ├── Player/
│   ├── Modal/
│   └── Button/
│
├── pages/
│   ├── Home/
│   ├── Setup/
│   ├── Game/
│   └── Summary/
│
├── features/
│   ├── game/
│   │   ├── gameStore.ts
│   │   ├── gameEngine.ts
│   │   └── gameRules.ts
│   │
│   └── questions/
│       ├── questionService.ts
│       ├── questionTypes.ts
│       └── questionValidator.ts
│
├── hooks/
│   ├── useGame.ts
│   └── useQuestions.ts
│
├── services/
│   ├── dataService.ts
│   └── storageService.ts
│
├── types/
│   └── index.ts
│
├── App.tsx
└── main.tsx
```

### Module responsibilities

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  `gameEngine.ts`                     Shuffle, draw cards, track used
                                      cards, switch turns

  `gameRules.ts`                      Validate game actions and session
                                      rules

  `gameStore.ts`                      Hold active game state

  `questionService.ts`                Load, filter, and return question
                                      cards

  `questionValidator.ts`              Validate remote JSON

  `dataService.ts`                    Fetch manifest and manage data
                                      versions

  `storageService.ts`                 Persist settings and local history

  `useQuestions.ts`                   Connect question fetching to UI

  `useGame.ts`                        Expose game state/actions to
                                      components
  -----------------------------------------------------------------------

Keep gameplay rules out of presentation components. UI components should
render state and dispatch actions rather than independently implementing
game rules.

------------------------------------------------------------------------

## 7. Android WebView Wrapper

### 7.1 Responsibilities

The native Android app should remain small and focused:

1.  Initialize WebView.
2.  Load the production HTTPS game URL.
3.  Enable JavaScript and DOM storage as required.
4.  Handle the Android Back button.
5.  Display loading and network-error states.
6.  Support fullscreen or immersive mode if desired.
7.  Preserve sensible WebView lifecycle behavior.
8.  Restrict navigation to trusted domains.

### 7.2 Minimal Kotlin example

``` kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val webView = WebView(this)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
        }

        webView.webViewClient = WebViewClient()

        setContentView(webView)

        webView.loadUrl("https://your-game-domain.com")
    }
}
```

This is a minimal illustration, not production-ready code. Production
implementation must include secure navigation restrictions, HTTPS-only
loading, lifecycle handling, error UI, and appropriate WebView
configuration. Avoid exposing a JavaScript bridge unless there is a
concrete native feature that requires it.

### 7.3 When is an APK rebuild required?

  Change                                       Rebuild APK?
  -------------------------------------------- --------------
  Change web UI                                No
  Add or edit question JSON                    No
  Add a category in hosted JSON                No
  Change game rules in web code                No
  Add web animations                           No
  Change hosted website content                No
  Change the native Android code               Yes
  Change the embedded website URL              Usually yes
  Add native permissions or SDK integrations   Usually yes

------------------------------------------------------------------------

## 8. Web Deployment and Update Strategy

### 8.1 Web code update flow

``` mermaid
flowchart TD
    A[Developer changes source code] --> B[Build web application]
    B --> C[Deploy assets to hosting]
    C --> D[New web version available]
    D --> E[User opens existing APK]
    E --> F[WebView loads hosted website]
    F --> G[Latest compatible assets load]
    G --> H[Updated game is displayed]
```

### 8.2 Cache strategy

A robust deployment should use different cache rules for different
resource types:

  Resource               Suggested cache behavior
  ---------------------- -----------------------------------------------
  `index.html`           Revalidate frequently or use `no-cache`
  Hashed JS/CSS assets   Long-lived immutable cache
  `manifest.json`        Revalidate frequently
  Question JSON          Revalidate or use a short cache lifetime
  Images/audio           Long-lived cache when filenames are versioned

Use content-hashed asset filenames generated by Vite. Ensure the HTML
entry point is not cached indefinitely, otherwise the WebView may
continue loading old asset references.

If a service worker/PWA is introduced:

-   Version its caches.
-   Remove obsolete caches safely.
-   Avoid activating a new service worker in the middle of a game
    session without a clear update policy.
-   Notify users when a new application version is ready.
-   Provide a safe reload action.

### 8.3 Update behavior

Recommended behavior:

1.  On app launch, load the hosted web entry point.
2.  Check the latest data manifest.
3.  Fetch changed question files.
4.  Validate the files.
5.  Store the new data only after successful validation.
6.  Keep the previous valid data if an update fails.
7.  If a new web build is detected while a game is active, avoid
    interrupting the session; apply it on the next safe reload.

Note that WebView does not guarantee that every resource will always be
fetched from the network. HTTP caching and service-worker behavior must
be configured and tested.

------------------------------------------------------------------------

## 9. Development Roadmap

### Phase 1 -- Project Foundation

-   [ ] Initialize React + TypeScript + Vite.
-   [ ] Configure Tailwind CSS.
-   [ ] Set up linting and formatting.
-   [ ] Create the source folder structure.
-   [ ] Define TypeScript types.
-   [ ] Define JSON schemas.
-   [ ] Create sample categories, Truth, and Dare datasets.
-   [ ] Implement data loading and validation.
-   [ ] Implement manifest/version checking.

**Deliverable:** A web application that can load and validate question
data from JSON.

### Phase 2 -- Core Gameplay

-   [ ] Build Home Screen.
-   [ ] Build Player Setup.
-   [ ] Build Game Configuration.
-   [ ] Build Card Board.
-   [ ] Build Card Detail.
-   [ ] Build Game Summary.
-   [ ] Implement Truth/Dare/Both modes.
-   [ ] Implement category and difficulty filters.
-   [ ] Implement card shuffle and no-repeat behavior.
-   [ ] Implement turn management.
-   [ ] Implement Done and Skip actions.

**Deliverable:** A complete playable game in a mobile browser.

### Phase 3 -- User Experience

-   [ ] Implement card flip animation.
-   [ ] Add screen transitions.
-   [ ] Add loading and empty states.
-   [ ] Add network-error handling.
-   [ ] Add local settings.
-   [ ] Add local game history.
-   [ ] Add responsive layouts for common mobile screens.
-   [ ] Test touch interactions and accessibility.
-   [ ] Add optional sound effects and music.

**Deliverable:** A polished mobile-first web game.

### Phase 4 -- Android Integration

-   [ ] Create Android Kotlin project.
-   [ ] Add and configure WebView.
-   [ ] Load the production HTTPS URL.
-   [ ] Configure safe navigation.
-   [ ] Implement Back button behavior.
-   [ ] Add loading and offline states.
-   [ ] Configure app icon and splash screen.
-   [ ] Test on physical Android devices.
-   [ ] Build the first APK.

**Deliverable:** An installable Android APK that loads the hosted game.

### Phase 5 -- Deployment and Release

-   [ ] Choose static hosting/CDN.
-   [ ] Configure HTTPS and domain.
-   [ ] Deploy the web application.
-   [ ] Deploy JSON datasets.
-   [ ] Configure cache headers.
-   [ ] Test web asset updates through an existing APK.
-   [ ] Test question-data updates through an existing APK.
-   [ ] Test failed update and rollback behavior.
-   [ ] Verify offline and poor-network behavior.
-   [ ] Release the APK.

**Deliverable:** A production deployment where web and question-data
updates do not require rebuilding the APK.

------------------------------------------------------------------------

## 10. MVP Feature Checklist

  Feature                          MVP
  -------------------------------- -------
  Two local players                Yes
  Truth mode                       Yes
  Dare mode                        Yes
  Mixed mode                       Yes
  Category selection               Yes
  Difficulty selection             Yes
  Random card selection            Yes
  No repeated cards in a session   Yes
  Turn management                  Yes
  Card flip animation              Yes
  Done/Skip actions                Yes
  Game summary                     Yes
  Local history                    Yes
  Settings                         Yes
  Account login                    No
  Online multiplayer               No
  Backend/database                 No
  Admin dashboard                  Later

------------------------------------------------------------------------

## 11. Testing Plan

### Gameplay tests

-   [ ] Players alternate correctly.
-   [ ] The configured card count is respected.
-   [ ] No card repeats within a session.
-   [ ] Truth mode never draws Dare cards.
-   [ ] Dare mode never draws Truth cards.
-   [ ] Mixed mode can draw both types.
-   [ ] Category and difficulty filters work.
-   [ ] Disabled cards are never selected.
-   [ ] Done and Skip advance the turn correctly.
-   [ ] Session summary matches the session results.

### Data tests

-   [ ] Valid JSON loads successfully.
-   [ ] Invalid JSON is rejected.
-   [ ] Duplicate IDs are detected.
-   [ ] Unknown category references are detected.
-   [ ] Failed updates do not overwrite valid cached data.
-   [ ] New manifest versions trigger data refresh.
-   [ ] Unchanged versions do not cause unnecessary downloads.

### WebView tests

-   [ ] APK opens the hosted game.
-   [ ] JavaScript and DOM storage work as expected.
-   [ ] Android Back button behaves correctly.
-   [ ] App handles loss of internet connection.
-   [ ] Existing APK displays a newly deployed web build.
-   [ ] Existing APK receives updated JSON data.
-   [ ] Cache does not prevent intended updates.
-   [ ] App behaves correctly after being backgrounded and reopened.

------------------------------------------------------------------------

## 12. Future Version 2 Ideas

Potential enhancements after the MVP is stable:

-   Custom player profiles and avatars.
-   More card packs and themes.
-   Achievements and milestones.
-   More detailed game statistics.
-   Additional languages.
-   A content-management dashboard for editing question sets.
-   Optional cloud synchronization.
-   Online multiplayer.
-   Backend API if user accounts or shared content become necessary.

------------------------------------------------------------------------

## 13. Recommended Implementation Order

The recommended order is:

1.  Build the React web application first.
2.  Define and validate the JSON data model.
3.  Implement the data version manager.
4.  Implement the game engine independently from the UI.
5.  Build the six main screens.
6.  Integrate Zustand and TanStack Query.
7.  Complete mobile UX and animations.
8.  Deploy and test the web application in a mobile browser.
9.  Create the Android WebView wrapper.
10. Build the APK once and verify that future web deployments update
    through the existing APK.

**Key recommendation:** Treat the website as the actual game and the APK
as a lightweight container. This keeps the project easy to maintain and
allows most future changes to ship without another Android build.
