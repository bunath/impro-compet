import { isTauri } from './tauri';

type Level = 'debug' | 'info' | 'warn' | 'error';

/** Logs vers la console DevTools ET le terminal de `pnpm tauri dev` (via plugin-log). */
async function emit(level: Level, scope: string, message: string, extra?: unknown) {
  const line = `[${scope}] ${message}`;
  console[level === 'debug' ? 'log' : level](line, extra ?? '');
  if (!isTauri()) return;
  try {
    const log = await import('@tauri-apps/plugin-log');
    await log[level](extra === undefined ? line : `${line} ${JSON.stringify(extra)}`);
  } catch {
    /* le logger ne doit jamais casser l'app */
  }
}

export const logger = {
  debug: (scope: string, msg: string, extra?: unknown) => void emit('debug', scope, msg, extra),
  info: (scope: string, msg: string, extra?: unknown) => void emit('info', scope, msg, extra),
  warn: (scope: string, msg: string, extra?: unknown) => void emit('warn', scope, msg, extra),
  error: (scope: string, msg: string, extra?: unknown) => void emit('error', scope, msg, extra),
};
