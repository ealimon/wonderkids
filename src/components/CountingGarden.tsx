import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GardenFlower } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import {
  RotateCcw,
  Star,
  Sparkles,
  Printer,
  RefreshCw,
  FileText,
  Check,
} from 'lucide-react';

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

interface GardenProblem {
  id: string;
  type: string;
  emoji: string;
  name: string;
  targetCount: number;
  totalCount: number;
}

const WORKSHEET_ITEMS: Omit<GardenProblem, 'id' | 'targetCount' | 'totalCount'>[] = [
  { type: 'flower', emoji: '🌸', name: 'Magic Flowers' },
  { type: 'butterfly', emoji: '🦋', name: 'Fluttering Butterflies' },
  { type: 'ladybug', emoji: '🐞', name: 'Lucky Ladybugs' },
  { type: 'star', emoji: '⭐', name: 'Wish Stars' },
  { type: 'mushroom', emoji: '🍄', name: 'Magic Mushrooms' },
  { type: 'bee', emoji: '🐝', name: 'Busy Bumblebees' },
  { type: 'clover', emoji: '🍀', name: 'Lucky Clovers' },
  { type: 'snail', emoji: '🐌', name: 'Happy Snails' },
];

export default function CountingGarden({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [activeTab, setActiveTab] = useState<'game' | 'worksheet'>('game');

  // Interactive Game States
  const [theme, setTheme] = useState<GardenTheme>(GARDEN_THEMES[0]);
  const [items, setItems] = useState<GardenFlower[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);

  // Printable Worksheet Lab States
  const [wsShowAnswers, setWsShowAnswers] = useState(false);
  const [wsProblemCount, setWsProblemCount] = useState<number>(6);
  const [wsMascotTheme, setWsMascotTheme] = useState<'garden' | 'meadow' | 'fairy'>('garden');
  const [wsType, setWsType] = useState<'count_and_write' | 'color_to_match' | 'count_trace'>('count_and_write');
  const [wsProblems, setWsProblems] = useState<GardenProblem[]>([]);

  useEffect(() => {
    restartGame();
  }, [theme]);

  useEffect(() => {
    handleGeneratePrintWorksheet();
  }, [wsProblemCount, wsType]);

  const restartGame = () => {
    // Generate random coordinates in the garden coordinate grid (safe margin 15% to 85%)
    const newItems: GardenFlower[] = Array.from({ length: theme.targetCount }).map((_, idx) => {
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

  const handleGeneratePrintWorksheet = () => {
    const generated: GardenProblem[] = [];
    const pool = [...WORKSHEET_ITEMS].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < wsProblemCount; i++) {
      const itemTemplate = pool[i % pool.length];
      const targetCount = Math.floor(Math.random() * 8) + 2; // 2 to 9
      
      // For color matching, total should be larger
      const padding = Math.floor(Math.random() * 3) + 2; // 2 to 4
      const totalCount = Math.min(10, targetCount + padding);
      
      generated.push({
        id: `garden-problem-${i}-${Date.now()}`,
        ...itemTemplate,
        targetCount,
        totalCount,
      });
    }
    setWsProblems(generated);
  };

  const handlePrint = () => {
    audioManager.playPop();
    window.print();
  };

  const getMascotDetails = () => {
    switch (wsMascotTheme) {
      case 'meadow':
        return {
          emoji: '🦋',
          label: 'MEADOW EXPLORERS CLUB',
          title: 'FLUTTERING MEADOW NUMBERS',
          bg: 'bg-teal-300 text-black',
        };
      case 'fairy':
        return {
          emoji: '✨',
          label: 'FAIRY FOREST SCHOOL',
          title: 'FAIRY TALE COUNTING LAB',
          bg: 'bg-amber-300 text-black',
        };
      case 'garden':
      default:
        return {
          emoji: '🌸',
          label: 'GARDEN MATH ACADEMY',
          title: 'MAGIC GARDEN COUNTING',
          bg: 'bg-emerald-300 text-black',
        };
    }
  };

  const getWorksheetInstructions = () => {
    switch (wsType) {
      case 'color_to_match':
        return 'Look at the target number in the yellow bubble, then color exactly that many items inside the garden bed!';
      case 'count_trace':
        return 'Count the magic garden items inside the plot carefully, write the total count, and trace the numbers nicely below!';
      case 'count_and_write':
      default:
        return 'Count the gorgeous garden items inside each garden plot, and write the final total inside the dotted flowerpot circle!';
    }
  };

  const mascot = getMascotDetails();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none text-black animate-fadeIn" id="counting-garden-root">
      
      {/* Navigation tabs switcher (Hidden when printing) */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('game');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'game'
              ? 'bg-rose-300 text-gray-950'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          id="tab-btn-garden-game"
        >
          🎮 PLAY GARDEN GAME
        </button>
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('worksheet');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'worksheet'
              ? 'bg-purple-400 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          id="tab-btn-garden-worksheet"
        >
          📝 PRINT COUNTING WORKSHEET
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'game' ? (
          // INTERACTIVE COUNTING GARDEN GAME
          <motion.div
            key="game-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center print:hidden"
          >
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
                            duration: 2.5 + (idx * 0.2),
                          }}
                        >
                          <span className="text-2xl filter drop-shadow-sm select-none">{theme.seedEmoji}</span>
                          <div className="absolute inset-0 border-2 border-black rounded-full animate-ping opacity-25" />
                        </motion.div>
                      ) : (
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

              {/* Victory Overlay inside game board */}
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
          </motion.div>
        ) : (
          // WORK SHEET GENERATOR LAB (PRINTABLE)
          <motion.div
            key="worksheet-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center"
          >
            {/* Control Panel (Hidden in print) */}
            <div className="w-full bg-purple-100 border-4 border-black p-6 sm:p-8 rounded-[36px] mb-8 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:hidden">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-purple-950" />
                <h2 className="text-xl font-black uppercase tracking-tight text-purple-950">
                  COUNTING GARDEN WORKSHEET LAB
                </h2>
              </div>
              <p className="text-xs font-bold text-purple-900/80 -mt-3">
                Generate highly interactive and beautiful counting worksheets for preschool or kindergarten students. Pick standard themes, counting styles, and export as paper PDFs!
              </p>

              {/* Custom controls grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t-2 border-purple-200">
                {/* 1. Worksheet Layout */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Worksheet Style</span>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'count_and_write', name: '✏️ Count & Write' },
                      { id: 'color_to_match', name: '🎨 Color to Match' },
                      { id: 'count_trace', name: '✍️ Count & Trace' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsType(t.id);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
                          wsType === t.id
                            ? 'bg-purple-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t.name}</span>
                        {wsType === t.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Problem Count */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Number of Problems</span>
                  <div className="flex flex-col gap-2">
                    {([4, 6] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          audioManager.playPop();
                          setWsProblemCount(n);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
                          wsProblemCount === n
                            ? 'bg-purple-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>📄 {n} Problems ({n === 4 ? 'Spacious' : 'Full Page'})</span>
                        {wsProblemCount === n && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Academy & Mascot Theme */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">School Mascot Theme</span>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'garden', name: '🌸 Garden Academy' },
                      { id: 'meadow', name: '🦋 Meadow Explorers' },
                      { id: 'fairy', name: '✨ Fairy Forest' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsMascotTheme(t.id);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
                          wsMascotTheme === t.id
                            ? 'bg-purple-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t.name}</span>
                        {wsMascotTheme === t.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Classroom / Teacher Options */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Teacher Options</span>
                  <label className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border-2 border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none hover:bg-gray-50 transition-all">
                    <input
                      type="checkbox"
                      checked={wsShowAnswers}
                      onChange={(e) => {
                        audioManager.playPop();
                        setWsShowAnswers(e.target.checked);
                      }}
                      className="w-4 h-4 accent-purple-600 rounded border-gray-300"
                    />
                    <span className="text-xs font-bold text-gray-700 uppercase">Show Answer Key</span>
                  </label>

                  <button
                    onClick={() => {
                      audioManager.playPop();
                      handleGeneratePrintWorksheet();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full bg-amber-300 hover:bg-amber-400 text-black border-2 border-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
                    Randomize Sheet
                  </button>
                </div>
              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 border-t-2 border-purple-200 pt-6">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white border-4 border-black font-black uppercase rounded-2xl text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 stroke-[3]" />
                  PRINT / DOWNLOAD PDF
                </button>
              </div>
            </div>

            {/* LIVE PAPER PREVIEW CONTAINER */}
            <div className="w-full flex justify-center print:w-full print:m-0 print:p-0">
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body, html, #app-root, main {
                    background: white !important;
                    background-color: white !important;
                    color: black !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  .print-avoid-break {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .print-break-before {
                    break-before: page !important;
                    page-break-before: always !important;
                  }
                }
              `}} />

              <div className="bg-white border-4 border-black p-8 sm:p-12 rounded-[44px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-[800px] font-sans relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:bg-white text-black">
                {/* Lined notebook paper side margin lines */}
                <div className="absolute top-0 bottom-0 left-10 w-1 bg-red-400 opacity-20 pointer-events-none print:hidden" />

                {/* 1. Header of the printed worksheet */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b-4 border-black pb-6 mb-8 print:flex-row print:justify-between print:pb-2 print:mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 print:w-10 print:h-10 print:rounded-lg ${mascot.bg}`}>
                      <span className="text-2xl print:text-xl">{mascot.emoji}</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 leading-none">{mascot.label}</span>
                      <h1 className="text-2xl font-black tracking-tight uppercase mt-0.5 leading-none print:text-lg">{mascot.title}</h1>
                    </div>
                  </div>

                  {/* Name and Date fields */}
                  <div className="flex flex-col gap-2 text-xs font-bold font-mono tracking-wide text-gray-700 w-full sm:w-auto print:w-auto print:gap-1">
                    <div className="flex items-center gap-1.5 font-sans">
                      <span>NAME:</span>
                      <div className="flex-grow sm:w-44 border-b-2 border-dotted border-black/30 h-4 print:w-36" />
                    </div>
                    <div className="flex items-center gap-1.5 font-sans">
                      <span>DATE:</span>
                      <div className="flex-grow sm:w-44 border-b-2 border-dotted border-black/30 h-4 print:w-36" />
                    </div>
                  </div>
                </div>

                {/* Assignment Instructions banner */}
                <div className="flex justify-between items-center bg-purple-50/50 border-2 border-dashed border-black/20 p-4 rounded-2xl mb-8 print:bg-white print:border-black/30 print:py-2 print:px-3 print:mb-3 print:rounded-xl">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-purple-600 leading-none">Assignment Instructions</p>
                    <p className="text-xs sm:text-sm font-black text-black mt-1 leading-tight">
                      {getWorksheetInstructions()}
                    </p>
                  </div>
                  <div className="border-l-2 border-dashed border-black/20 pl-4 text-center print:border-black/30 flex-shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">SCORE</span>
                    <div className="text-sm font-black text-black mt-0.5 font-mono">
                      ______ / {wsProblemCount}
                    </div>
                  </div>
                </div>

                {/* Problems Layout Grid */}
                <div className={`grid gap-6 print:gap-x-4 print:gap-y-3 ${
                  wsProblemCount === 4
                    ? 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
                }`}>
                  {wsProblems.map((prob, idx) => (
                    <div
                      key={prob.id + '-' + idx}
                      className="print-avoid-break flex flex-col items-center justify-between p-5 border-2 border-solid border-gray-200 rounded-2xl relative bg-white min-h-[190px] print:min-h-[130px] print:py-3 print:px-2 print:rounded-xl print:border-black/30"
                    >
                      {/* Problem tag number */}
                      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 print:text-black font-mono">
                        {idx + 1}.
                      </span>

                      {/* Display problem inside box according to chosen style */}
                      {wsType === 'count_and_write' && (
                        <div className="flex flex-col items-center justify-between h-full w-full">
                          {/* Garden bed displaying items */}
                          <div className="w-full flex-grow flex flex-wrap items-center justify-center gap-1.5 p-3 bg-emerald-50/15 border-2 border-black rounded-2xl min-h-[90px] print:min-h-[65px] print:p-1.5">
                            {Array.from({ length: prob.targetCount }).map((_, i) => (
                              <span key={i} className="text-2xl print:text-xl filter drop-shadow select-none animate-wiggle">
                                {prob.emoji}
                              </span>
                            ))}
                          </div>

                          {/* Flowerpot writing answer circle */}
                          <div className="flex items-center justify-center gap-2 mt-3 print:mt-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 font-sans">TOTAL:</span>
                            <div className="w-10 h-10 print:w-8 print:h-8 rounded-full border-3 border-dashed border-black/30 flex items-center justify-center font-mono text-base font-black bg-white">
                              {wsShowAnswers ? (
                                <span className="text-blue-600 font-black font-mono">{prob.targetCount}</span>
                              ) : (
                                <span className="text-transparent">?</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {wsType === 'color_to_match' && (
                        <div className="flex flex-col items-center justify-between h-full w-full">
                          {/* Target goal indicator bubble */}
                          <div className="flex items-center gap-1.5 mb-2.5 print:mb-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase">COLOR EXACTLY:</span>
                            <span className="w-8 h-8 rounded-full bg-yellow-200 text-black border-2 border-black font-mono font-black text-xs flex items-center justify-center">
                              {prob.targetCount}
                            </span>
                          </div>

                          {/* Garden bed containing total candidates */}
                          <div className="w-full flex-grow flex flex-wrap items-center justify-center gap-2 p-3 bg-teal-50/10 border-2 border-dashed border-gray-300 rounded-xl min-h-[70px] print:p-1.5">
                            {Array.from({ length: prob.totalCount }).map((_, i) => {
                              // Highlight correct answers in teacher mode
                              const isHighlightedAnswer = wsShowAnswers && i < prob.targetCount;
                              return (
                                <span
                                  key={i}
                                  className={`text-2xl print:text-xl transition-all ${
                                    isHighlightedAnswer
                                      ? 'bg-blue-100 border-2 border-blue-400 p-0.5 rounded-lg filter drop-shadow-md'
                                      : 'grayscale opacity-35 border-2 border-transparent p-0.5'
                                  }`}
                                >
                                  {prob.emoji}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {wsType === 'count_trace' && (
                        <div className="flex flex-col items-center justify-between h-full w-full">
                          {/* Items bed */}
                          <div className="w-full flex-grow flex flex-wrap items-center justify-center gap-1 p-2 bg-amber-50/10 border-2 border-black rounded-xl min-h-[65px] print:p-1">
                            {Array.from({ length: prob.targetCount }).map((_, i) => (
                              <span key={i} className="text-2xl print:text-lg filter drop-shadow select-none">
                                {prob.emoji}
                              </span>
                            ))}
                          </div>

                          {/* Tracing numbers */}
                          <div className="mt-3 print:mt-1.5 flex flex-col items-center gap-1 w-full">
                            <span className="text-[9px] font-black text-gray-400 uppercase">COUNT & TRACE:</span>
                            <div className="flex gap-1.5 justify-center">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 print:w-7 print:h-7 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center font-mono text-sm font-black text-gray-300 bg-gray-50/20 select-none print:border-black/20"
                                >
                                  {wsShowAnswers ? (
                                    <span className="text-blue-600 font-mono font-black">{prob.targetCount}</span>
                                  ) : (
                                    <span className="font-mono font-black opacity-30">{prob.targetCount}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Assignment footer motivation */}
                <div className="mt-12 text-center text-xs font-extrabold text-purple-600/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "Wonderful work! You are an amazing Garden Mathematician!" 🌟
                </div>

                {/* TEACHER ANSWER KEY PAGE (PAGE 2) */}
                {wsShowAnswers && (
                  <div className="print-break-before mt-16 pt-12 border-t-4 border-dashed border-purple-300 relative print:border-none print:mt-0 print:pt-0">
                    {/* Page Break decorative ribbon (hidden in print) */}
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-purple-200 border-2 border-black px-4 py-1 rounded-full text-[9px] font-black text-purple-950 uppercase tracking-widest print:hidden">
                      ✂️ ANSWER KEY (PAGE 2)
                    </div>

                    <div className="text-center mb-8 print:mb-2">
                      <div className="inline-block bg-purple-100 border-2 border-black p-2 rounded-xl mb-2 print:hidden">
                        <FileText className="w-5 h-5 text-purple-950" />
                      </div>
                      <h2 className="text-xl font-black uppercase text-purple-950 print:text-base print:text-black">Teacher Answer Key</h2>
                      <p className="text-xs font-bold text-gray-500">
                        Worksheet correction sheet with complete target count keys
                      </p>
                    </div>

                    <div className={`grid gap-6 print:gap-x-4 print:gap-y-3 ${
                      wsProblemCount === 4
                        ? 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
                    }`}>
                      {wsProblems.map((prob, idx) => (
                        <div
                          key={`key-ans-${prob.id}-${idx}`}
                          className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-purple-200 rounded-2xl relative bg-purple-50/10 min-h-[100px] print:min-h-[60px] print:p-2 print:rounded-xl print:border-black/30 print:bg-white"
                        >
                          <span className="absolute top-2 left-2 text-[10px] font-black text-purple-500 print:text-black font-mono">
                            {idx + 1}.
                          </span>

                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-3xl print:text-2xl select-none">
                              {prob.emoji}
                            </span>
                            <div className="flex flex-col items-start leading-none">
                              <span className="text-[10px] font-black text-gray-400 font-sans uppercase">{prob.name}</span>
                              <span className="text-lg font-black font-mono text-purple-600 mt-0.5">
                                ANSWER: {prob.targetCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
