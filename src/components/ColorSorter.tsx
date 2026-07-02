import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SorterItem, SorterBucket } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { ArrowRight, RotateCcw, Star } from 'lucide-react';

const COLOR_BUCKETS: SorterBucket[] = [
  {
    color: 'red',
    label: 'Red Basket',
    emoji: '🧺🔴',
    bgColor: 'bg-rose-400 hover:bg-rose-500',
    borderColor: 'border-black',
    textColor: 'text-white',
  },
  {
    color: 'blue',
    label: 'Blue Basket',
    emoji: '🧺🔵',
    bgColor: 'bg-sky-400 hover:bg-sky-500',
    borderColor: 'border-black',
    textColor: 'text-white',
  },
  {
    color: 'green',
    label: 'Green Basket',
    emoji: '🧺🟢',
    bgColor: 'bg-emerald-400 hover:bg-emerald-500',
    borderColor: 'border-black',
    textColor: 'text-white',
  },
  {
    color: 'yellow',
    label: 'Yellow Basket',
    emoji: '🧺🟡',
    bgColor: 'bg-yellow-300 hover:bg-yellow-400',
    borderColor: 'border-black',
    textColor: 'text-black',
  },
];

const INITIAL_ITEMS: SorterItem[] = [
  // Red items
  { id: 'r1', emoji: '🍎', name: 'Apple', color: 'red' },
  { id: 'r2', emoji: '🍓', name: 'Strawberry', color: 'red' },
  { id: 'r3', emoji: '🚒', name: 'Fire Engine', color: 'red' },
  { id: 'r4', emoji: '🐞', name: 'Ladybug', color: 'red' },
  // Blue items
  { id: 'b1', emoji: '🫐', name: 'Blueberries', color: 'blue' },
  { id: 'b2', emoji: '🐳', name: 'Whale', color: 'blue' },
  { id: 'b3', emoji: '🎈', name: 'Balloon', color: 'blue' },
  { id: 'b4', emoji: '🚙', name: 'Blue Car', color: 'blue' },
  // Green items
  { id: 'g1', emoji: '🥦', name: 'Broccoli', color: 'green' },
  { id: 'g2', emoji: '🐸', name: 'Frog', color: 'green' },
  { id: 'g3', emoji: '🐢', name: 'Turtle', color: 'green' },
  { id: 'g4', emoji: '🍃', name: 'Leaf', color: 'green' },
  // Yellow items
  { id: 'y1', emoji: '🍌', name: 'Banana', color: 'yellow' },
  { id: 'y2', emoji: '🍋', name: 'Lemon', color: 'yellow' },
  { id: 'y3', emoji: '☀️', name: 'Sun', color: 'yellow' },
  { id: 'y4', emoji: '🐥', name: 'Chicky', color: 'yellow' },
];

