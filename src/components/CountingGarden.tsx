import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GardenFlower } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { RotateCcw, Star, Sparkles } from 'lucide-react';

interface GardenTheme {
  type: 'flower' | 'butterfly' | 'ladybug' | 'star';
  emoji: string;
  name: string;
  actionWord: string;
  seedEmoji: string;
  targetCount: number;
  bgPastel: string;
}

const GARDEN_THEMES: GardenTheme[] = [
  {
    type: 'flower',
    emoji: '🌸',
    name: 'Magic Flowers',
    actionWord: 'Grow',
    seedEmoji: '🌱',
    targetCount: 5,
    bgPastel: 'bg-emerald-50/40',
  },
  {
    type: 'butterfly',
    emoji: '🦋',
    name: 'Fluttering Butterflies',
    actionWord: 'Catch',
    seedEmoji: '🥚', // cocoon
    targetCount: 6,
    bgPastel: 'bg-teal-50/40',
  },
  {
    type: 'ladybug',
    emoji: '🐞',
    name: 'Lucky Ladybugs',
    actionWord: 'Count',
    seedEmoji: '🍃', // leaf
    targetCount: 7,
    bgPastel: 'bg-lime-50/40',
  },
  {
    type: 'star',
    emoji: '⭐',
    name: 'Wish Stars',
    actionWord: 'Light up',
    seedEmoji: '☁️', // cloud
    targetCount: 8,
    bgPastel: 'bg-amber-50/30',
  },
];

