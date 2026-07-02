import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { RotateCcw, Star, CheckCircle, ArrowRight, Minus } from 'lucide-react';

interface SubtractionProblem {
  id: number;
  total: number;
  takeAway: number;
  emoji: string;
  itemName: string;
}

const SUBTRACTION_POOL: SubtractionProblem[] = [
  { id: 1, total: 5, takeAway: 2, emoji: '🎈', itemName: 'balloons' },
  { id: 2, total: 4, takeAway: 1, emoji: '🍎', itemName: 'apples' },
  { id: 3, total: 6, takeAway: 3, emoji: '⭐', itemName: 'stars' },
  { id: 4, total: 3, takeAway: 2, emoji: '🍪', itemName: 'cookies' },
  { id: 5, total: 5, takeAway: 4, emoji: '🍓', itemName: 'strawberries' },
  { id: 6, total: 7, takeAway: 2, emoji: '🐠', itemName: 'fishes' },
  { id: 7, total: 4, takeAway: 2, emoji: '🌸', itemName: 'flowers' },
  { id: 8, total: 8, takeAway: 3, emoji: '🦕', itemName: 'dinosaurs' },
  { id: 9, total: 5, takeAway: 3, emoji: '🧸', itemName: 'teddy bears' },
  { id: 10, total: 6, takeAway: 2, emoji: '🍕', itemName: 'pizza slices' },
  { id: 11, total: 3, takeAway: 1, emoji: '🎈', itemName: 'balloons' },
  { id: 12, total: 5, takeAway: 1, emoji: '🍎', itemName: 'apples' },
  { id: 13, total: 7, takeAway: 4, emoji: '⭐', itemName: 'stars' },
  { id: 14, total: 8, takeAway: 4, emoji: '🍪', itemName: 'cookies' },
  { id: 15, total: 9, takeAway: 3, emoji: '🍓', itemName: 'strawberries' },
  { id: 16, total: 6, takeAway: 4, emoji: '🐠', itemName: 'fishes' },
  { id: 17, total: 10, takeAway: 5, emoji: '🌸', itemName: 'flowers' },
  { id: 18, total: 8, takeAway: 2, emoji: '🦕', itemName: 'dinosaurs' },
  { id: 19, total: 4, takeAway: 3, emoji: '🧸', itemName: 'teddy bears' },
  { id: 20, total: 7, takeAway: 3, emoji: '🍕', itemName: 'pizza slices' },
  { id: 21, total: 9, takeAway: 2, emoji: '🎈', itemName: 'balloons' },
  { id: 22, total: 6, takeAway: 5, emoji: '🍎', itemName: 'apples' },
  { id: 23, total: 8, takeAway: 5, emoji: '⭐', itemName: 'stars' },
  { id: 24, total: 10, takeAway: 3, emoji: '🍪', itemName: 'cookies' },
  { id: 25, total: 9, takeAway: 5, emoji: '🍓', itemName: 'strawberries' },
];

