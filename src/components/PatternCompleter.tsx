import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { PatternItem, PatternQuestion } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import {
  RotateCcw,
  Star,
  CheckCircle,
  ArrowRight,
  Printer,
  Sparkles,
  RefreshCw,
  Check,
  FileText
} from 'lucide-react';

const SHAPE_EMOJIS = {
  circle: { red: '🔴', green: '🟢', blue: '🔵', yellow: '🟡' },
  square: { red: '🟥', green: '🟩', blue: '🟦', yellow: '🟨' },
  star: { red: '⭐', green: '⭐', blue: '⭐', yellow: '⭐' },
  heart: { red: '💖', green: '💚', blue: '💙', yellow: '💛' },
};

// Cute preschool items for pattern sequences
const ITEMS: PatternItem[] = [
  { id: 'p1', color: 'red', emoji: '🍎', shape: 'circle' },
  { id: 'p2', color: 'green', emoji: '🐸', shape: 'square' },
  { id: 'p3', color: 'yellow', emoji: '🍌', shape: 'star' },
  { id: 'p4', color: 'blue', emoji: '🐳', shape: 'heart' },
  { id: 'p5', color: 'red', emoji: '🍓', shape: 'circle' },
  { id: 'p6', color: 'green', emoji: '🥦', shape: 'square' },
  { id: 'p7', color: 'yellow', emoji: '☀️', shape: 'star' },
  { id: 'p8', color: 'blue', emoji: '🎈', shape: 'heart' },
  { id: 'p9', color: 'purple', emoji: '🍇', shape: 'heart' },
  { id: 'p10', color: 'pink', emoji: '🌸', shape: 'circle' },
];

// Curate standard pattern questions
const PATTERN_PRESETS = (): PatternQuestion[] => [
  // Pattern 1: AB-AB (Apple, Frog, Apple, Frog, [Apple])
  {
    sequence: [ITEMS[0], ITEMS[1], ITEMS[0], ITEMS[1]], // Apple, Frog, Apple, Frog
    options: [ITEMS[0], ITEMS[1], ITEMS[2]], // Apple, Frog, Banana
    correctIndex: 0, // Apple
    targetIndex: 4,
  },
  // Pattern 2: AB-AB-A (Sun, Balloon, Sun, Balloon, [Sun])
  {
    sequence: [ITEMS[6], ITEMS[7], ITEMS[6], ITEMS[7]], // Sun, Balloon, Sun, Balloon
    options: [ITEMS[3], ITEMS[6], ITEMS[7]], // Whale, Sun, Balloon
    correctIndex: 1, // Sun
    targetIndex: 4,
  },
  // Pattern 3: AAB-AAB (Strawberry, Strawberry, Broccoli, Strawberry, Strawberry, [Broccoli])
  {
    sequence: [ITEMS[4], ITEMS[4], ITEMS[5], ITEMS[4], ITEMS[4]], // Strawberry, Strawberry, Broccoli, Strawberry, Strawberry
    options: [ITEMS[4], ITEMS[5], ITEMS[1]], // Strawberry, Broccoli, Frog
    correctIndex: 1, // Broccoli
    targetIndex: 5,
  },
  // Pattern 4: ABC-ABC (Banana, Flower, Grape, Banana, Flower, [Grape])
  {
    sequence: [ITEMS[2], ITEMS[9], ITEMS[8], ITEMS[2], ITEMS[9]], // Banana, Flower, Grape, Banana, Flower
    options: [ITEMS[2], ITEMS[8], ITEMS[0]], // Banana, Grape, Apple
    correctIndex: 1, // Grape
    targetIndex: 5,
  },
];

