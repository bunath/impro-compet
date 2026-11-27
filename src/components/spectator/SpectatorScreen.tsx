import { AnimatePresence, motion } from 'framer-motion';
import { formatClock, remainingMs } from '@/lib/clock';
import { displayScore } from '@/lib/match';
import type { LiveState, LiveTeam } from '@/lib/types';

function TeamBlock({ team, surprise }: { team: LiveTeam; surprise: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="h-3 w-56 rounded-full" style={{ background: team.color }} />
      <h2 className="max-w-[760px] truncate font-display text-[110px] uppercase leading-none tracking-wide">
        {team.name}
      </h2>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={displayScore(team.score, surprise)}
          initial={{ scale: 1.25, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          className="font-display text-[400px] leading-[0.9] tabular-nums"
          style={{ color: team.color, textShadow: `0 0 80px ${team.color}66` }}
        >
          {displayScore(team.score, surprise)}
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-4" aria-label={`${team.fouls} fautes`}>
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            className={`h-9 w-9 rounded-full border-4 ${team.fouls % 3 > k || (team.fouls > 0 && team.fouls % 3 === 0) ? 'border-red-500 bg-red-500' : 'border-white/30'}`}
          />
        ))}
        <span className="ml-2 font-display text-5xl text-white/70">
          {team.fouls} faute{team.fouls > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

/** Rendu pur (1920×1080) : utilisé par la fenêtre spectateur ET l'aperçu de la régie. */
export function SpectatorScreen({ live, now }: { live: LiveState; now: number }) {
  const showHalftime = live.halftime.active;
  const message = live.message && live.message.endsAt > now ? live.message : null;
  const [a, b] = live.teams;

  return (
    <div className="relative h-full w-full bg-[radial-gradient(ellipse_at_top,#1b2240,#05060a_70%)] text-white">
      <div className="flex h-[170px] items-center justify-center gap-10">
        {live.category && (
          <div className="rounded-full border-2 border-accent px-12 py-3 font-display text-7xl uppercase tracking-widest text-accent">
            {live.category}
          </div>
        )}
        {live.timerEnabled && (
          <div className="font-display text-[130px] tabular-nums leading-none">
            {formatClock(remainingMs(live.timer, now))}
          </div>
        )}
      </div>

      <div className="flex h-[910px] items-stretch px-16">
        <TeamBlock team={a} surprise={live.surprise} />
        <div className="my-20 w-px bg-white/15" />
        <TeamBlock team={b} surprise={live.surprise} />
      </div>

      <AnimatePresence>
        {showHalftime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 grid place-items-center bg-black/85"
          >
            <div className="text-center">
              <p className="font-display text-[110px] uppercase tracking-widest text-accent">
                Mi-temps
              </p>
              <p className="font-display text-[420px] leading-none tabular-nums">
                {formatClock(remainingMs(live.halftime, now))}
              </p>
            </div>
          </motion.div>
        )}
        {message && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute inset-x-0 bottom-0 z-20 bg-accent px-24 py-14 text-center font-display text-[110px] uppercase leading-tight text-accent-ink"
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
