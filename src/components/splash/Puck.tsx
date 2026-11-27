import { motion } from 'framer-motion';

const LAYERS = 14;

/** Palet 3D en CSS : disques empilés, vu en plongée. Tourne, tombe, rebondit, se pose. */
export function Puck() {
  return (
    <motion.div
      className="relative h-48 w-48"
      style={{ perspective: 900 }}
      initial={{ y: -520, scale: 1.3, opacity: 0 }}
      animate={{ y: [-520, 0, -70, 0, -18, 0], scale: [1.3, 1, 1, 1, 1, 1], opacity: 1 }}
      transition={{ duration: 1.9, delay: 0.5, times: [0, 0.45, 0.62, 0.78, 0.9, 1], ease: 'easeIn' }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d', rotateX: 62 }}
        initial={{ rotateZ: 0 }}
        animate={{ rotateZ: 900 }}
        transition={{ duration: 1.7, delay: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {Array.from({ length: LAYERS }, (_, i) => {
          const top = i === LAYERS - 1;
          return (
            <div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                transform: `translateZ(${i * 3}px)`,
                background: top ? 'radial-gradient(circle at 35% 30%, #3a4260, #151a2b 70%)' : '#0a0c14',
                border: top ? '3px solid #ffb020' : 'none',
                boxShadow: top ? 'inset 0 0 24px #000a, 0 0 30px #ffb02055' : 'none',
              }}
            />
          );
        })}
      </motion.div>
      <motion.div
        className="absolute -bottom-6 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full bg-black/70 blur-md"
        initial={{ opacity: 0, scaleX: 0.4 }}
        animate={{ opacity: [0, 0.2, 0.8], scaleX: [0.4, 0.7, 1] }}
        transition={{ duration: 1.9, delay: 0.5 }}
      />
    </motion.div>
  );
}
