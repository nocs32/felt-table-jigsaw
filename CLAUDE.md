# Felt Table

A multiplayer jigsaw:
- share a room by URL and solve it together in real time (live cursors, emoji reactions, chat);
- the room is thrown away about 10 minutes after everyone leaves.

The full spec is in `.scratch/SPEC.md`. Read §0 "Decisions so far" before planning any feature.

## Layout
- `modules/web` — frontend: Vite + React 19 + TypeScript. Panda CSS, MobX and Ark UI are added as features need them.
- `modules/core-api` — backend: Node + Express 5. The live multiplayer layer is planned to be Colyseus, still to be confirmed.
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
pnpm dev           # web on http://localhost:5173 + core-api on :2567 (Vite forwards /api)
pnpm lint          # add --fix to auto-fix spacing
pnpm typecheck
```

## Gotchas
- **TypeScript is pinned to 6.0.** typescript-eslint doesn't support TypeScript 7 yet. Don't upgrade it.
- **pnpm workspaces:** the packages are listed in `pnpm-workspace.yaml`. Add a dependency with `pnpm --filter @felt-table/<module> add <pkg>`.
