# Felt Table

A multiplayer jigsaw:
- share a room by URL and solve it together in real time (live cursors, emoji reactions, chat);
- the room is thrown away about 10 minutes after everyone leaves.

The full spec is in `.scratch/SPEC.md`. Read §0 "Decisions so far" before planning any feature.

## Layout
- `modules/web` — frontend: Vite + React 19 + TypeScript. Panda CSS, MobX and Ark UI are added as features need them.
- `modules/core-api` — backend: Node + Express 5 + Colyseus 0.18 (live tables), one process on :2567.
- `modules/protocol` — the shared contract: message schemas, error codes, name rules; the Colyseus state classes under `@felt-table/protocol/state`.
- `modules/engine` — pure puzzle maths (cutting, scatter, snap), shared by both apps.
- `eslint.config.mjs` + `eslint-rules/` — the house lint rules for every module.
- `.scratch/` — spec and notes, ignored by git. `.scratch/prototype.html` is the old single-file demo: the reference for porting the cutting and snapping code.

## Rules: read them before writing code
- **Before** creating or editing anything in `modules/web/**`, read `.claude/rules/web.md` and follow it.
- **Before** creating or editing anything in `modules/core-api/**`, read `.claude/rules/core-api.md` and follow it.
- These rules load automatically only once a matching file is opened. Read them first anyway, especially when creating new files.
- **Before calling a change done,** run `pnpm lint` and `pnpm typecheck` and fix what they report. Don't disable rules or add `eslint-disable` comments without asking.

**House lint rules** (enforced everywhere):
- **Size:** at most 40 lines per function (components included) and 300 lines per file. Blank lines and comments don't count.
- **Nested functions:** inside a function, only arrow functions. No nested `function` declarations or expressions, and no object or class methods.
- **Names:** camelCase for everything. PascalCase only for React components (which must render JSX) and for types and classes.
- **Return types:** required on every function that returns a value. Lambdas passed as arguments or JSX props are exempt.
- **Blank lines:** exactly one before and after every code block (functions, if, loops, switch, try, multi-line statements). `pnpm lint --fix` adds them.

## Commands
```bash
pnpm install
pnpm dev           # web on http://localhost:5173 + core-api on :2567 (Vite forwards /api, and /live for tables)
pnpm lint          # add --fix to auto-fix spacing
pnpm typecheck
pnpm test          # engine + core-api; one module: pnpm --filter @felt-table/core-api test
pnpm build         # production web build (CI runs lint, typecheck, test, build on every PR and push to main)
pnpm play          # build + serve at https://jigsaw.timnox.dev from this PC through a Cloudflare Tunnel
```

## Gotchas
- **TypeScript is pinned to 6.0.** typescript-eslint doesn't support TypeScript 7 yet. Don't upgrade it.
- **pnpm workspaces:** the packages are listed in `pnpm-workspace.yaml`. Add a dependency with `pnpm --filter @felt-table/<module> add <pkg>`.
- **pnpm's release-age guard:** pnpm refuses versions published in the last day. Pick the previous version instead of adding exceptions.
- **Testing multiplayer:** `/` creates a table and redirects to `/r/:id`; open that link in a second tab to be a second person. Each tab keeps its seat across reloads (sessionStorage).
- **Tables live in core-api's memory:** restarting it wipes every table, and editing server code while `pnpm dev` runs restarts it (`tsx watch`). Old links then show "This table has been cleared".
- **Hosting is `pnpm play`, not a cloud host** (spec D26: free, no payment card). It runs `vite preview` on `127.0.0.1:4173`, which reuses the dev `/api` + `/live` proxy, plus core-api and the `felt-table` Cloudflare Tunnel (credentials in `~/.cloudflared/`). Stop `pnpm dev` first, since both need port 2567. `play-tunnel.mjs` finds `cloudflared` on PATH or in its Windows install folder, because shells (and apps) started before the install don't have it on PATH.
- **Dev handle:** in development the root store is `window.feltTable` (e.g. `feltTable.room.puzzle.groups`), for checking state from the console or a test script.
