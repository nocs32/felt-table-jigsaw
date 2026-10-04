import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { UiWidgetsAreaStore } from '../../../stores/ui/widgets/area';

// Measures the table so the floating widgets stay inside it as the window or layout changes.
export const useRoomTableArea = (area: UiWidgetsAreaStore): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) return undefined;

    const measure = (): void => area.measure(element.clientWidth, element.clientHeight);
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(element);

    return () => observer.disconnect();
  }, [area]);

  return ref;
};