const generateRandomPattern = (type: 'AB' | 'AAB' | 'ABC', idPrefix: string): PatternQuestion => {
  const shuffledItems = [...ITEMS].sort(() => Math.random() - 0.5);
  let sequence: PatternItem[] = [];
  let correctItem: PatternItem;
  
  if (type === 'AB') {
    const itemA = shuffledItems[0];
    const itemB = shuffledItems[1];
    sequence = [itemA, itemB, itemA, itemB]; // ABAB... correct is A
    correctItem = itemA;
  } else if (type === 'AAB') {
    const itemA = shuffledItems[0];
    const itemB = shuffledItems[1];
    sequence = [itemA, itemA, itemB, itemA, itemA]; // AABAAB... correct is B
    correctItem = itemB;
  } else { // ABC
    const itemA = shuffledItems[0];
    const itemB = shuffledItems[1];
    const itemC = shuffledItems[2];
    sequence = [itemA, itemB, itemC, itemA, itemB]; // ABCABC... correct is C
    correctItem = itemC;
  }
  
  // Create options
  const otherItems = shuffledItems.filter(x => x.id !== correctItem.id).slice(0, 2);
  const options = [correctItem, ...otherItems].sort(() => Math.random() - 0.5);
  const correctIndex = options.findIndex(x => x.id === correctItem.id);
  
  return {
    sequence,
    options,
    correctIndex,
    targetIndex: sequence.length,
  };
};

