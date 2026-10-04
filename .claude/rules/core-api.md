---
paths:
  - "modules/core-api/**"
---

# Core API rules (`modules/core-api`)

Node + Express 5 for HTTP, and Colyseus for the live multiplayer rooms (decided, not installed yet). These rules come on top of the lint rules in `eslint.config.mjs` and follow the same ideas as the web rules: thin edges, small named units, and logic in small state machines.

**Colyseus specifics, once it's added:**
- Room classes extend Colyseus `Room`.
- Shared state is Colyseus Schema classes from the shared protocol module.
- `onMessage` handlers follow rule 3: validate, call one method, done.
- Schema decorators need `experimentalDecorators: true` and `useDefineForClassFields: false` in core-api's tsconfig.

## 1. Names follow the owner
A unit that belongs to another starts with its owner's name:
- `TableRoom` → `TableRoomHolds` → `TableRoomHoldsTimer`
- `imagesRouter` → `imagesUploadHandler`
- `UnsplashClient` → `UnsplashClientCache`

Shared building blocks are named for what they are: `ImageStore`, `logger`, `limits`.

## 2. One unit per file
- One class, one router or one handler group per file.
- Files and folders are kebab-case, named after what they hold: `table-room-holds.ts` (`TableRoomHolds`), `images-router.ts` (`imagesRouter`). The lint rule `local/kebab-case-filenames` enforces it.
- A unit with sub-units becomes a folder: `index.ts` holds the main unit, and each sub-unit gets a short-named file next to it (`table-room/index.ts`, `table-room/holds.ts`).

## 3. Edges are thin
This is the backend version of "components only render". Express route handlers and live message handlers do exactly three things:
1. Validate the input with the shared schema.
2. Call **one** method on a service or room class.
3. Send the result, or a typed error.

No game rules, storage or calculations inside handlers.

## 4. Logic lives in small state-machine classes
- **Composed rooms.** A room is built from small classes, each owning one concern: holds, snapping, feed/chat, lifecycle (the 10-minute empty timer), rate limits. `TableRoom` only wires them together.
- **Explicit states.** Each class has a fixed set of states:
  - room lifecycle: `'active' | 'emptyGrace' | 'closed'`;
  - a hold: `'free' | 'held'`.
- **Transitions** are methods named after events: `join`, `leave`, `grab`, `drop`, `expire`. An invalid transition is rejected with a typed error code.
- **Pure maths** (cutting, scatter, snap) lives in the shared engine module and has no I/O.
- **Tests.** Each state-machine class has unit tests for its transitions, including the rejected ones.

## 5. The server decides; clients only ask
- **Intents, not results.** Clients send intents such as `grab` or `drop`, and the server works out the result. Never accept a finished result from a client, like "this snapped".
- **Validate everything.** Check every message and request body against its schema:
  - reject unknown fields;
  - clamp numbers to sane ranges;
  - check the sender is allowed (only the holder can move a group).
- **Limits in one place.** Rate limits and size caps are constants in a single `limits.ts`.

## 6. Every piece of memory has an owner
- **No database.** Rooms and images live in memory (spec §7.4).
- **Cleanup.** Every `Map`, timer and interval belongs to a class that clears it in `dispose()`.
- **No module-level mutable state**, except the composition root (`src/index.ts`), which creates the long-lived instances.

## 7. Config, errors and logs
- **Config:** environment variables are read and validated once in `src/config.ts`. Nothing else reads `process.env`.
- **Errors:** use typed error codes shared with the web app, like `'ROOM_NOT_FOUND'` or `'GROUP_HELD'`. Never use raw strings.
- **Logs:** log through `src/logger.ts` with context such as `roomId` and `sessionId`. No `console.log` anywhere else.

## 8. One shared contract
- Message types, schemas and error codes live in the shared module that both apps import (planned). Never redefine them in core-api.

## Folder example
```
src/
├─ index.ts                 composition root: config, logger, stores, Express, listen
├─ config.ts
├─ logger.ts
├─ limits.ts
├─ health/health-router.ts
├─ images/
│  ├─ images-router.ts
│  ├─ images-upload-handler.ts
│  └─ image-store.ts
└─ table-room/
   ├─ index.ts                TableRoom
   ├─ holds.ts                TableRoomHolds
   ├─ feed.ts                 TableRoomFeed
   └─ lifecycle.ts            TableRoomLifecycle
```
