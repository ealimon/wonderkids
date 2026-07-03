import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SorterItem, SorterBucket } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { ArrowRight, RotateCcw, Star, FileText, Check, RefreshCw, Printer, Scissors } from 'lucide-react';

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

interface ColorProblem {
  id: string;
  emoji: string;
  name: string;
  color: 'red' | 'blue' | 'green' | 'yellow';
}

export default function ColorSorter({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [activeTab, setActiveTab] = useState<'game' | 'worksheet'>('game');

  // Interactive Game States
  const [items, setItems] = useState<SorterItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SorterItem | null>(null);
  const [solvedItems, setSolvedItems] = useState<{ [key: string]: string }>({}); // itemId -> bucketColor
  const [selectedItem, setSelectedItem] = useState<SorterItem | null>(null);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Printable Worksheet Lab States
  const [wsShowAnswers, setWsShowAnswers] = useState(false);
  const [wsProblemCount, setWsProblemCount] = useState<number>(6); // 4, 6, 8
  const [wsMascotTheme, setWsMascotTheme] = useState<'garden' | 'meadow' | 'fairy'>('garden');
  const [wsType, setWsType] = useState<'match_line' | 'circle_color' | 'cut_and_paste'>('match_line');
  const [wsProblems, setWsProblems] = useState<ColorProblem[]>([]);

  // Initialize and shuffle items
  useEffect(() => {
    restartGame();
  }, []);

  useEffect(() => {
    handleGeneratePrintWorksheet();
  }, [wsProblemCount, wsType]);

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

  const handleGeneratePrintWorksheet = () => {
    const generated: ColorProblem[] = [];
    // Shuffle all INITIAL_ITEMS to create randomized problems
    const pool = [...INITIAL_ITEMS].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < wsProblemCount; i++) {
      const itemTemplate = pool[i % pool.length];
      generated.push({
        id: `color-problem-${i}-${Date.now()}`,
        emoji: itemTemplate.emoji,
        name: itemTemplate.name,
        color: itemTemplate.color as 'red' | 'blue' | 'green' | 'yellow',
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
          emoji: '🌈',
          label: 'RAINBOW MEADOW CLUB',
          title: 'RAINBOW COLOR ADVENTURE',
          bg: 'bg-teal-300 text-black',
        };
      case 'fairy':
        return {
          emoji: '🖌️',
          label: 'FAIRY PAINTBOX SCHOOL',
          title: 'ENCHANTED COLOR SORTING',
          bg: 'bg-amber-300 text-black',
        };
      case 'garden':
      default:
        return {
          emoji: '🎨',
          label: 'COLOR ACADEMY LAB',
          title: 'MAGIC COLOR MATCHING',
          bg: 'bg-emerald-300 text-black',
        };
    }
  };

  const getWorksheetInstructions = () => {
    switch (wsType) {
      case 'circle_color':
        return 'Look at the colorful picture in each box, read its name, and color in the matching color circle below!';
      case 'cut_and_paste':
        return 'Carefully cut out the colorful cards in the cutting zone at the top, and paste them into their matching color baskets below!';
      case 'match_line':
      default:
        return 'Draw a straight path or matching line connecting each cute item on the left to its matching color basket on the right!';
    }
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

  const mascot = getMascotDetails();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none text-black animate-fadeIn" id="color-sorter-root">
      
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
          id="tab-btn-sorter-game"
        >
          🎮 PLAY COLOR SORTER
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
          id="tab-btn-sorter-worksheet"
        >
          📝 PRINT COLOR WORKSHEET
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'game' ? (
          // INTERACTIVE COLOR SORTER GAME
          <motion.div
            key="game-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center print:hidden animate-fadeIn"
          >
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
          </motion.div>
        ) : (
          // WORKSHEET GENERATOR LAB (PRINTABLE)
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
                  COLOR SORTER WORKSHEET LAB
                </h2>
              </div>
              <p className="text-xs font-bold text-purple-900/80 -mt-3 font-sans">
                Create beautiful, highly customized color matching and sorting worksheets. Shuffle categories, switch layouts, toggle helper guides, and export instantly to a physical paper template or PDF!
              </p>

              {/* Custom controls grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t-2 border-purple-200">
                {/* 1. Worksheet Layout */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950 font-sans">Worksheet Style</span>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'match_line', name: '✏️ Draw matching line' },
                      { id: 'circle_color', name: '⭕ Circle color bubble' },
                      { id: 'cut_and_paste', name: '✂️ Cut & paste sort' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsType(t.id);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
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
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950 font-sans">Number of Items</span>
                  <div className="flex flex-col gap-2">
                    {([4, 6, 8] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          audioManager.playPop();
                          setWsProblemCount(n);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                          wsProblemCount === n
                            ? 'bg-purple-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>📄 {n} Items ({n === 4 ? 'Spacious' : 'Full Page'})</span>
                        {wsProblemCount === n && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Academy & Mascot Theme */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950 font-sans">School Mascot Theme</span>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'garden', name: '🌸 Color Academy' },
                      { id: 'meadow', name: '🦋 Rainbow Meadow' },
                      { id: 'fairy', name: '✨ Fairy Paintbox' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsMascotTheme(t.id);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
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
                <div className="flex flex-col gap-3 font-sans">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Teacher Options</span>
                  <label className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border-2 border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none hover:bg-gray-50 transition-all">
                    <input
                      type="checkbox"
                      checked={wsShowAnswers}
                      onChange={(e) => {
                        audioManager.playPop();
                        setWsShowAnswers(e.target.checked);
                      }}
                      className="w-4 h-4 accent-purple-600 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-[11px] font-black text-gray-700 uppercase">Show Answer Key</span>
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
            <div className="w-full flex justify-center print:w-full print:m-0 print:p-0 font-sans">
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

              <div className="bg-white border-4 border-black p-8 sm:p-12 rounded-[44px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-[800px] relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:bg-white text-black">
                {/* Notebook margin line (hidden in print) */}
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
                <div className="flex justify-between items-center bg-purple-50/50 border-2 border-dashed border-black/20 p-4 rounded-2xl mb-8 print:bg-white print:border-black/30 print:py-2 print:px-3 print:mb-3 print:rounded-xl text-left">
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

                {/* Problems Layout according to chosen style */}
                {wsType === 'match_line' && (
                  <div className="grid grid-cols-2 gap-12 mt-4 print:gap-x-12 print:gap-y-4">
                    {/* Left Column: Items */}
                    <div className="flex flex-col gap-5 justify-around">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 leading-none text-left print:hidden">🌈 ITEMS TO MATCH</span>
                      {wsProblems.map((prob, idx) => (
                        <div
                          key={`match-item-${prob.id}-${idx}`}
                          className="print-avoid-break flex items-center justify-between border-2 border-gray-300 p-4 rounded-2xl bg-white min-h-[64px] print:min-h-[50px] print:p-2.5 print:rounded-xl print:border-black/30 relative"
                        >
                          <span className="absolute top-1 left-1.5 text-[9px] font-black text-gray-300 print:text-black/30 font-mono">
                            {idx + 1}.
                          </span>
                          <div className="flex items-center gap-3 ml-3">
                            <span className="text-3xl print:text-2xl filter drop-shadow select-none">{prob.emoji}</span>
                            <span className="text-xs font-black uppercase tracking-wide text-gray-800">{prob.name}</span>
                          </div>
                          
                          {/* Anchor Connector Dot */}
                          <div className="w-4 h-4 rounded-full border-3 border-black bg-purple-150 flex-shrink-0 -mr-6 z-10 bg-white" />
                        </div>
                      ))}
                    </div>

                    {/* Right Column: Colorful Buckets */}
                    <div className="flex flex-col gap-5 justify-around">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 leading-none text-left print:hidden">🧺 BASKET COLOR</span>
                      {COLOR_BUCKETS.map((bucket, idx) => (
                        <div
                          key={`match-basket-${bucket.color}-${idx}`}
                          className={`print-avoid-break flex items-center justify-start gap-4 border-2 border-black p-4 rounded-2xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] min-h-[64px] print:min-h-[50px] print:p-2.5 print:rounded-xl print:shadow-none relative`}
                        >
                          {/* Anchor Connector Dot */}
                          <div className="w-4 h-4 rounded-full border-3 border-black bg-purple-150 flex-shrink-0 -ml-6 z-10 bg-white" />
                          
                          <span className="text-2xl print:text-xl filter drop-shadow select-none">{bucket.emoji}</span>
                          <span className="text-xs font-black uppercase tracking-wider text-gray-800 font-mono">
                            {bucket.color} Basket
                          </span>

                          {/* Show matching guide lines for helper/answers */}
                          {wsShowAnswers && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end">
                              {wsProblems.map((p, pIdx) => {
                                if (p.color === bucket.color) {
                                  return (
                                    <span key={pIdx} className="text-[8px] font-black bg-blue-100 border border-blue-400 text-blue-800 px-1.5 py-0.5 rounded-full mt-0.5">
                                      {pIdx + 1} ({p.emoji})
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {wsType === 'circle_color' && (
                  <div className={`grid gap-5 print:gap-x-4 print:gap-y-3 ${
                    wsProblemCount === 4
                      ? 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2'
                      : 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
                  }`}>
                    {wsProblems.map((prob, idx) => (
                      <div
                        key={`circle-item-${prob.id}-${idx}`}
                        className="print-avoid-break flex flex-col items-center justify-between p-4 border-2 border-gray-200 rounded-2xl bg-white relative print:py-3 print:px-2 print:rounded-xl print:border-black/30"
                      >
                        {/* Number bullet tag */}
                        <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 print:text-black font-mono">
                          {idx + 1}.
                        </span>

                        <div className="flex flex-col items-center gap-1.5 mt-1">
                          <span className="text-4xl print:text-3xl select-none filter drop-shadow">{prob.emoji}</span>
                          <span className="text-xs font-extrabold uppercase tracking-wide text-black">{prob.name}</span>
                        </div>

                        {/* Multiple choices color bubbles */}
                        <div className="grid grid-cols-2 gap-1.5 w-full mt-4 border-t border-dashed border-gray-100 pt-3">
                          {COLOR_BUCKETS.map((bucket) => {
                            const isCorrect = bucket.color === prob.color;
                            return (
                              <div
                                key={bucket.color}
                                className={`py-1.5 px-2 rounded-xl border border-solid border-gray-300 text-[10px] font-black text-center uppercase tracking-wider font-mono flex items-center justify-center gap-0.5 ${
                                  wsShowAnswers && isCorrect
                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-gray-500'
                                }`}
                              >
                                <span>{bucket.color}</span>
                                {wsShowAnswers && isCorrect && <Check className="w-3 h-3 text-blue-600 stroke-[4]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {wsType === 'cut_and_paste' && (
                  <div className="flex flex-col gap-8">
                    {/* Top scissors cut-out zone */}
                    <div className="border-4 border-dashed border-purple-300 p-6 rounded-3xl bg-purple-50/10 relative print:border-black print:p-4">
                      {/* Ribbon banner */}
                      <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-purple-400 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border-2 border-black print:bg-white print:text-black">
                        <Scissors className="w-3.5 h-3.5 stroke-[3]" />
                        CUTTING ZONE
                      </span>

                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 print:gap-x-3 print:gap-y-2 mt-2">
                        {wsProblems.map((prob, idx) => (
                          <div
                            key={`cut-item-${prob.id}-${idx}`}
                            className="print-avoid-break border-2 border-dashed border-gray-400 p-2.5 rounded-xl bg-white flex flex-col items-center justify-center aspect-square relative print:border-black/50"
                          >
                            <span className="text-3xl print:text-2xl filter drop-shadow select-none">{prob.emoji}</span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide mt-1 leading-none font-sans">{prob.name}</span>
                            {wsShowAnswers && (
                              <span className="absolute bottom-1 right-1 text-[7px] font-black bg-blue-100 text-blue-800 px-1 rounded-full leading-none uppercase font-mono">
                                {prob.color}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom paste baskets beds */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 leading-none text-left print:text-black">📋 PASTING ZONE (PASTE CARDS IN THE CORRECT CONTAINER)</span>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2 print:gap-3">
                        {COLOR_BUCKETS.map((bucket, idx) => (
                          <div
                            key={`paste-zone-${bucket.color}-${idx}`}
                            className="print-avoid-break border-3 border-dotted border-black/40 p-4 rounded-2xl bg-gray-50/10 min-h-[120px] print:min-h-[100px] flex flex-col justify-start items-center relative print:border-black/50"
                          >
                            {/* Basket title label */}
                            <div className="flex items-center gap-1.5 bg-white border border-black/45 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider leading-none -mt-7 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                              <span>{bucket.emoji}</span>
                              <span className="font-mono text-[10px]">{bucket.color} CONTAINER</span>
                            </div>

                            {/* Anchor pasting space placeholder text */}
                            <div className="flex-grow flex items-center justify-center py-6">
                              <span className="text-[10px] font-black tracking-widest uppercase text-gray-300 font-mono italic select-none">
                                PASTE {bucket.color} CARDS HERE
                              </span>
                            </div>

                            {/* Show teacher correct answer keys inside containers */}
                            {wsShowAnswers && (
                              <div className="absolute inset-x-2 bottom-2 flex flex-wrap gap-1 items-center justify-center border-t border-dashed border-purple-200 pt-2 bg-purple-50/20 rounded-lg">
                                {wsProblems.filter(p => p.color === bucket.color).map((p, pIdx) => (
                                  <span key={pIdx} className="text-xs bg-blue-100 border border-blue-400 text-blue-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                    <span>{p.emoji}</span>
                                    <span className="text-[8px] font-black">{p.name}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment footer motivation */}
                <div className="mt-12 text-center text-xs font-extrabold text-purple-600/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "Wonderful work! You are an amazing Color Master!" 🌟
                </div>

                {/* TEACHER ANSWER KEY PAGE (PAGE 2) */}
                {wsShowAnswers && (
                  <div className="print-break-before mt-16 pt-12 border-t-4 border-dashed border-purple-300 relative print:border-none print:mt-0 print:pt-0 font-sans">
                    {/* Page Break decorative ribbon (hidden in print) */}
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-purple-200 border-2 border-black px-4 py-1 rounded-full text-[9px] font-black text-purple-950 uppercase tracking-widest print:hidden">
                      ✂️ ANSWER KEY (PAGE 2)
                    </div>

                    <div className="text-center mb-8 print:mb-2 text-left">
                      <div className="inline-block bg-purple-100 border-2 border-black p-2 rounded-xl mb-2 print:hidden">
                        <FileText className="w-5 h-5 text-purple-950" />
                      </div>
                      <h2 className="text-xl font-black uppercase text-purple-950 print:text-base print:text-black leading-none">Teacher Answer Key</h2>
                      <p className="text-xs font-bold text-gray-500 mt-1 font-sans">
                        Worksheet correction sheet with complete target category assignments
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:gap-x-3 print:gap-y-2">
                      {wsProblems.map((prob, idx) => (
                        <div
                          key={`key-ans-item-${prob.id}-${idx}`}
                          className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-purple-200 rounded-2xl relative bg-purple-50/10 min-h-[100px] print:min-h-[70px] print:p-2 print:rounded-xl print:border-black/30 print:bg-white"
                        >
                          <span className="absolute top-2 left-2 text-[10px] font-black text-purple-500 print:text-black font-mono">
                            {idx + 1}.
                          </span>

                          <div className="flex flex-col items-center gap-1.5 mt-1 text-center">
                            <span className="text-3xl print:text-2xl select-none filter drop-shadow">
                              {prob.emoji}
                            </span>
                            <div className="flex flex-col items-center leading-none">
                              <span className="text-[10px] font-black text-gray-400 font-sans uppercase">{prob.name}</span>
                              <span className="text-xs font-black font-mono text-purple-600 mt-1.5 uppercase bg-purple-100/50 px-2 py-0.5 rounded-full">
                                {prob.color}
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
