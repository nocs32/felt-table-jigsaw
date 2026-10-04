// Reads an array slot the caller knows exists. Throws instead of returning undefined.
export const itemAt = <T>(items: readonly T[], index: number): T => {
  const item = items[index];

  if (item === undefined) {
    throw new RangeError(`Index ${index} is out of range (length ${items.length}).`);
  }

  return item;
};
