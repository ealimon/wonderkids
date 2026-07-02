import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'star';
  size: number;
  rotation: number;
  scale: number;
  delay: number;
}

const CONFETTI_COLORS = [
  '#FF597B', // soft pink
  '#FF8E9E', // coral pink
  '#FFB1C1', // rose blush
  '#FCDDB0', // soft peach
  '#6096B4', // playful sky blue
  '#93BFCF', // pastel blue
  '#BDCDD6', // misty blue
  '#A0D8B3', // minty green
  '#FFD93D', // bright sunshine yellow
  '#FF6B6B', // vibrant red-orange
  '#8E44AD', // cute purple
];

export default function ConfettiEffect({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces: ConfettiPiece[] = Array.from({ length: 65 }).map((_, idx) => {
      const shapes: ('circle' | 'square' | 'triangle' | 'star')[] = [
        'circle',
        'square',
        'triangle',
        'star',
      ];
      return {
        id: idx,
        x: Math.random() * 100, // starting horizontal percentage
        y: -10, // above screen
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: Math.random() * 14 + 10, // 10px to 24px
        rotation: Math.random() * 360,
        scale: Math.random() * 0.6 + 0.6,
        delay: Math.random() * 0.4, // staggered launch
      };
    });

    setPieces(newPieces);

    // Auto-clear after 4 seconds to free resources
    const timer = setTimeout(() => {
      setPieces([]);
    }, 4500);

    return () => clearTimeout(timer);
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}vw`,
              y: '-20px',
              rotate: piece.rotation,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
              x: `${piece.x + (Math.random() * 30 - 15)}vw`, // float side-to-side
              rotate: piece.rotation + 720,
              scale: piece.scale,
              opacity: [1, 1, 1, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: Math.random() * 1.8 + 2.2, // 2.2s to 4s fall
              delay: piece.delay,
              ease: 'easeOut',
            }}
            className="absolute"
            style={{
              width: piece.size,
              height: piece.size,
            }}
          >
            {piece.shape === 'circle' && (
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: piece.color }}
              />
            )}
            {piece.shape === 'square' && (
              <div
                className="w-full h-full rounded-sm"
                style={{ backgroundColor: piece.color }}
              />
            )}
            {piece.shape === 'triangle' && (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,15 90,85 10,85" fill={piece.color} />
              </svg>
            )}
            {piece.shape === 'star' && (
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z"
                  fill={piece.color}
                />
              </svg>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
