---
paths:
  - "modules/web/**"
---

# Web rules (`modules/web`)

React + TypeScript + Panda CSS + MobX + Ark UI. These rules come on top of the lint rules in `eslint.config.mjs`.

## 0. File and folder names are kebab-case
- Every file and folder: `top-bar/theme-icon.tsx`, `feed/use-scroll.ts`, `styled-components.ts`. Never camelCase or PascalCase.
- **File and folder names are short and don't repeat the parent.** The folder already says where you are: `room/sidebar/people-item.tsx`, not `room/room-sidebar/room-sidebar-people-item.tsx`.
- The names *inside* the files keep their full conventions: `RoomSidebarPeopleItem`, `RoomFeedStore`, `useRoomPanelFeedScroll`.
- The lint rule `local/kebab-case-filenames` enforces this.

## 1. Components are named after their parent
A child component's name starts with its parent's full name:
`Sidebar` → `SidebarPeople` → `SidebarPeopleItem` → `SidebarPeopleItemAvatar`.
- The parent is the component that renders it.
- A component used by several parents is shared. It goes in `src/ui/` (or the nearest common folder) and is named for what it is: `Avatar`, `ReactionPill`.
- The **component** name carries the full parent chain; the **file** name is just its own part: `RoomSidebarPeopleItem` lives in `room/sidebar/people-item.tsx` (rule 0).
- **Why:** exported names share one global namespace, and the parent chain keeps them unique (`RoomSidebarPeople` vs `RoomTopBarPeople`). Anything local to a file that isn't exported can be named freely.
- **A component gets its own folder only when it has more than 3 related files** (children, styles, hooks).
  - Otherwise it's a single file in its parent's folder, e.g. `src/app.tsx` or `room/header.tsx`, and its styles go in that folder's `styled-components.ts`.
  - Lint: `local/folder-index` flags component folders with 3 files or fewer.
- **Every folder has an `index.ts`/`index.tsx` entry.**
  - A component with its own folder lives in that folder's `index.tsx`: `room/top-bar/index.tsx`, never `top-bar/top-bar.tsx`.
  - Folders that only group things (`features/`, `ui/`, `assets/`) get an `index.ts` that re-exports them.
  - The app entry is `src/index.tsx`.

## 1a. Icons are `.svg` files, not components
- Icons live in `src/assets/icons/*.svg`. They're Lucide icons (ISC licence, see `lucide-license.txt`) written as plain SVG with `width/height="1em"` and `stroke="currentColor"`.
- `src/assets/icons/index.ts` imports each one through `vite-plugin-svgr`: `export { default as MenuIcon } from './menu.svg?react';`.
- Components import them from `assets`: `import { MenuIcon } from '../../assets';`.
- Never write an icon as a `.tsx` component.
- Size and colour come from the parent in `styled-components.ts` (`'& svg': { width: '18px', height: '18px' }`), not from props.
- To add an icon, drop the `.svg` into `assets/icons/` and export it from `index.ts`.
- The app root (`App`) and the page component under it (`Room`) start the naming tree.

## 1b. Components are named functions, never arrows
```tsx
export const Room = observer(function Room(): ReactElement {
  const { layout } = useRootStore().ui;

  return <RoomRoot>…</RoomRoot>;
});

export function Avatar({ initial, color }: AvatarProps): ReactElement {
  return <AvatarRoot tone={color}>{initial}</AvatarRoot>;
}
```
- Observer components: `observer(function Name(…) {…})`, where the function name matches the exported name.
- Plain components: `export function Name(…) {…}`.
- Arrow-function components are not allowed (lint: `local/pascal-case-components`). Lambdas inside JSX, such as `.map((item) => …)` and handlers, are fine.

## 2. One component per `.tsx` file
- Exactly one React component per `.tsx` file.
- No helper components "just for this file". Give each one its own file, named after its parent (rule 1).
- `.tsx` files hold nothing else: no shared constants, types or utilities. A component's own props interface is fine.
- The only exception is the entry `src/main.tsx`, which creates the root store and mounts the app.

## 3. Components only render; MobX holds the logic
A `.tsx` component turns store data into JSX. Nothing else.

**Allowed in a component**
- Reading MobX stores directly: `const { layout } = useRootStore().ui;`. The component is wrapped in `observer`.
- Conditional rendering (`{layout.isDrawerOpen && …}`, ternaries) and mapping lists to elements.
- Store actions as handlers: `onClick={layout.togglePanel}`.
- Wrapping a handler only to pass an argument: `onClick={() => room.choosePreset(option.preset)}`, `onChange={(event) => feed.setDraft(event.target.value)}`.

**Not allowed in a component**
- React's built-in hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, …).
- Calculations, formatting, filtering, sorting, fetching, timers or event logic.

**Where logic goes**

| Kind of logic | Put it in |
|---|---|
| State, the rules that change it, derived values (labels, flags, counts) | A MobX store: getters and actions |
| Side effects: clipboard, timers, storage, network | A service injected into the store's constructor |
| App-wide listeners that aren't tied to a component (OS theme, keyboard shortcuts) | A service started once in `main.tsx` |
| What MobX can't do well: refs, DOM measurement, scroll and focus, effects tied to mount/unmount | A custom hook next to the component (`use-surface.ts` → `useRoomTableSurface`), but **only then** |

