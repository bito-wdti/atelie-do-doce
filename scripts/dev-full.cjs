const { spawn } = require('node:child_process');

const isWindows = process.platform === 'win32';

function run(command) {
  const child = isWindows
    ? spawn('cmd.exe', ['/d', '/s', '/c', command], {
        cwd: process.cwd(),
        stdio: 'inherit',
        windowsHide: false,
      })
    : spawn(command, {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
      });

  child.on('error', (error) => {
    console.error(`Falha ao iniciar: ${command}`);
    console.error(error);
    shutdown(1);
  });

  return child;
}

const processes = [
  run('npm --prefix backend run dev'),
  run('npx vite --host localhost'),
];

function shutdown(code = 0) {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) shutdown(code);
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
