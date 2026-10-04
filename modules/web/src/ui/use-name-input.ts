import { useEffect, useRef, type RefObject } from 'react';
import type { NameFieldStore } from '../stores/name-field';

// Enter saves and Escape cancels; both then leave the field. Leaving saves (onBlur → commit),
// so after a cancel there's simply nothing left to save.
export const useNameInputKeys = (field: NameFieldStore): RefObject<HTMLInputElement | null> => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = ref.current;

    if (!input) return undefined;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        field.cancel();
        input.blur();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        input.blur();
      }
    };

    input.addEventListener('keydown', onKeyDown);

    return () => input.removeEventListener('keydown', onKeyDown);
  }, [field]);

  return ref;
};
