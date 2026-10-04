---
paths:
  - "modules/web/**"
---

# Web rules (`modules/web`)

React + TypeScript + Panda CSS + MobX. These rules come on top of the lint rules in `eslint.config.mjs`.

## 1. Components are named after their parent
A child component's name starts with its parent's full name:
`Sidebar` → `SidebarPeople` → `SidebarPeopleItem` → `SidebarPeopleItemAvatar`.
- The parent is the component that renders it.
- A component used by several parents is shared. It goes in `src/ui/` (or the nearest common folder) and is named for what it is: `Avatar`, `ReactionPill`.
- The file name is the component name: `SidebarPeopleItem.tsx`.

## 2. One component per `.tsx` file
- Exactly one React component per `.tsx` file.
- No helper components "just for this file". Give each one its own file, named after its parent (rule 1).
- `.tsx` files hold nothing else: no shared constants, types or utilities.
- The only exception is the entry `src/main.tsx`, which mounts the app.

## 3. Components only render
A `.tsx` component turns ready-made data into JSX. Nothing else.

**Allowed in a component**
- Calling its custom hook (`useSidebarPeople()`), which hands over store data and handlers.
- Conditional rendering (`{isOpen && …}`, ternaries) and mapping lists to elements.
- Passing handlers from the hook or store (`onClick={people.select}`). Wrapping one is allowed only to pass an argument (`onClick={() => people.select(id)}`).

**Not allowed in a component**
- React's built-in hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, …). Those live inside custom hooks.
- Calculations, formatting, filtering, sorting, fetching, timers or event logic.

**Where logic goes**

| Kind of logic | Put it in |
|---|---|
| State, the rules that change it, derived values | A MobX store (rule 4) |
| React glue: refs, effects, subscriptions, DOM measurements, connecting a store to a component | A custom hook `use<ComponentName>.ts` next to the component |
| Pure helpers with no state | A `*.ts` module |

- The hook returns exactly what the JSX needs, with labels already formatted and flags already worked out.
- Components that read MobX observables are wrapped in `observer` from `mobx-react-lite`.

## 4. MobX stores are small state machines
- **Many small stores, never one big one.** Each store owns one concern.
- **Bigger concerns split into sub-stores**, held as fields of the parent store. Their names follow the parent rule: `RoomStore` → `room.table: RoomTableStore` → `table.drag: RoomTableDragStore`.
- **Each store is a class modelled as a state machine:**
  - one `state` field with a fixed set of states, e.g. `'idle' | 'loading' | 'ready' | 'error'`, plus the data that belongs to them;
  - transitions are actions named after events: `open()`, `grab(groupId)`, `receiveSnapshot(state)`. A transition that isn't valid in the current state is ignored;
  - derived values are `get` computeds. Never store a copy of something that can be derived.
- **Setup:** call `makeAutoObservable(this, {}, { autoBind: true })` in the constructor. MobX runs with `enforceActions: 'always'`.
- **Stores never import React or touch the DOM.** Side effects such as network calls and timers go through services passed into the constructor, so stores stay testable.
- **The root store** builds the tree and is provided through React context. Components reach stores only through their custom hook.
- **Per-frame data skips React renders.** Piece positions, cursors and flying emoji are read directly from the stores by the canvas or overlay renderer, using `reaction` / `autorun` or a read on each animation frame.

## 5. No styles in `.tsx`
- **All styling is Panda CSS in `styled-components.ts` files**, written as `styled()` components (from `styled-system/jsx`) or recipes. `.tsx` files only use those components.
- **Not allowed in a `.tsx` file:** `css()`, `cx()`, styling class names, `style={{…}}` or Panda style props.
- **Which `styled-components.ts`:**
  - a big component gets its own folder, named after it, with its own `styled-components.ts`;
  - small child components sit in their parent's folder and share that folder's `styled-components.ts`.
- **Styled component names** are the user's name plus the part's role: `SidebarPeopleItemRoot`, `SidebarPeopleItemName`.
- **Values that change at runtime:**
  - A fixed set of variations (player colour, active, size) becomes recipe variants.
  - Values that change continuously (positions, sizes) are set by the hook through a ref, e.g. `el.style.setProperty('--x', …)`. Never inline them in JSX.
- **Colours, spacing, radii and fonts** come from Panda tokens and semantic tokens. No raw hex values outside `panda.config.ts`.
- **Dialogs, menus, popovers, sliders and tooltips** use Ark UI, styled in `styled-components.ts`.

## Folder example
```
src/features/sidebar/
├─ Sidebar.tsx
├─ useSidebar.ts
├─ styled-components.ts          ← shared by Sidebar and its small children
├─ SidebarHeader.tsx
└─ SidebarPeople/                ← big child: own folder, own styles
   ├─ SidebarPeople.tsx
   ├─ useSidebarPeople.ts
   ├─ SidebarPeopleItem.tsx
   ├─ useSidebarPeopleItem.ts
   └─ styled-components.ts
src/stores/
├─ RootStore.ts
└─ room/
   ├─ RoomStore.ts
   ├─ RoomPresenceStore.ts
   └─ RoomTableStore.ts
```
