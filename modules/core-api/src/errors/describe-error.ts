// One-line description of a thrown value for logs, including the cause (fetch hides the network error there).
export const describeError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause = error.cause instanceof Error ? ` (${error.cause.message})` : '';

  return `${error.name}: ${error.message}${cause}`;
};
