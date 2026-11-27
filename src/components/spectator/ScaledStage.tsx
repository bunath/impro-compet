import type { ReactNode } from 'react';
import { useFitScale } from '@/hooks/useFitScale';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/** Canevas 1920×1080 mis à l'échelle pour remplir son conteneur (aperçu ou plein écran). */
export function ScaledStage({ children }: { children: ReactNode }) {
  const { ref, scale } = useFitScale(STAGE_W, STAGE_H);
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-black">
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
