# Felt Table

[![CI](https://github.com/nocs32/felt-table-jigsaw/actions/workflows/ci.yml/badge.svg)](https://github.com/nocs32/felt-table-jigsaw/actions/workflows/ci.yml)

A multiplayer jigsaw puzzle you solve with friends in the browser.

- **Pick a picture:** search Unsplash, paste an image link, or use a built-in sample. Set the difficulty (12 to 500 pieces, wild or classic shapes, how tight pieces snap) and share the table link.
- **Solve together:** everyone sees each other's cursors live (Figma-style), anyone can move pieces, and snaps show up for everyone at once.
- **Slack vibes:** emoji reactions that shoot up the screen like in a Slack huddle, a chat panel, and a table background anyone can change for everybody.
- **No accounts, no leftovers:** share the table link to play, in English or Ukrainian. A table disappears about 10 minutes after the last person leaves.

> **Status:** the puzzle plays on live tables run by the server, hosted at https://jigsaw.timnox.dev while `pnpm play` runs: share the link and play. Every pull request and every push to `main` runs CI.

## Stack

| Part | Tech |
|---|---|
| Web (`modules/web`) | React 19, TypeScript, Vite, Panda CSS, MobX, Ark UI, i18next |
| API (`modules/core-api`) | Node.js, Express 5 and Colyseus 0.18 (run with `tsx`): the live tables |
| Shared | `modules/protocol` (the contract between the two) and `modules/engine` (pure puzzle maths: cutting, scatter, snap) |
| Tooling | pnpm workspaces, ESLint 10 + typescript-eslint, TypeScript 6.0 |

The server owns all shared state. It cuts the puzzle, decides who holds which piece and when pieces snap, and streams the results to every player. Tables and pictures live in the server's memory only, so there is no database.

## Getting started

**Requirements:** Node.js 24 (see `.nvmrc`) and pnpm 11+.

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

| App | URL |
|---|---|
| Web | http://localhost:5173 |
| API | http://localhost:2567 — the web dev server forwards `/api/*`, and `/live` for tables, to it |

Open the web URL to get a table, and open its link in another tab (or send it to a friend) to sit a second person down. A reload keeps your seat for 20 seconds.

Saving a file in `modules/core-api` restarts the API, which clears every table: open a new one afterwards.

The Unsplash picker needs an Unsplash access key: copy `modules/core-api/.env.example` to `.env` next to it and fill in `UNSPLASH_ACCESS_KEY`. Without one, the picker is switched off and samples and image links still work.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Runs the web app and the API with hot reload |
| `pnpm lint` | Lints every module; `pnpm lint --fix` fixes spacing automatically |
| `pnpm typecheck` | Type-checks every module |
| `pnpm test` | Runs the engine and core-api tests; one module: `pnpm --filter @felt-table/core-api test` |
| `pnpm build` | Builds the web app for production |
| `pnpm play` | Builds, then serves the game at https://jigsaw.timnox.dev from this computer (see below) |

**CI:** GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on every pull request and every push to `main`.

## Play with friends

There's no cloud server: `pnpm play` runs Felt Table on your own computer, and a free [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) puts it on **https://jigsaw.timnox.dev**. No router ports are opened, and your home address stays hidden behind Cloudflare.

```bash
pnpm play
```

- It builds the web app, then starts core-api, the production web server (`vite preview` on `127.0.0.1:4173`) and the tunnel. Ctrl+C stops all three.
- Stop `pnpm dev` first: both use core-api's port 2567.
- Keep the computer awake while you play. Closing the terminal or restarting wipes the tables, like any server restart.
- To ship a change, stop `pnpm play` and start it again. It rebuilds from what's checked out.

**One-time setup** on the computer that hosts: install `cloudflared` (`winget install Cloudflare.cloudflared`), open a new terminal so it's on PATH, then:

```bash
cloudflared tunnel login
cloudflared tunnel create felt-table
cloudflared tunnel route dns felt-table jigsaw.timnox.dev
```

The tunnel's credentials live in `~/.cloudflared/`, outside the repo. Keep them private.

## Project layout

```
modules/
├─ web/          React frontend
├─ core-api/     Express + Colyseus backend
├─ protocol/     shared contract: messages, events, error codes
└─ engine/       pure puzzle maths, shared by both apps
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
- **All UI text is translated** into English and Ukrainian.

**API**
- **Thin handlers:** they validate, call one service, and respond.
- **Logic** lives in small state-machine classes.
- **The server decides:** browsers send intents (grab, move, drop a piece) and never results. Every incoming message is checked.

**TypeScript** stays on **6.0** until typescript-eslint supports TypeScript 7.

## Environment variables

| Variable | Used by | Default |
|---|---|---|
| `CORE_API_PORT` | core-api | `2567` |
| `UNSPLASH_ACCESS_KEY` | core-api, server-side only | empty: the Unsplash picker is off |
| `UNSPLASH_COLLECTION_ID` | core-api, for the "Featured" list | empty: popular photos from the Wallpapers topic |

core-api reads them from `modules/core-api/.env` (see `.env.example`, never committed) or from real environment variables.
