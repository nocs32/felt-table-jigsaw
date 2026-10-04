import { useEffect, useRef, type RefObject } from 'react';
import type { NewPuzzlePhotosStore } from '../../../../stores/new-puzzle/photos';

// Asks for the next page when the marker after the grid scrolls into view.
export const useRoomNewPuzzlePickerLoadMore = (list: NewPuzzlePhotosStore): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marker = ref.current;

    if (!marker) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) list.loadMore();
      },
      { rootMargin: '200px' },
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [list]);

  return ref;
};
