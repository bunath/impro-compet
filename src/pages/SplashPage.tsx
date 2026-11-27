import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Puck } from '@/components/splash/Puck';
import { SpotlightBeam } from '@/components/splash/SpotlightBeam';
import { useAppStore } from '@/store/appStore';

const BEAMS = [
  { x: '12%', angle: -24, color: '#ffb020', delay: 0.1 },
  { x: '32%', angle: -11, color: '#3ea6ff', delay: 0.3 },
  { x: '50%', angle: 0, color: '#ffffff', delay: 0.5 },
  { x: '68%', angle: 11, color: '#ff5d73', delay: 0.3 },
  { x: '88%', angle: 24, color: '#a78bfa', delay: 0.1 },
];

export function SplashPage() {
  const go = useAppStore((s) => s.go);
  const firstRunDone = useAppStore((s) => s.firstRunDone);
  useEffect(() => {
    const t = window.setTimeout(() => go(firstRunDone ? 'welcome' : 'download'), 4600);
    return () => window.clearTimeout(t);
  }, [go, firstRunDone]);

  return (
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,#161c33,#05060a_75%)]">
      {BEAMS.map((b) => <SpotlightBeam key={b.x} {...b} />)}
      <div className="relative z-10 flex flex-col items-center gap-24">
        <Puck />
        <motion.h1
          className="text-3xl font-semibold uppercase tracking-[0.4em] text-ink/90"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 2.6, duration: 0.9 }}
        >
          Bienvenue
        </motion.h1>
      </div>
    </div>
  );
}
