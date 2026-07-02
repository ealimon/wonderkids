import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatternItem, PatternQuestion } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { RotateCcw, Star, CheckCircle, ArrowRight } from 'lucide-react';

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

export default function PatternCompleter({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [rounds, setRounds] = useState<PatternQuestion[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [wrongOptionIdx, setWrongOptionIdx] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    // Select 3 random presets from the list of patterns
    const presets = PATTERN_PRESETS();
    const shuffled = presets.sort(() => Math.random() - 0.5).slice(0, 3);
    setRounds(shuffled);
    setCurrentRoundIdx(0);
    setSelectedOptionIdx(null);
    setAnsweredCorrectly(null);
    setWrongOptionIdx(null);
    setGameComplete(false);
    setScore(0);
  };

  const handleSelectOption = (optionIdx: number) => {
    if (answeredCorrectly !== null || gameComplete) return;

    const round = rounds[currentRoundIdx];
    if (optionIdx === round.correctIndex) {
      // Correct!
      audioManager.playCorrect();
      setAnsweredCorrectly(true);
      setSelectedOptionIdx(optionIdx);
      setScore((prev) => prev + 1);

      // If last round
      if (currentRoundIdx === rounds.length - 1) {
        setGameComplete(true);
        audioManager.playGameComplete();
        onGameWin(3); // reward 3 stars!
      }
    } else {
      // Incorrect!
      audioManager.playIncorrect();
      setAnsweredCorrectly(false);
      setWrongOptionIdx(optionIdx);
      // Let them retry! Reset wrong selection after a shake animation
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

  const activeRound = rounds[currentRoundIdx];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black" id="pattern-completer-game">
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
            Look closely at the pattern, then tap the bubble below that fits into the question mark!
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
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-20 h-20 rounded-2xl border-4 border-dashed border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0 cursor-pointer"
                >
                  <span className="text-3xl font-black text-black font-sans">❓</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Panel: Multiple Choice Options or Next Round Banner */}
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
                  TAP THE MATCHING BUBBLE:
                </span>
                <div className="flex gap-4 justify-center">
                  {activeRound.options.map((option, idx) => {
                    const isWrong = wrongOptionIdx === idx;
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`w-20 h-20 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all ${
                          isWrong
                            ? 'bg-red-400 text-white'
                            : 'bg-white hover:bg-yellow-100'
                        }`}
                        id={`pattern-option-${idx}`}
                      >
                        <span className="text-5xl select-none">{option.emoji}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-10">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 px-6 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          RESTART PATTERNS
        </button>
      </div>
    </div>
  );
}
