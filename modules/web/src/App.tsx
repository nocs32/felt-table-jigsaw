import type { ReactElement } from 'react';
import { useApp } from './useApp';

export const App = (): ReactElement => {
  const { statusLabel } = useApp();

  return (
    <main>
      <h1>Felt Table</h1>
      <p>{statusLabel}</p>
    </main>
  );
};