## 4. MobX stores are small state machines
- **Many small stores, never one big one.** Each store owns one concern.
- **Folders for bigger stores.** A store with sub-stores is a folder:
  - `index.ts` holds the main store;
  - each sub-store is a short-named file next to it: `room/index.ts` (`RoomStore`), `room/feed.ts` (`RoomFeedStore`), `room/presence.ts`, `room/types.ts`;
  - a sub-store that grows its own sub-stores becomes a folder in the same way: `room/puzzle/index.ts`, `room/puzzle/drag.ts`.
- **Class names follow the parent:** `RoomStore` → `RoomFeedStore` → `RoomPuzzleDragStore`.
- **Each store is a class modelled as a state machine:**
  - one `state` field with a fixed set of states, e.g. `'idle' | 'loading' | 'ready' | 'error'`, plus the data that belongs to them;
  - transitions are actions named after events: `open()`, `grab(groupId)`, `receiveSnapshot(state)`. A transition that isn't valid in the current state is ignored;
  - derived values are `get` computeds, including UI labels and flags (`isPanelOpen`, `shareLabel`). Never store a copy of something that can be derived.
- **Setup:** call `makeAutoObservable(this, {}, { autoBind: true })` in the constructor. MobX runs with `enforceActions: 'always'`, so async callbacks call an action.
- **Stores never import React or touch the DOM.** Side effects go through services passed into the constructor, so stores stay testable.
- **The root store** is created in `main.tsx` and provided through `StoreContext`. Components reach stores with `useRootStore()`.
- **Per-frame data skips React renders.** Piece positions, cursors and flying emoji are read directly from the stores by the canvas or overlay renderer.

## 5. No styles in `.tsx`
- **All styling is Panda CSS in `styled-components.ts` files.** `.tsx` files only use those components.
- **Write styles with Panda's `styled` and an inline config:**
  ```ts
  export const SidebarRoot = styled('div', { base: { display: 'flex' }, variants: { … } });
  ```
  Don't use `css()`, `cva()` or separate recipe helpers.
- **Ark UI first.**
  - If a plain Ark UI component fits as-is, use it directly.
  - If it needs any styling at all, wrap the part in `styled-components.ts` with only the overrides:
    ```ts
    export const PickerDialogContent = styled(Dialog.Content, { base: { … } });
    ```
- **Not allowed in a `.tsx` file:** `css()`, `cx()`, styling class names, `style={{…}}` or Panda style props. `jsxStyleProps: 'none'` enforces the last one.
- **Which `styled-components.ts`:**
  - a component with its own folder (more than 3 related files) has its own `styled-components.ts`;
  - every other component shares the `styled-components.ts` of the folder it sits in.
- **Styled component names** are the user's name plus the part's role: `SidebarPeopleItemRoot`, `SidebarPeopleItemName`.
- **Values that change at runtime:**
  - A fixed set of variations (player colour, active, size) becomes variants.
  - Values that change continuously (positions, custom colours) are set through a ref as a CSS variable, e.g. `el.style.setProperty('--x', …)`, inside a custom hook. Never inline them in JSX.
- **Colours, spacing, radii and fonts** come from Panda tokens and semantic tokens. No raw hex values outside the Panda config (`panda.config.ts` and `panda/`).
- **Dialogs, menus, popovers, sliders, tabs and tooltips** use Ark UI, as described above.

## 6. All UI text is translated (English + Ukrainian)
- **Never hard-code UI text.** Add a key to `src/i18n/en.ts` and the same key to `src/i18n/uk.ts`; typecheck fails if Ukrainian misses one.
- **Components** read `const { locale } = useRootStore();` and render `locale.t('chat.send')`. They're observers, so they re-render when the language changes.
- **Stores** get `t` (or the `Localizer`: `t` + `formatTime`) injected and use it inside getters: `get shareLabel() { return this.#t('share.share'); }`.
- **Plurals** use i18next suffixes: `_one`/`_other` in English, `_one`/`_few`/`_many`/`_other` in Ukrainian, and the caller passes `count`.
- **Shared text that others see** (chat system lines) is stored as data (`{ type: 'renamed', name }`) and translated when shown, so each person reads it in their own language.
- **Ukrainian system lines use the present tense** ("змінює стіл") so they don't depend on the person's gender.
- Brand names (Felt Table, Unsplash) and user content (names, messages) aren't translated.

## Folder example
```
src/
├─ index.tsx                       ← entry: creates the root store, starts services, mounts <App>
├─ app.tsx                         ← App (one file, so no folder)
├─ assets/icons/*.svg + index.ts
└─ features/room/
   ├─ index.tsx                    ← Room
   ├─ header.tsx                   ← RoomHeader. Small: one file, styles in room/styled-components.ts
   ├─ styled-components.ts
   └─ sidebar/                     ← more than 3 related files: own folder
      ├─ index.tsx                 ← RoomSidebar
      ├─ people.tsx                ← RoomSidebarPeople
      ├─ people-item.tsx           ← RoomSidebarPeopleItem
      └─ styled-components.ts
src/stores/
├─ index.ts                        ← RootStore
├─ use-root-store.ts
└─ room/
   ├─ index.ts                     ← RoomStore
   ├─ feed.ts                      ← RoomFeedStore
   ├─ presence.ts                  ← RoomPresenceStore
   └─ puzzle/
      ├─ index.ts                  ← RoomPuzzleStore
      └─ drag.ts                   ← RoomPuzzleDragStore
```
