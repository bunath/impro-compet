import type { LiveState } from './types';
import { isTauri } from './tauri';

/** Canal de synchronisation régie <-> spectateur (événements Tauri, BroadcastChannel en dev web). */
export type BusMessage = { type: 'state'; state: LiveState } | { type: 'ready' };

const CHANNEL = 'impro:bus';
let web: BroadcastChannel | null = null;
const webChannel = () => (web ??= new BroadcastChannel(CHANNEL));

export async function sendBus(msg: BusMessage): Promise<void> {
  if (isTauri()) {
    const { emit } = await import('@tauri-apps/api/event');
    await emit(CHANNEL, msg);
  } else {
    webChannel().postMessage(msg);
  }
}

export async function listenBus(cb: (msg: BusMessage) => void): Promise<() => void> {
  if (isTauri()) {
    const { listen } = await import('@tauri-apps/api/event');
    return listen<BusMessage>(CHANNEL, (e) => cb(e.payload));
  }
  const ch = new BroadcastChannel(CHANNEL);
  ch.onmessage = (e: MessageEvent<BusMessage>) => cb(e.data);
  return () => ch.close();
}
