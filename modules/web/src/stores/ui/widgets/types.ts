// Position and size in pixels, relative to the table's top-left corner.
export interface WidgetFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetArea {
  width: number;
  height: number;
}

// Saved per browser: whether the widget is shown and where (null: its default corner).
export interface WidgetPreference {
  isOpen: boolean;
  frame: WidgetFrame | null;
}

export type WidgetCorner = 'topLeft' | 'bottomLeft';

export interface WidgetSpec {
  key: string;
  corner: WidgetCorner;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isOpenByDefault: boolean;
  // Width ÷ height to keep while resizing (a picture keeps its shape); null resizes freely.
  aspect: () => number | null;
}

export type WidgetState = 'hidden' | 'idle' | 'pressed' | 'moving' | 'resizing';

export type WidgetGesture = Exclude<WidgetState, 'hidden'>;
