import { useEffect, useRef, type RefObject } from 'react';

// Keeps the feed scrolled to the newest message whenever one arrives.
export const useRoomTableChatFeedScroll = (itemCount: number): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [itemCount]);

  return ref;
};
