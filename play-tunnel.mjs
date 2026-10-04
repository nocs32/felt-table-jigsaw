// `pnpm play:tunnel`: the felt-table Cloudflare Tunnel in front of the `vite preview` server.
// cloudflared is looked up on PATH, then in its Windows install folders: terminals (and the apps
// that host them) started before cloudflared was installed don't have it on PATH yet.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const tunnelName = 'felt-table';
const originUrl = 'http://127.0.0.1:4173';

const windowsInstallPaths = [
  path.join(process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'cloudflared', 'cloudflared.exe'),
  path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'cloudflared', 'cloudflared.exe'),
];

const isOnPath = (command) => spawnSync(command, ['--version'], { stdio: 'ignore' }).error === undefined;

const findCloudflared = () => {
  if (isOnPath('cloudflared')) {
    return 'cloudflared';
  }

  return windowsInstallPaths.find((candidate) => existsSync(candidate)) ?? null;
};

const cloudflared = findCloudflared();

if (cloudflared === null) {
  console.error('cloudflared is not installed. On Windows: winget install Cloudflare.cloudflared. See "Play with friends" in the README.');
  process.exit(1);
}

const tunnel = spawn(cloudflared, ['tunnel', 'run', '--url', originUrl, tunnelName], { stdio: 'inherit' });

tunnel.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