export default function PatternCompleter({
  onGameWin,
  onNextGame,
  initialTab = 'game',
}: {
  onGameWin: (stars: number) => void;
  onNextGame?: () => void;
  initialTab?: 'game' | 'worksheet';
}) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'game' | 'worksheet'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Interactive Game States
  const [rounds, setRounds] = useState<PatternQuestion[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [wrongOptionIdx, setWrongOptionIdx] = useState<number | null>(null);
  const [draggedOptionHover, setDraggedOptionHover] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Printable Worksheet Lab States
  const [wsShowAnswers, setWsShowAnswers] = useState(false);
  const [wsProblemCount, setWsProblemCount] = useState<number>(6); // Default 6 as requested!
  const [wsMascotTheme, setWsMascotTheme] = useState<'jungle' | 'polar' | 'farm'>('jungle');
  const [wsType, setWsType] = useState<'next' | 'circle' | 'ab'>('next');
  const [wsProblems, setWsProblems] = useState<PatternQuestion[]>([]);

  useEffect(() => {
    restartGame();
  }, []);

  useEffect(() => {
    handleGeneratePrintWorksheet();
  }, [wsProblemCount]);

  const restartGame = () => {
    const presets = PATTERN_PRESETS();
    const shuffled = presets.sort(() => Math.random() - 0.5).slice(0, 3);
    setRounds(shuffled);
    setCurrentRoundIdx(0);
    setSelectedOptionIdx(null);
    setAnsweredCorrectly(null);
    setWrongOptionIdx(null);
    setDraggedOptionHover(null);
    setGameComplete(false);
    setScore(0);
  };

  const checkIsOverTarget = (
    optionIdx: number,
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const targetEl = document.getElementById('pattern-mystery-target');
    if (!targetEl) return false;

    const tRect = targetEl.getBoundingClientRect();
    const padding = 45;

    let dCenter: { x: number; y: number } | null = null;
    const draggedEl = document.querySelector(`[data-dragged-option="${optionIdx}"]`);
    if (draggedEl) {
      const dRect = draggedEl.getBoundingClientRect();
      if (dRect.width > 0 && dRect.height > 0) {
        dCenter = {
          x: dRect.left + dRect.width / 2,
          y: dRect.top + dRect.height / 2,
        };
      }
    }

    let cx = 0;
    let cy = 0;
    if (event && 'clientX' in event && typeof (event as MouseEvent).clientX === 'number' && (event as MouseEvent).clientX !== 0) {
      cx = (event as MouseEvent).clientX;
      cy = (event as MouseEvent).clientY;
    } else if (event && 'changedTouches' in event && (event as TouchEvent).changedTouches?.length > 0) {
      cx = (event as TouchEvent).changedTouches[0].clientX;
      cy = (event as TouchEvent).changedTouches[0].clientY;
    } else if (event && 'touches' in event && (event as TouchEvent).touches?.length > 0) {
      cx = (event as TouchEvent).touches[0].clientX;
      cy = (event as TouchEvent).touches[0].clientY;
    }

    if (!cx && info?.point) {
      cx = info.point.x - window.scrollX;
      cy = info.point.y - window.scrollY;
    }

    const centerMatch =
      dCenter &&
      dCenter.x >= tRect.left - padding &&
      dCenter.x <= tRect.right + padding &&
      dCenter.y >= tRect.top - padding &&
      dCenter.y <= tRect.bottom + padding;

    const pointerMatch =
      cx > 0 &&
      cx >= tRect.left - padding &&
      cx <= tRect.right + padding &&
      cy >= tRect.top - padding &&
      cy <= tRect.bottom + padding;

    return Boolean(centerMatch || pointerMatch);
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    optionIdx: number
  ) => {
    const isOver = checkIsOverTarget(optionIdx, event, info);
    setDraggedOptionHover(isOver ? optionIdx : null);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    optionIdx: number
  ) => {
    const isOver = checkIsOverTarget(optionIdx, event, info) || draggedOptionHover === optionIdx;
    setDraggedOptionHover(null);
    if (isOver) {
      handleSelectOption(optionIdx);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (answeredCorrectly !== null || gameComplete) return;

    const round = rounds[currentRoundIdx];
    if (optionIdx === round.correctIndex) {
      audioManager.playCorrect();
      setAnsweredCorrectly(true);
      setSelectedOptionIdx(optionIdx);
      setScore((prev) => prev + 1);

      if (currentRoundIdx === rounds.length - 1) {
        setGameComplete(true);
        audioManager.playGameComplete();
        onGameWin(3);
      }
    } else {
      audioManager.playIncorrect();
      setAnsweredCorrectly(false);
      setWrongOptionIdx(optionIdx);
      setTimeout(() => {
        setAnsweredCorrectly(null);
        setWrongOptionIdx(null);
      }, 800);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx < rounds.length - 1) {
      audioManager.playPop();
      setCurrentRoundIdx((prev) => prev + 1);
      setSelectedOptionIdx(null);
      setAnsweredCorrectly(null);
      setWrongOptionIdx(null);
    }
  };

  const handleGeneratePrintWorksheet = () => {
    const patterns: PatternQuestion[] = [];
    const patternTypes: ('AB' | 'AAB' | 'ABC')[] = ['AB', 'AAB', 'ABC'];
    for (let i = 0; i < wsProblemCount; i++) {
      const type = patternTypes[i % patternTypes.length];
      patterns.push(generateRandomPattern(type, `ws-${i}`));
    }
    setWsProblems(patterns);
  };

  const handlePrint = () => {
    audioManager.playPop();
    window.print();
  };

  const getMascotDetails = () => {
    switch (wsMascotTheme) {
      case 'polar':
        return { emoji: '🐻', label: 'POLAR EXPLORERS ACADEMY', title: 'POLAR PATTERN EXPEDITION', bg: 'bg-sky-400 text-white' };
      case 'farm':
        return { emoji: '🐷', label: 'HAPPY FARM SCHOOL', title: 'BARNYARD SEQUENCER', bg: 'bg-orange-400 text-white' };
      case 'jungle':
      default:
        return { emoji: '🦁', label: 'JUNGLE SAFARI CLUB', title: 'LOGIC SAFARI PATTERNS', bg: 'bg-emerald-400 text-white' };
    }
  };

  const getWorksheetInstructions = () => {
    switch (wsType) {
      case 'circle':
        return 'Look closely at each pattern! Draw a circle around the matching option bubble that comes next in the sequence!';
      case 'ab':
        return 'Practice labelling! Write A, B, or C below each item to show the pattern code (for example: A B A B)!';
      case 'next':
      default:
        return 'Look at the train pattern! Draw or write the emoji that completes the sequence inside the empty question mark block!';
    }
  };

  const activeRound = rounds[currentRoundIdx];
  const mascot = getMascotDetails();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none text-black" id="pattern-completer-container">
      
      {/* Tab Switcher (Hidden in Print) */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('game');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'game'
              ? 'bg-purple-300 text-gray-950'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🎮 PLAY PATTERN TRAIN
        </button>
        <button
          onClick={() => {
            audioManager.playPop();
            if (activeTab === 'worksheet') {
              window.print();
            } else {
              setActiveTab('worksheet');
            }
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'worksheet'
              ? 'bg-purple-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📝 PRINT PATTERN WORKSHEET
        </button>
      </div>

      {/* INTERACTIVE GAME VIEW */}
      <div className={`w-full flex-col items-center print:hidden ${activeTab === 'game' ? 'flex' : 'hidden'}`}>
            <ConfettiEffect active={gameComplete} />

            {/* Progress tracking */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-purple-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black uppercase tracking-wider">ROUND PROGRESS:</span>
                <div className="flex gap-2 font-sans">
                  {rounds.map((_, idx) => {
                    const isSolved = idx < currentRoundIdx || (idx === currentRoundIdx && answeredCorrectly === true);
                    const isCurrent = idx === currentRoundIdx;
                    return (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                          isSolved
                            ? 'bg-emerald-400 text-black'
                            : isCurrent
                            ? 'bg-orange-500 text-white animate-pulse'
                            : 'bg-white text-black'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Star className="w-5 h-5 fill-yellow-400 text-black animate-bounce" />
                <span className="font-black font-mono text-sm">{score} / {rounds.length} SOLVED</span>
              </div>
            </div>

            {/* Main Layout Card */}
            <div className="w-full bg-purple-100 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between min-h-[360px]">
              {/* Intro prompt */}
              <div className="text-center mb-6">
                <div className="inline-block bg-yellow-300 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3.5 rounded-2xl mb-3 text-2xl">🧩</div>
                <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>WHAT COMES NEXT?</h2>
                <p className="text-xs font-bold text-gray-700 mt-2">
                  Look closely at the pattern, then drag or tap the bubble below that fits into the question mark!
                </p>
              </div>

              {/* Pattern Train */}
              {activeRound && (
                <div className="flex justify-center items-center gap-4 py-8 overflow-x-auto w-full max-w-full">
                  {activeRound.sequence.map((item, idx) => (
                    <motion.div
                      key={`${item.id}-${idx}`}
                      initial={{ scale: 0.3, y: 15, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                      className="w-20 h-20 rounded-2xl bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center flex-shrink-0"
                    >
                      <span className="text-4xl filter drop-shadow-sm select-none">{item.emoji}</span>
                    </motion.div>
                  ))}

                  {/* Connecting arrow */}
                  <div className="text-black flex-shrink-0">
                    <ArrowRight className="w-6 h-6 stroke-[3]" />
                  </div>

                  {/* Target Mystery Slot */}
                  <AnimatePresence mode="wait">
                    {answeredCorrectly === true && selectedOptionIdx !== null ? (
                      <motion.div
                        key="solved"
                        initial={{ scale: 0.2, rotate: -30 }}
                        animate={{ scale: 1.1, rotate: 0 }}
                        className="w-20 h-20 rounded-2xl border-4 border-black bg-emerald-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0"
                      >
                        <span className="text-4xl select-none animate-bounce">
                          {activeRound.options[selectedOptionIdx].emoji}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mystery"
                        id="pattern-mystery-target"
                        animate={{ scale: draggedOptionHover !== null ? 1.25 : [1, 1.05, 1] }}
                        transition={{ repeat: draggedOptionHover !== null ? 0 : Infinity, duration: 1.5 }}
                        className={`w-20 h-20 rounded-2xl border-4 border-dashed border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                          draggedOptionHover !== null
                            ? 'bg-yellow-300 ring-4 ring-emerald-400 scale-110 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-yellow-300'
                        }`}
                      >
                        <span className="text-3xl font-black text-black font-sans">❓</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Bottom Panel */}
              <div className="border-t-3 border-black/15 pt-6 mt-4 min-h-[100px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {answeredCorrectly === true ? (
                    <motion.div
                      key="next-trigger"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-lg mb-4">
                        <CheckCircle className="w-6 h-6 fill-white text-black" />
                        GREAT LOGIC! THAT MATCHES PERFECTLY!
                      </div>
                      {!gameComplete ? (
                        <button
                          onClick={handleNextRound}
                          className="flex items-center gap-2 px-8 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                        >
                          NEXT PATTERN
                          <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </button>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-xl text-purple-950 font-black uppercase tracking-widest font-sans">VICTORY MASTER!</span>
                          <span className="text-xs font-bold text-purple-900 mt-2">All levels solved! You are a brilliant pattern scientist!</span>
                        </div>
                      )}
                    </motion.div>
                  ) : activeRound ? (
                    <div className="flex flex-col items-center w-full" key="options-panel">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-950 mb-4 font-sans">
                        DRAG OR TAP THE MATCHING BUBBLE:
                      </span>
                      <div className="flex gap-4 justify-center">
                        {activeRound.options.map((option, idx) => {
                          const isWrong = wrongOptionIdx === idx;
                          return (
                            <motion.div
                              key={idx}
                              data-dragged-option={idx}
                              drag
                              dragSnapToOrigin
                              dragElastic={0.15}
                              onDrag={(event, info) => handleDrag(event, info, idx)}
                              onDragEnd={(event, info) => handleDragEnd(event, info, idx)}
                              onClick={() => handleSelectOption(idx)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              whileDrag={{ scale: 1.25, zIndex: 100 }}
                              animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                              transition={{ duration: 0.4 }}
                              className={`w-20 h-20 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none ${
                                isWrong
                                  ? 'bg-red-400 text-white'
                                  : 'bg-white hover:bg-yellow-100'
                              }`}
                              id={`pattern-option-${idx}`}
                            >
                              <span className="text-5xl select-none pointer-events-none">{option.emoji}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {/* Restart Button */}
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={restartGame}
                className="flex items-center gap-2 px-6 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                PLAY AGAIN
              </button>
              {onNextGame && (
                <button
                  onClick={onNextGame}
                  className="flex items-center gap-2 px-6 py-4 bg-sky-400 hover:bg-sky-500 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                >
                  NEXT MODULE
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
      </div>

      {/* PRINTABLE WORKSHEETS GENERATOR */}
      <div className={`w-full flex-col gap-8 text-black ${activeTab === 'worksheet' ? 'flex' : 'hidden print:flex'}`}>
            {/* Options Dashboard Sidebar */}
            <div className="w-full bg-purple-100 rounded-[32px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col gap-6 print:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 border-2 border-black p-2 rounded-xl text-white">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-purple-950">Patterns Worksheet Lab</h3>
                  <p className="text-xs font-bold text-purple-900/70">Configure, randomize, and print pattern-themed kindergarten logic sheets!</p>
                </div>
              </div>

              {/* Grid of Customizers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t-2 border-purple-200 pt-6">
                
                {/* 1. Problem Type */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Worksheet Type</span>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { id: 'next', name: '❓ Draw What\'s Next' },
                      { id: 'circle', name: '⭕ Circle Next Option' },
                      { id: 'ab', name: '🏷️ Pattern Coding (AB)' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsType(t.id);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
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
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Patterns Count</span>
                  <div className="flex flex-col gap-1.5">
                    {([4, 5, 6] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          audioManager.playPop();
                          setWsProblemCount(count);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs uppercase transition-all flex items-center justify-between ${
                          wsProblemCount === count
                            ? 'bg-purple-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{count} Patterns</span>
                        {wsProblemCount === count && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Mascot Theme */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Mascot Theme</span>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { id: 'jungle', name: '🦁 Jungle Logic' },
                      { id: 'polar', name: '🐻 Polar Patterns' },
                      { id: 'farm', name: '🐷 Farm Sequencer' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsMascotTheme(t.id);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
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

                {/* 4. Teacher Options */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Teacher Options</span>
                  <label className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border-2 border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none">
                    <input
                      type="checkbox"
                      checked={wsShowAnswers}
                      onChange={(e) => {
                        audioManager.playPop();
                        setWsShowAnswers(e.target.checked);
                      }}
                      className="w-4 h-4 accent-purple-600 rounded border-gray-300"
                    />
                    <span className="text-xs font-bold text-gray-700 uppercase">Answer Key</span>
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

              {/* Print Button Bar */}
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
              <div
                className="bg-white border-4 border-black p-8 sm:p-12 rounded-[44px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-[800px] font-sans relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:bg-white"
              >
                {/* Lined Notebook Paper Aesthetics */}
                <div className="absolute top-0 bottom-0 left-10 w-1 bg-red-400 opacity-20 pointer-events-none print:hidden" />

                {/* 1. Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b-4 border-black pb-6 mb-8 print:flex-row print:justify-between print:pb-2 print:mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 print:w-10 print:h-10 print:rounded-lg ${mascot.bg}`}>
                      <span className="text-2xl print:text-xl">{mascot.emoji}</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 leading-none">{mascot.label}</span>
                      <h1 className="text-2xl font-black tracking-tight uppercase mt-0.5 leading-none print:text-lg">{mascot.title}</h1>
                    </div>
                  </div>

                  {/* Name and Date Blanks */}
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

                {/* Sub-Header & Instructions */}
                <div className="flex justify-between items-center bg-gray-50 border-2 border-dashed border-black/20 p-4 rounded-2xl mb-8 print:bg-white print:border-black/30 print:py-2 print:px-3 print:mb-3 print:rounded-xl">
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-purple-500 leading-none">Assignment Instructions</p>
                    <p className="text-sm font-black text-black mt-1 leading-tight">
                      {getWorksheetInstructions()}
                    </p>
                  </div>
                  <div className="border-l-2 border-dashed border-black/20 pl-4 text-center print:border-black/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">SCORE</span>
                    <div className="text-base font-black text-black mt-0.5">
                      _______ / {wsProblemCount}
                    </div>
                  </div>
                </div>

                {/* Problems List */}
                <div className="flex flex-col gap-6 print:gap-3">
                  {wsProblems.map((prob, idx) => {
                    const patternTypeString = prob.sequence.length === 4 ? 'AB Pattern' : prob.sequence.length === 5 ? 'AAB Pattern' : 'ABC Pattern';
                    return (
                      <div
                        key={`ws-prob-${idx}`}
                        className="print-avoid-break flex flex-col sm:flex-row items-center justify-between p-4 border-2 border-solid border-gray-200 rounded-2xl bg-white print:py-2 print:px-3 print:rounded-xl print:border-black/30 gap-4"
                      >
                        <div className="flex items-center gap-4 w-full">
                          {/* Index */}
                          <span className="text-sm font-black text-gray-400 print:text-black">
                            {idx + 1}.
                          </span>

                          {/* Pattern Chain */}
                          <div className="flex items-center gap-2 overflow-x-auto">
                            {prob.sequence.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex flex-col items-center">
                                <div className="w-12 h-12 print:w-10 print:h-10 rounded-xl bg-gray-50 border-2 border-black flex items-center justify-center">
                                  <span className="text-2xl print:text-xl select-none">{item.emoji}</span>
                                </div>
                                {wsType === 'ab' && (
                                  <div className="mt-1 w-6 h-6 border-2 border-dotted border-black/30 rounded-md flex items-center justify-center font-bold text-xs">
                                    {/* Empty box for student to fill A or B or C */}
                                  </div>
                                )}
                              </div>
                            ))}

                            <ArrowRight className="w-4 h-4 stroke-[2] text-gray-400" />

                            {/* Blank Mystery Box */}
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 print:w-10 print:h-10 rounded-xl bg-yellow-50 border-2 border-dashed border-black flex items-center justify-center relative">
                                <span className="text-base font-bold text-black/30">❓</span>
                              </div>
                              {wsType === 'ab' && (
                                <div className="mt-1 w-6 h-6 border-2 border-dashed border-black/30 rounded-md" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Multiple Choice Bubble Options on worksheet (for type "circle") */}
                        {wsType === 'circle' && (
                          <div className="flex items-center gap-2 border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-gray-100 pt-3 sm:pt-0 sm:pl-4 print:border-black/30 print:pt-0 print:pl-2">
                            <span className="text-[10px] font-black uppercase text-gray-400 mr-1 print:hidden">Choices:</span>
                            {prob.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className="w-10 h-10 print:w-8 print:h-8 rounded-full border-2 border-black flex items-center justify-center text-lg bg-white"
                              >
                                {opt.emoji}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Signature Message */}
                <div className="mt-12 text-center text-xs font-extrabold text-orange-500/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "Pattern Master Certificate! Super Job!" 🌟
                </div>

                {/* TEACHER ANSWER KEY PAGE */}
                {wsShowAnswers && (
                  <div className="print-break-before mt-16 pt-12 border-t-4 border-dashed border-purple-300 relative print:border-none print:mt-0 print:pt-0">
                    
                    {/* Visual separation label on desktop */}
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-purple-100 border-2 border-black px-4 py-1 rounded-full text-[10px] font-black text-purple-950 uppercase tracking-widest print:hidden">
                      ✂️ ANSWER KEY (PAGE 2)
                    </div>

                    <div className="text-center mb-8">
                      <div className="inline-block bg-purple-100 border-2 border-black p-2 rounded-xl mb-2 print:hidden">
                        <FileText className="w-5 h-5 text-purple-950" />
                      </div>
                      <h2 className="text-xl font-black uppercase text-purple-950 print:text-black">Teacher Answer Key</h2>
                      <p className="text-xs font-bold text-gray-500">
                        Worksheet correction sheet with full sequence answers
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 print:gap-2">
                      {wsProblems.map((prob, idx) => {
                        const correctEmoji = prob.options[prob.correctIndex].emoji;
                        return (
                          <div
                            key={`key-${idx}`}
                            className="print-avoid-break flex flex-col sm:flex-row items-center justify-between p-4 border-2 border-solid border-purple-200 rounded-2xl bg-purple-50/20 print:py-2 print:px-3 print:rounded-xl print:border-black/30 print:bg-white"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-black text-purple-400 print:text-black">
                                {idx + 1}.
                              </span>

                              <div className="flex items-center gap-1.5">
                                {prob.sequence.map((item, itemIdx) => (
                                  <div key={itemIdx} className="w-10 h-10 print:w-8 print:h-8 rounded-lg bg-gray-50 border border-gray-300 flex items-center justify-center text-lg opacity-60">
                                    {item.emoji}
                                  </div>
                                ))}
                                <ArrowRight className="w-3 h-3 text-purple-400" />
                                <div className="w-10 h-10 print:w-8 print:h-8 rounded-lg bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-lg font-black font-mono">
                                  {correctEmoji}
                                </div>
                              </div>
                            </div>

                            <div className="text-right text-xs font-black text-purple-950 print:text-black mt-2 sm:mt-0">
                              <span>NEXT ITEM: </span>
                              <span className="bg-emerald-200 text-emerald-950 border border-emerald-400 px-2 py-1 rounded-md ml-1 text-sm font-bold">
                                {correctEmoji}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>
      </div>
    </div>
  );
}
