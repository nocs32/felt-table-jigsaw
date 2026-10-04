interface PreventableEvent {
  preventDefault: () => void;
}

type EventHandler = (event: PreventableEvent) => void;

// For form submits handled by a store action: `onSubmit={withoutDefault(feed.send)}`.
export const withoutDefault =
  (action: () => void): EventHandler =>
  (event) => {
    event.preventDefault();
    action();
  };