export default function CountingGarden({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [theme, setTheme] = useState<GardenTheme>(GARDEN_THEMES[0]);
  const [items, setItems] = useState<GardenFlower[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);

  useEffect(() => {
    restartGame();
  }, [theme]);

  const restartGame = () => {
    // Generate random coordinates in the garden coordinate grid (safe margin 10% to 90%)
    const newItems: GardenFlower[] = Array.from({ length: theme.targetCount }).map((_, idx) => {
      // Prevent overlapping too much by dividing grid slightly
      const angle = (idx / theme.targetCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const radius = 0.25 + Math.random() * 0.15; // 25% to 40% distance from center
      const x = 50 + Math.cos(angle) * radius * 100;
      const y = 50 + Math.sin(angle) * radius * 100;

      const randomEmojis = {
        flower: ['🌸', '🌺', '🌹', '🌻', '🌷'],
        butterfly: ['🦋', '🐝', '🐞', '🦗'], // colorful bugs
        ladybug: ['🐞'],
        star: ['⭐', '🌟', '✨'],
      };

      const itemsPool = randomEmojis[theme.type];
      const selectedEmoji = itemsPool[Math.floor(Math.random() * itemsPool.length)];

      return {
        id: `gitem-${idx}`,
        emoji: selectedEmoji,
        x: Math.min(Math.max(x, 15), 85), // bound within grid
        y: Math.min(Math.max(y, 15), 85),
        scale: Math.random() * 0.2 + 0.9, // slight size variation
        tapped: false,
      };
    });

    setItems(newItems);
    setTapCount(0);
    setRoundComplete(false);
  };

  const handleTapItem = (itemIdx: number) => {
    if (items[itemIdx].tapped || roundComplete) return;

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    // Dynamic pitch synthesis! Pitch climbs upwards with each tapped count
    const pitch = 0.8 + (nextCount * 0.12);
    audioManager.playSparkle(pitch);

    const updatedItems = [...items];
    updatedItems[itemIdx] = {
      ...updatedItems[itemIdx],
      tapped: true,
      tapOrder: nextCount,
    };
    setItems(updatedItems);

    // Check if finished counting!
    if (nextCount === theme.targetCount) {
      setRoundComplete(true);
      setTimeout(() => {
        audioManager.playGameComplete();
        onGameWin(3); // reward 3 stars!
      }, 400);
    }
  };

  const handleSwitchTheme = (newTheme: GardenTheme) => {
    audioManager.playPop();
    setTheme(newTheme);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black" id="counting-garden-game">
      <ConfettiEffect active={roundComplete} />

      {/* Progress & Category Switcher */}
      <div className="w-full flex flex-col gap-4 bg-emerald-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Header instructions */}
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🌟</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight leading-none" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                {theme.actionWord} {theme.targetCount} {theme.name}!
              </h2>
              <p className="text-xs font-bold text-gray-800 mt-1">
                {roundComplete
                  ? 'Fantastic! You did a perfect counting job!'
                  : 'Tap the seed bubbles to make them grow! Hear the musical bells count up!'}
              </p>
            </div>
          </div>

          {/* Current Score */}
          <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
            <span className="text-xs font-black uppercase tracking-widest font-sans">GARDEN COUNT:</span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-black font-mono">{tapCount}</span>
              <span className="text-black font-mono">/</span>
              <span className="text-sm font-black text-gray-700 font-mono">{theme.targetCount}</span>
            </div>
          </div>
        </div>

        {/* Theme tabs switcher */}
        <div className="flex flex-wrap gap-2 pt-3 border-t-3 border-black/15">
          {GARDEN_THEMES.map((t) => {
            const isSelected = t.type === theme.type;
            return (
              <button
                key={t.type}
                onClick={() => handleSwitchTheme(t)}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  isSelected
                    ? 'bg-yellow-300 text-black'
                    : 'bg-white hover:bg-yellow-100 text-black'
                }`}
                id={`garden-tab-${t.type}`}
              >
                <span>{t.emoji}</span>
                <span className="font-sans uppercase">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grassy Meadow Board */}
      <div
        className={`w-full aspect-[4/3] max-h-[460px] rounded-[44px] border-4 border-black relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${theme.bgPastel} transition-colors duration-500`}
        style={{
          backgroundImage: `radial-gradient(circle at 10px 10px, rgba(16, 185, 129, 0.05) 2px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Playful environment visuals (some static grass puffs, butterflies or clouds) */}
        <div className="absolute top-8 left-12 text-3xl opacity-10 select-none pointer-events-none">🌿</div>
        <div className="absolute bottom-12 right-12 text-3xl opacity-10 select-none pointer-events-none">🌿</div>
        <div className="absolute top-20 right-20 text-3xl opacity-10 select-none pointer-events-none">☁️</div>

        {/* Scattered items */}
        {items.map((item, idx) => {
          return (
            <div
              key={item.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
              onClick={() => handleTapItem(idx)}
              id={`garden-item-${idx}`}
            >
              <AnimatePresence mode="wait">
                {!item.tapped ? (
                  // Little Seed bubble waiting to bloom
                  <motion.div
                    key="seed"
                    className="w-14 h-14 rounded-full bg-white border-3 border-black hover:border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative hover:scale-110 active:scale-95 transition-all"
                    initial={{ scale: 0 }}
                    animate={{
                      scale: [0.9, 1.05, 0.9],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5 + (idx * 0.2), // staggered rhythm
                    }}
                  >
                    <span className="text-2xl filter drop-shadow-sm select-none">{theme.seedEmoji}</span>
                    {/* Tiny pulsing light ring */}
                    <div className="absolute inset-0 border-2 border-black rounded-full animate-ping opacity-25" />
                  </motion.div>
                ) : (
                  // Tapped! Full blossomed gorgeous visual flower/bug
                  <motion.div
                    key="bloom"
                    initial={{ scale: 0.1, rotate: -45 }}
                    animate={{ scale: item.scale, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 180 }}
                    className="relative flex flex-col items-center"
                  >
                    <span className="text-6xl filter drop-shadow-md select-none animate-wiggle">
                      {item.emoji}
                    </span>

                    {/* Numeric Badge popping up */}
                    <motion.div
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: -45 }}
                      transition={{ type: 'spring', damping: 8 }}
                      className="absolute bg-yellow-300 text-black font-black text-sm px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black font-mono flex items-center gap-1"
                    >
                      <span>{item.tapOrder}</span>
                      <Sparkles className="w-3 h-3 fill-black text-black" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Victory Overlay directly inside the Garden meadow */}
        <AnimatePresence>
          {roundComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-20"
            >
              <motion.div
                initial={{ scale: 0.5, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                className="bg-emerald-300 p-8 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-[320px] border-4 border-black"
              >
                <div className="flex gap-1.5 justify-center mb-3">
                  <Star className="w-8 h-8 fill-yellow-400 text-black animate-bounce delay-75" />
                  <Star className="w-10 h-10 fill-yellow-400 text-black animate-bounce" />
                  <Star className="w-8 h-8 fill-yellow-400 text-black animate-bounce delay-150" />
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight leading-none">SUPER GARDENER!</h3>
                <p className="text-xs font-bold text-gray-800 mt-2">
                  You planted and counted all {theme.targetCount} {theme.name}!
                </p>

                <button
                  onClick={restartGame}
                  className="mt-6 w-full py-3 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                >
                  PLAY GARDEN AGAIN
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Play Again footer button */}
      <div className="mt-10">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 px-6 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          REGROW SEEDLINGS
        </button>
      </div>
    </div>
  );
}
