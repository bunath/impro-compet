import { useEffect, useRef, useState } from 'react';

/** Échelle pour faire tenir un canevas fixe (ex. 1920×1080) dans son conteneur. */
export function useFitScale(width: number, height: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setScale(Math.min(w / width, h / height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);
  return { ref, scale };
}
