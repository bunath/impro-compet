import { isServerOpen, SERVER_HOURS_LABEL } from '@/lib/serverHours';
import { isTauri } from '@/lib/tauri';
import { logger } from '@/lib/logger';
import type { MatchConfig, ResourcePack, User } from '@/lib/types';
import { useAppStore } from '@/store/appStore';

/** Tout le trafic passe par le serveur perso exposé via Tailscale Funnel (HTTPS). */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export class ServerClosedError extends ApiError {
  constructor() {
    super(`Serveur hors horaires (disponible de ${SERVER_HOURS_LABEL}).`, 0);
  }
}

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  if (isTauri()) {
    const { fetch } = await import('@tauri-apps/plugin-http');
    return fetch(url, init);
  }
  return window.fetch(url, init);
}

async function raw(path: string, init: { method?: string; body?: unknown; auth?: boolean } = {}) {
  if (!isServerOpen()) throw new ServerClosedError();
  const { serverUrl, token } = useAppStore.getState();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init.auth !== false && token) headers.Authorization = `Bearer ${token}`;
  logger.debug('api', `${init.method ?? 'GET'} ${path}`);
  let res: Response;
  try {
    res = await doFetch(`${serverUrl}${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch (e) {
    throw new ApiError(`Serveur injoignable : ${String(e)}`, 0);
  }
  if (!res.ok) throw new ApiError((await res.text()) || res.statusText, res.status);
  return res;
}

const json = async <T>(path: string, init?: Parameters<typeof raw>[1]) =>
  (await raw(path, init)).json() as Promise<T>;

export interface PackSummary {
  id: string;
  name: string;
  description: string;
  version: number;
}

export const api = {
  register: (b: { username: string; email: string; password: string }) =>
    json<{ ok: true }>('/auth/register', { method: 'POST', body: b, auth: false }),
  login: (b: { username: string; password: string }) =>
    json<{ user: User; token: string }>('/auth/login', { method: 'POST', body: b, auth: false }),
  forgotPassword: (b: { email: string }) =>
    json<{ ok: true }>('/auth/forgot', { method: 'POST', body: b, auth: false }),
  listPacks: () => json<PackSummary[]>('/packs'),
  putConfig: (c: MatchConfig) => json<{ ok: true }>(`/configs/${c.id}`, { method: 'PUT', body: c }),
  listConfigs: () => json<MatchConfig[]>('/configs'),
};

/** Télécharge un pack avec progression (0..1). */
export async function downloadPack(id: string, onProgress: (ratio: number) => void) {
  const res = await raw(`/packs/${id}/download`);
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body) {
    onProgress(1);
    return (await res.json()) as ResourcePack;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) onProgress(Math.min(1, received / total));
  }
  onProgress(1);
  return JSON.parse(await new Blob(chunks as BlobPart[]).text()) as ResourcePack;
}
