export interface Config {
  port: number;
}

const defaultPort = 2567;

const readPort = (value: string | undefined): number => {
  const port = Number(value ?? defaultPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`CORE_API_PORT must be a positive integer, got "${value}"`);
  }

  return port;
};

// CORE_API_PORT, not PORT: tools that start the whole workspace often set PORT for the web dev server.
export const config: Config = {
  port: readPort(process.env.CORE_API_PORT),
};
