import { AnimatePresence, motion } from 'framer-motion';
import { formatClock, remainingMs } from '@/lib/clock';
import { displayScore } from '@/lib/match';
import type { LiveState, LiveTeam } from '@/lib/types';

function TeamBlock({ team, surprise }: { team: LiveTeam; surprise: boolean }) {
  const score = displayScore(team.score, surprise);
  const penalty = team.fouls > 0 && team.fouls % 3 === 0 ? 3 : team.fouls % 3;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <h2 className="max-w-[820px] truncate text-[96px] font-bold uppercase leading-none tracking-tight">
        {team.name}
      </h2>
      <div className="h-1.5 w-40 rounded-full" style={{ background: team.color }} />
      <AnimatePresence mode="popLayout">
        <motion.div
          key={score}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="font-display text-[440px] leading-[0.85]"
        >
          {score}
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-3" aria-label={`${team.fouls} fautes`}>
        {[0, 1, 2].map((k) => (
          <span
            key={k}
            className={`h-7 w-7 rounded-full border-[3px] ${penalty > k ? 'border-red-500 bg-red-500' : 'border-white/25'}`}
          />
        ))}
        <span className="ml-3 text-4xl font-semibold text-white/60">
          {team.fouls} faute{team.fouls > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

/** Rendu pur (1920×1080) : fenêtre spectateur ET aperçu de la régie. */
export function SpectatorScreen({ live, now }: { live: LiveState; now: number }) {
  const message = live.message && live.message.endsAt > now ? live.message : null;
  const [a, b] = live.teams;

  return (
    <div className="relative h-full w-full bg-[#07080c] text-white">
      <div className="flex h-[150px] items-center justify-between border-b border-white/10 px-20">
        <div className="text-4xl font-semibold uppercase tracking-[0.2em] text-amber-400">
          {live.category ?? ''}
        </div>
        {live.timerEnabled && (
          <div className="font-display text-[110px] leading-none">
            {formatClock(remainingMs(live.timer, now))}
          </div>
        )}
      </div>

      <div className="flex h-[930px] items-stretch px-16">
        <TeamBlock team={a} surprise={live.surprise} />
        <div className="my-24 w-px bg-white/10" />
        <TeamBlock team={b} surprise={live.surprise} />
      </div>

      <AnimatePresence>
        {live.halftime.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 grid place-items-center bg-[#07080c]"
          >
            <div className="text-center">
              <p className="text-[72px] font-semibold uppercase tracking-[0.3em] text-amber-400">
                Mi-temps
              </p>
              <p className="font-display text-[400px] leading-none">
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
            className="absolute inset-x-0 bottom-0 z-20 bg-amber-400 px-24 py-12 text-center text-[88px] font-bold uppercase leading-tight tracking-tight text-black"
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
