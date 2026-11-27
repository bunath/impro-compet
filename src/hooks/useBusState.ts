import { useEffect, useState } from 'react';
import { listenBus, sendBus } from '@/lib/bus';
import type { LiveState } from '@/lib/types';
import { useMatchStore } from '@/store/matchStore';

/** Régie : publie l'état à chaque changement + à la demande d'un spectateur qui s'ouvre. */
export function usePublishLive() {
  useEffect(() => {
    const publish = () => void sendBus({ type: 'state', state: useMatchStore.getState().live });
    publish();
    const unsub = useMatchStore.subscribe((s, prev) => s.live !== prev.live && publish());
    let stop = () => {};
    void listenBus((m) => m.type === 'ready' && publish()).then((u) => (stop = u));
    return () => {
      unsub();
      stop();
    };
  }, []);
}

/** Spectateur : reçoit l'état en temps réel. */
export function useSpectatorState(): LiveState | null {
  const [state, setState] = useState<LiveState | null>(null);
  useEffect(() => {
    let stop = () => {};
    void listenBus((m) => m.type === 'state' && setState(m.state)).then((u) => {
      stop = u;
      void sendBus({ type: 'ready' });
    });
    return () => stop();
  }, []);
  return state;
}
