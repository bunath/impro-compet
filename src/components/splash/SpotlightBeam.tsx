import { motion } from 'framer-motion';

interface Props {
  x: string; // position horizontale du projecteur (%)
  angle: number; // inclinaison vers le centre
  color: string;
  delay: number;
}

/** Faisceau de projecteur : triangle dégradé qui oscille doucement. */
export function SpotlightBeam({ x, angle, color, delay }: Props) {
  return (
    <motion.div
      className="absolute top-0 h-[120%] w-[34vw] origin-top"
      style={{
        left: x,
        marginLeft: '-17vw',
        clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
        background: `linear-gradient(to bottom, ${color}cc, ${color}22 70%, transparent)`,
        filter: 'blur(6px)',
        mixBlendMode: 'screen',
      }}
      initial={{ opacity: 0, rotate: angle * 1.6 }}
      animate={{ opacity: [0, 0.9, 0.7, 0.9], rotate: [angle * 1.6, angle, angle * 0.85, angle] }}
      transition={{ duration: 2.6, delay, ease: 'easeInOut' }}
    />
  );
}