export default function ColorSorter({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [items, setItems] = useState<SorterItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SorterItem | null>(null);
  const [solvedItems, setSolvedItems] = useState<{ [key: string]: string }>({}); // itemId -> bucketColor
  const [selectedItem, setSelectedItem] = useState<SorterItem | null>(null);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Initialize and shuffle items
  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    // Select 5 random items of different colors for a single round to keep it fresh
    const shuffled = [...INITIAL_ITEMS].sort(() => Math.random() - 0.5);
    const selectedRound = shuffled.slice(0, 5);
    setItems(selectedRound);
    setCurrentItem(selectedRound[0]);
    setSolvedItems({});
    setSelectedItem(null);
    setWrongTarget(null);
    setRoundComplete(false);
    setScore(0);
  };

  const handleSelectBucket = (bucketColor: string) => {
    const itemToSolve = selectedItem || currentItem;
    if (!itemToSolve || roundComplete) return;

    if (itemToSolve.color === bucketColor) {
      // Correct Match!
      audioManager.playCorrect();
      const nextSolved = { ...solvedItems, [itemToSolve.id]: bucketColor };
      setSolvedItems(nextSolved);
      setScore((prev) => prev + 1);
      setSelectedItem(null);
      setWrongTarget(null);

      // Find index of current item in items list
      const currentIndex = items.findIndex((i) => i.id === itemToSolve.id);
      if (currentIndex < items.length - 1) {
        setCurrentItem(items[currentIndex + 1]);
      } else {
        // All items matched!
        setCurrentItem(null);
        setRoundComplete(true);
        audioManager.playGameComplete();
        onGameWin(3); // reward 3 stars!
      }
    } else {
      // Incorrect Match
      audioManager.playIncorrect();
      setWrongTarget(bucketColor);
      setTimeout(() => setWrongTarget(null), 800);
    }
  };

  const handleSelectItem = (item: SorterItem) => {
    if (roundComplete) return;
    audioManager.playPop();
    setSelectedItem(item);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black" id="color-sorter-game">
      <ConfettiEffect active={roundComplete} />

      {/* Progress Tracker */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-yellow-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black uppercase tracking-wider">PROGRESS:</span>
          <div className="flex gap-2">
            {items.map((item, idx) => {
              const isSolved = solvedItems[item.id] !== undefined;
              const isCurrent = currentItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`w-5 h-5 rounded-full transition-all duration-300 border-2 border-black ${
                    isSolved
                      ? 'bg-emerald-400 scale-110'
                      : isCurrent
                      ? 'bg-orange-500 animate-pulse scale-110'
                      : 'bg-white'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Star className="w-5 h-5 fill-yellow-400 text-black" />
          <span className="font-black font-mono text-sm">{score} / {items.length} MATCHED</span>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Left Side: Goal / Prompt */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left bg-orange-100 p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] justify-center">
          <div className="bg-yellow-300 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4 rounded-2xl mb-4">
            <span className="text-3xl">🎨</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-none" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            {roundComplete ? 'SPECTACULAR!' : 'SORT BY COLOR'}
          </h2>
          <p className="text-xs font-bold text-gray-700 mt-3 leading-relaxed">
            {roundComplete
              ? 'Awesome job! All colorful items are safe and happy in their colored baskets!'
              : 'Tap the active toy, animal, or fruit inside the dotted zone. Then, tap its matching colored basket!'}
          </p>
        </div>

        {/* Center: Active Item to Sort */}
        <div className="flex flex-col items-center justify-center bg-sky-100 border-4 border-dashed border-black rounded-3xl p-8 min-h-[250px] relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <AnimatePresence mode="wait">
            {!roundComplete && currentItem ? (
              <motion.div
                key={currentItem.id}
                initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.2, rotate: 15, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 180 }}
                onClick={() => handleSelectItem(currentItem)}
                className={`w-40 h-40 rounded-3xl flex flex-col items-center justify-center bg-white border-4 border-black cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  selectedItem?.id === currentItem.id ? 'ring-4 ring-orange-500 animate-bounce' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id={`sorter-item-${currentItem.id}`}
              >
                <span className="text-7xl mb-1 filter drop-shadow-md select-none">{currentItem.emoji}</span>
                <span className="text-xs font-black uppercase tracking-wide text-black font-sans">{currentItem.name}</span>
              </motion.div>
            ) : roundComplete ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex gap-2 mb-4">
                  <Star className="w-10 h-10 fill-yellow-400 text-black animate-bounce delay-100" />
                  <Star className="w-12 h-12 fill-yellow-400 text-black animate-bounce" />
                  <Star className="w-10 h-10 fill-yellow-400 text-black animate-bounce delay-200" />
                </div>
                <h3 className="text-2xl font-black uppercase text-emerald-600">PERFECT!</h3>
                <p className="text-xs font-bold text-gray-700 mt-2 max-w-[200px]">You found the right color basket for every item!</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Right Side: Solved Queue List */}
        <div className="bg-rose-100 p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center min-h-[160px]">
          <h3 className="text-xs font-black uppercase tracking-widest mb-4 font-sans text-center md:text-left text-rose-950">MATCHED ITEMS</h3>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {Object.keys(solvedItems).length === 0 ? (
              <span className="text-xs font-bold text-rose-900 font-sans italic py-4">Waiting for first match...</span>
            ) : (
              items.map((item) => {
                const isSolved = solvedItems[item.id] !== undefined;
                if (!isSolved) return null;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {item.emoji}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Target Buckets / Baskets */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
        {COLOR_BUCKETS.map((bucket) => {
          const isWrong = wrongTarget === bucket.color;
          return (
            <motion.div
              key={bucket.color}
              onClick={() => handleSelectBucket(bucket.color)}
              className={`border-4 border-black rounded-[32px] p-6 flex flex-col items-center justify-center cursor-pointer transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] ${
                bucket.bgColor
              } ${bucket.textColor} ${
                isWrong ? 'bg-red-500 text-white animate-shake' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              id={`sorter-bucket-${bucket.color}`}
            >
              <span className="text-6xl mb-2 filter drop-shadow-sm select-none">{bucket.emoji}</span>
              <span className="font-black text-lg uppercase tracking-wide font-sans">{bucket.color}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Buttons / Actions */}
      <div className="mt-10 flex gap-4">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 px-6 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