export default function MathSubtraction({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [rounds, setRounds] = useState<SubtractionProblem[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    // Select 4 random problems
    const shuffled = [...SUBTRACTION_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
    setRounds(shuffled);
    setCurrentRoundIdx(0);
    setSelectedAnswer(null);
    setWrongAnswer(null);
    setRoundComplete(false);
    setGameComplete(false);
    setScore(0);
    setupRound(shuffled[0]);
  };

  const setupRound = (problem: SubtractionProblem) => {
    const correctAnswer = problem.total - problem.takeAway;
    
    // Generate options: correct answer plus 3 close decoy numbers
    const list = new Set<number>();
    list.add(correctAnswer);

    while (list.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2; // -2 to 2
      const num = correctAnswer + offset;
      if (num >= 0 && num <= 10) {
        list.add(num);
      }
    }

    const optionArray = Array.from(list).sort((a, b) => a - b);
    setOptions(optionArray);
  };

  const handleSelectAnswer = (answer: number) => {
    if (roundComplete || gameComplete) return;

    const activeProblem = rounds[currentRoundIdx];
    const correctAnswer = activeProblem.total - activeProblem.takeAway;

    if (answer === correctAnswer) {
      audioManager.playPop();
      audioManager.playCorrect();
      setSelectedAnswer(answer);
      setRoundComplete(true);
      setScore((prev) => prev + 1);

      if (currentRoundIdx === rounds.length - 1) {
        setGameComplete(true);
        onGameWin(3);
      }
    } else {
      audioManager.playIncorrect();
      setWrongAnswer(answer);
      setTimeout(() => setWrongAnswer(null), 500);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx < rounds.length - 1) {
      const nextIdx = currentRoundIdx + 1;
      setCurrentRoundIdx(nextIdx);
      setSelectedAnswer(null);
      setWrongAnswer(null);
      setRoundComplete(false);
      setupRound(rounds[nextIdx]);
    }
  };

  const activeProblem = rounds[currentRoundIdx];

  if (rounds.length === 0 || !activeProblem) {
    return <div className="text-center py-10 font-bold">Loading Subtraction Sandbox...</div>;
  }

  const correctAnswer = activeProblem.total - activeProblem.takeAway;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black" id="math-subtraction-game">
      <ConfettiEffect active={gameComplete} />

      {/* Progress & Header info */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-teal-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black uppercase tracking-wider">SUBTRACTION LEVELS:</span>
          <div className="flex gap-2">
            {rounds.map((_, idx) => {
              const isSolved = idx < currentRoundIdx || (idx === currentRoundIdx && roundComplete);
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

      {/* Main Interactive Board */}
      <div className="w-full bg-teal-100 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-2 right-2 text-3xl opacity-30 select-none">🎈</div>
        <div className="absolute bottom-2 left-2 text-3xl opacity-30 select-none">✏️</div>

        <div className="text-center mb-6">
          <div className="inline-block bg-teal-300 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3.5 rounded-2xl mb-3 text-2xl">➖</div>
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>SUBTRACTION SAFARI</h2>
          <p className="text-xs font-bold text-gray-700 mt-2">
            Subtract the numbers to find how many are left!
          </p>
        </div>

        {/* Visual Showcase */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-6">
          
          {/* Left Box (Total Number) */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-white border-4 border-black rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative">
              <motion.span
                animate={roundComplete ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
                className="text-6xl font-black text-teal-600 font-mono select-none"
              >
                {activeProblem.total}
              </motion.span>
            </div>
          </div>

          {/* Minus sign */}
          <div className="bg-teal-300 border-3 border-black rounded-full p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Minus className="w-6 h-6 stroke-[4] text-red-500" />
          </div>

          {/* Right Box (Take-away Number) */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-white border-4 border-black rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative">
              <motion.span
                animate={roundComplete ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
                className="text-6xl font-black text-red-500 font-mono select-none"
              >
                {activeProblem.takeAway}
              </motion.span>
            </div>
          </div>

          {/* Equals sign */}
          <div className="text-3xl font-black px-2">=</div>

          {/* Answer Slot */}
          <div className="w-32 h-32 bg-teal-300 border-4 border-black rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {roundComplete ? (
                <motion.div
                  key="answer-display"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1.1, rotate: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl font-black font-mono">
                    {correctAnswer}
                  </span>
                  <span className="text-[10px] font-black uppercase text-teal-950 mt-1">
                    CORRECT!
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="question-mark"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-4xl font-black text-black font-sans"
                >
                  ❓
                </motion.span>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Multiple Choice Options Panel */}
        <div className="border-t-3 border-black/15 pt-6 mt-4 min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {roundComplete ? (
              <motion.div
                key="sub-win-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-2 text-emerald-800 font-black text-lg mb-4">
                  <CheckCircle className="w-6 h-6 fill-white text-black animate-bounce" />
                  YES! {activeProblem.total} MINUS {activeProblem.takeAway} IS EXACTLY {correctAnswer}! SUPER! 🎉
                </div>
                {!gameComplete ? (
                  <button
                    onClick={handleNextRound}
                    className="flex items-center gap-2 px-8 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                  >
                    Next Sum
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-xl text-teal-950 font-black uppercase tracking-widest font-sans">SUBTRACTION MASTER! 👑🦁</span>
                    <span className="text-xs font-bold text-teal-900 mt-2">Amazing subtracting skills! You solved all subtraction levels!</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center w-full" key="sub-options-picker">
                <span className="text-xs font-black uppercase tracking-wider text-teal-950 mb-4 font-sans">
                  TAP THE CORRECT ANSWER BUBBLE:
                </span>
                <div className="flex gap-4 justify-center">
                  {options.map((opt) => {
                    const isWrong = wrongAnswer === opt;
                    return (
                      <motion.button
                        key={opt}
                        onClick={() => handleSelectAnswer(opt)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`w-16 h-16 rounded-full border-4 border-black font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all ${
                          isWrong
                            ? 'bg-red-400 text-white'
                            : 'bg-white hover:bg-yellow-100 text-black'
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Buttons Footer */}
      <div className="mt-10">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 px-6 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          RESTART SUBTRACTION
        </button>
      </div>
    </div>
  );
}
