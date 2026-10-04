import { playerColors, type PlayerColor } from '@felt-table/protocol';

// The player colours as the canvas needs them: real colour values, read once from the CSS
// variables Panda makes for the `player.*` tokens, so the colours themselves stay in the Panda config.
export const createPlayerPalette = (): ((color: PlayerColor) => string) => {
  let palette: Map<PlayerColor, string> | null = null;

  const read = (): Map<PlayerColor, string> => {
    const style = getComputedStyle(document.documentElement);

    return new Map(playerColors.map((color) => [color, style.getPropertyValue(`--colors-player-${color}`).trim()]));
  };

  return (color) => {
    palette ??= read();

    return palette.get(color) || 'currentColor';
  };
};
