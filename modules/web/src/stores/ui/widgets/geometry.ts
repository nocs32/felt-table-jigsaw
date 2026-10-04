import type { WidgetArea, WidgetFrame, WidgetSpec } from './types';

// Gap kept between a widget and the table's edges.
export const widgetInset = 12;

// On narrow tables the centred toolbar spans most of the bottom edge, so widgets stop above it
// (toolbar 46px + its 16px offset + a gap). Wide tables leave the bottom corners free.
const toolbarReserve = 72;
const narrowAreaWidth = 900;

interface Size {
  width: number;
  height: number;
}

const bottomInset = (area: WidgetArea): number => (area.width < narrowAreaWidth ? toolbarReserve : widgetInset);

// Like a normal clamp, but when the range is empty (a tiny table) the minimum wins.
const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), Math.max(min, max));

// The biggest a widget may be anywhere on this table.
const roomIn = (area: WidgetArea): Size => ({
  width: area.width - 2 * widgetInset,
  height: area.height - widgetInset - bottomInset(area),
});

const fitSize = (size: Size, room: Size, spec: WidgetSpec): Size => {
  const aspect = spec.aspect();

  if (aspect === null) {
    return { width: clamp(size.width, spec.minWidth, room.width), height: clamp(size.height, spec.minHeight, room.height) };
  }

  const width = clamp(size.width, spec.minWidth, Math.min(room.width, room.height * aspect));

  return { width, height: width / aspect };
};

// Shrinks the frame to fit the table and moves it back inside.
export const fitFrame = (frame: WidgetFrame, area: WidgetArea, spec: WidgetSpec): WidgetFrame => {
  const size = fitSize(frame, roomIn(area), spec);

  return {
    ...size,
    x: clamp(frame.x, widgetInset, area.width - size.width - widgetInset),
    y: clamp(frame.y, widgetInset, area.height - size.height - bottomInset(area)),
  };
};

// Where a widget sits until someone moves it: its default size, tucked into its corner.
export const cornerFrame = (area: WidgetArea, spec: WidgetSpec): WidgetFrame => {
  const size = fitSize(spec, roomIn(area), spec);
  const y = spec.corner === 'bottomLeft' ? area.height - size.height - bottomInset(area) : widgetInset;

  return fitFrame({ ...size, x: widgetInset, y }, area, spec);
};

// Resizing from the bottom-right handle: the top-left corner stays where it is.
export const resizeFrame = (start: WidgetFrame, dx: number, dy: number, area: WidgetArea, spec: WidgetSpec): WidgetFrame => {
  const aspect = spec.aspect();
  const width = aspect === null ? start.width + dx : start.width + (dx + dy * aspect) / 2;
  const height = aspect === null ? start.height + dy : width / aspect;
  const room = { width: area.width - widgetInset - start.x, height: area.height - bottomInset(area) - start.y };

  return { ...fitSize({ width, height }, room, spec), x: start.x, y: start.y };
};
