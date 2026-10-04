# Felt Table

A multiplayer jigsaw puzzle you solve with friends in the browser.

- **Pick a picture:** upload one, choose from Unsplash, or use a built-in sample. Set the difficulty and share the room link.
- **Solve together:** everyone sees each other's cursors live (Figma-style), anyone can move pieces, and snaps show up for everyone at once.
- **Slack vibes:** emoji reactions that shoot up the screen like in a Slack huddle, a chat panel, and a table background anyone can change for everybody.
- **No accounts, no leftovers:** a room disappears about 10 minutes after the last person leaves.

> **Status:** early setup. A skeleton web app and API are running; the puzzle itself is not built yet.

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite. Coming next: Panda CSS, MobX, Ark UI. |
| API (`modules/core-api`) | Node.js, Express 5, TypeScript (run with `tsx`). Coming next: a live multiplayer layer. |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server owns all shared state. It cuts the puzzle, decides who holds which piece and when pieces snap, and streams the results to every player. Rooms and pictures live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24+ and pnpm 11+.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

| App | URL |
|---|---|
| Web | http://localhost:5173 |
| API | http://localhost:2567 — the web dev server forwards `/api/*` to it |

Open the web URL. If everything is wired up, the page says **"core-api is online"**.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |

## Project layout

```
modules/
├─ web/          React frontend
└─ core-api/     Express backend
eslint.config.mjs   house lint rules
eslint-rules/       custom lint rules used by the config
```

## Conventions

**Code style** (enforced by `pnpm lint`):
- **Size:** at most 40 lines per function (components included) and 300 lines per file.
- **Nested functions:** inside a function, only arrow functions.
- **Names:** camelCase. PascalCase only for React components and for types and classes.
- **Return types:** every function that returns a value declares its return type.
- **Blank lines:** one before and after every code block.

**Web**
- **Component names follow their parent:** `Sidebar` → `SidebarPeople` → `SidebarPeopleItem`.
- **One component per `.tsx` file.** Components only render.
  - Logic lives in custom hooks and small MobX stores, which are modelled as state machines.
  - Styles live in `styled-components.ts` files written with Panda CSS.

**API**
- **Thin handlers:** they validate, call one service, and respond.
- **Logic** lives in small state-machine classes.
- **Validation:** every incoming message is checked.

**TypeScript** stays on **6.0** until typescript-eslint supports TypeScript 7.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `CORE_API_PORT` | core-api | `2567` |
