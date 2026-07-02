import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import {
  RotateCcw,
  Star,
  CheckCircle,
  ArrowRight,
  Plus,
  Printer,
  RefreshCw,
  FileText,
  Check,
  Sparkles
} from 'lucide-react';

interface MathProblem {
  id: number;
  num1: number;
  num2: number;
  emoji: string;
  itemName: string;
}

const PROBLEMS_POOL: MathProblem[] = [
  { id: 1, num1: 2, num2: 3, emoji: '🍎', itemName: 'apples' },
  { id: 2, num1: 1, num2: 4, emoji: '🎈', itemName: 'balloons' },
  { id: 3, num1: 3, num2: 3, emoji: '⭐', itemName: 'stars' },
  { id: 4, num1: 4, num2: 2, emoji: '🍓', itemName: 'strawberries' },
  { id: 5, num1: 2, num2: 2, emoji: '🧸', itemName: 'teddy bears' },
  { id: 6, num1: 5, num2: 1, emoji: '🍕', itemName: 'pizza slices' },
  { id: 7, num1: 3, num2: 2, emoji: '🦕', itemName: 'dinosaurs' },
  { id: 8, num1: 1, num2: 3, emoji: '🍪', itemName: 'cookies' },
  { id: 9, num1: 4, num2: 4, emoji: '🌸', itemName: 'flowers' },
  { id: 10, num1: 6, num2: 2, emoji: '🐠', itemName: 'fishes' },
  { id: 11, num1: 5, num2: 2, emoji: '🍎', itemName: 'apples' },
  { id: 12, num1: 3, num2: 4, emoji: '🎈', itemName: 'balloons' },
  { id: 13, num1: 1, num2: 5, emoji: '⭐', itemName: 'stars' },
  { id: 14, num1: 2, num2: 5, emoji: '🍓', itemName: 'strawberries' },
  { id: 15, num1: 4, num2: 3, emoji: '🧸', itemName: 'teddy bears' },
  { id: 16, num1: 6, num2: 3, emoji: '🍕', itemName: 'pizza slices' },
  { id: 17, num1: 1, num2: 2, emoji: '🦕', itemName: 'dinosaurs' },
  { id: 18, num1: 5, num2: 3, emoji: '🍪', itemName: 'cookies' },
  { id: 19, num1: 2, num2: 1, emoji: '🌸', itemName: 'flowers' },
  { id: 20, num1: 7, num2: 1, emoji: '🐠', itemName: 'fishes' },
  { id: 21, num1: 3, num2: 5, emoji: '🍎', itemName: 'apples' },
  { id: 22, num1: 5, num2: 4, emoji: '🎈', itemName: 'balloons' },
  { id: 23, num1: 2, num2: 6, emoji: '⭐', itemName: 'stars' },
  { id: 24, num1: 4, num2: 1, emoji: '🍓', itemName: 'strawberries' },
  { id: 25, num1: 1, num2: 6, emoji: '🧸', itemName: 'teddy bears' },
];

export default function MathAddition({ onGameWin }: { onGameWin: (stars: number) => void }) {
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState<'game' | 'worksheet'>('game');

  // Interactive Game State
  const [rounds, setRounds] = useState<MathProblem[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  // Worksheet PDF State
  const [wsDifficulty, setWsDifficulty] = useState<'easy' | 'medium' | 'advanced'>('easy');
  const [wsProblemCount, setWsProblemCount] = useState<number>(12);
  const [wsTheme, setWsTheme] = useState<'fruits' | 'animals' | 'stars' | 'classic'>('fruits');
  const [wsShowAnswers, setWsShowAnswers] = useState<boolean>(true);
  const [wsProblems, setWsProblems] = useState<{ id: number; num1: number; num2: number; emoji: string }[]>([]);

  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    const shuffled = [...PROBLEMS_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
    setRounds(shuffled);
    setCurrentRoundIdx(0);
    setSelectedAnswer(null);
    setWrongAnswer(null);
    setRoundComplete(false);
    setGameComplete(false);
    setScore(0);
    setupRound(shuffled[0]);
  };

  const setupRound = (problem: MathProblem) => {
    const correctAnswer = problem.num1 + problem.num2;
    
    const list = new Set<number>();
    list.add(correctAnswer);

    while (list.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const num = correctAnswer + offset;
      if (num > 0 && num <= 12) {
        list.add(num);
      }
    }

    const optionArray = Array.from(list).sort((a, b) => a - b);
    setOptions(optionArray);
  };

  const handleSelectAnswer = (answer: number) => {
    if (roundComplete || gameComplete) return;

    const activeProblem = rounds[currentRoundIdx];
    const correctAnswer = activeProblem.num1 + activeProblem.num2;

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

  const handleGenerateWorksheet = (diff = wsDifficulty, count = wsProblemCount, theme = wsTheme) => {
    const problemsList: { id: number; num1: number; num2: number; emoji: string }[] = [];
    
    const fruitEmojis = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍍', '🍉', '🍒', '🥝', '🍑'];
    const animalEmojis = ['🦖', '🦁', '🐯', '🐼', '🐨', '🦊', '🐰', '🐸', '🐙', '🐠'];
    const starEmojis = ['⭐', '🌙', '✨', '🎈', '🎨', '🔮', '🧩', '🧸', '🦄', '🚀'];
    
    for (let i = 1; i <= count; i++) {
      let num1 = 1;
      let num2 = 1;
      
      if (diff === 'easy') {
        num1 = Math.floor(Math.random() * 8) + 1;
        const maxNum2 = 10 - num1;
        num2 = Math.floor(Math.random() * maxNum2) + 1;
      } else if (diff === 'medium') {
        num1 = Math.floor(Math.random() * 12) + 2;
        const maxNum2 = 20 - num1;
        num2 = Math.floor(Math.random() * Math.min(10, maxNum2)) + 1;
      } else {
        num1 = Math.floor(Math.random() * 65) + 10;
        const maxNum2 = 95 - num1;
        num2 = Math.floor(Math.random() * Math.min(25, maxNum2)) + 5;
      }
      
      let emoji = '';
      if (theme === 'fruits') {
        emoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      } else if (theme === 'animals') {
        emoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
      } else if (theme === 'stars') {
        emoji = starEmojis[Math.floor(Math.random() * starEmojis.length)];
      }
      
      problemsList.push({ id: i, num1, num2, emoji });
    }
    
    setWsProblems(problemsList);
  };

  useEffect(() => {
    handleGenerateWorksheet();
  }, [wsDifficulty, wsProblemCount, wsTheme]);

  const handlePrint = () => {
    audioManager.playPop();
    window.print();
  };

  const activeProblem = rounds[currentRoundIdx];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black" id="math-addition-game">
      
      {/* Neo-brutalist Tab Switcher (Hidden in Print) */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('game');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'game' ? 'bg-emerald-400 text-gray-950' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🎮 PLAY INTERACTIVE GAME
        </button>
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('worksheet');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'worksheet' ? 'bg-purple-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📝 PRINTABLE WORKSHEETS (PDF)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'game' ? (
          <motion.div
            key="game-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center print:hidden"
          >
            <ConfettiEffect active={gameComplete} />

            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-amber-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-wider">CHALLENGES:</span>
                <div className="flex gap-1.5 sm:gap-2">
                  {rounds.map((_, idx) => {
                    const isSolved = idx < currentRoundIdx || (idx === currentRoundIdx && roundComplete);
                    const isCurrent = idx === currentRoundIdx;
                    return (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                          isSolved ? 'bg-emerald-400 text-black' : isCurrent ? 'bg-orange-500 text-white animate-pulse' : 'bg-white text-black'
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
                <span className="font-black font-mono text-xs sm:text-sm">{score} / {rounds.length} SOLVED</span>
              </div>
            </div>

            {rounds.length > 0 && activeProblem ? (
              <div className="w-full bg-amber-100 rounded-[36px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                <div className="absolute top-2 right-2 text-3xl opacity-20 select-none">✏️</div>
                <div className="absolute bottom-2 left-2 text-3xl opacity-20 select-none">📐</div>

                <div className="text-center mb-6">
                  <div className="inline-block bg-yellow-300 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 rounded-2xl mb-3 text-xl">➕</div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">MATH ADVENTURE</h2>
                  <p className="text-xs font-bold text-gray-700 mt-1">Add the two numbers together to find the correct total!</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-6">
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white border-4 border-black rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative">
                      <motion.span
                        animate={roundComplete ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
                        className="text-5xl sm:text-6xl font-black text-amber-500 font-mono select-none"
                      >
                        {activeProblem.num1}
                      </motion.span>
                    </div>
                  </div>

                  <div className="bg-yellow-300 border-3 border-black rounded-full p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Plus className="w-5 h-5 stroke-[4]" />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white border-4 border-black rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative">
                      <motion.span
                        animate={roundComplete ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
                        className="text-5xl sm:text-6xl font-black text-orange-500 font-mono select-none"
                      >
                        {activeProblem.num2}
                      </motion.span>
                    </div>
                  </div>

                  <div className="text-3xl font-black px-2">=</div>

                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-yellow-300 border-4 border-black rounded-[32px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                      {roundComplete ? (
                        <motion.div
                          key="answer-display"
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1.1, rotate: 0 }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-4xl font-black font-mono">
                            {activeProblem.num1 + activeProblem.num2}
                          </span>
                          <span className="text-[10px] font-black uppercase text-amber-950 mt-1">CORRECT!</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="question-mark"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-3xl font-black text-black font-sans"
                        >
                          ❓
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="border-t-3 border-black/15 pt-6 mt-4 min-h-[120px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {roundComplete ? (
                      <motion.div
                        key="win-message"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-sm sm:text-lg mb-4">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-black animate-bounce" />
                          {activeProblem.num1} + {activeProblem.num2} IS EXACTLY {activeProblem.num1 + activeProblem.num2}! WONDERFUL! 🎉
                        </div>
                        {!gameComplete ? (
                          <button
                            onClick={handleNextRound}
                            className="flex items-center gap-2 px-8 py-3.5 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                          >
                            Next Sum
                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                          </button>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-xl text-amber-950 font-black uppercase tracking-widest font-sans">MATH MASTER! 👑🎓</span>
                            <span className="text-xs font-bold text-amber-900 mt-1">Incredible summing skills! You solved all addition levels!</span>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center w-full" key="options-picker">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-950 mb-4 font-sans">TAP THE CORRECT TOTAL SUM BUBBLE:</span>
                        <div className="flex gap-3 sm:gap-4 justify-center">
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
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-black font-black text-xl sm:text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all ${
                                  isWrong ? 'bg-red-400 text-white' : 'bg-white hover:bg-yellow-100 text-black'
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
            ) : (
              <div className="text-center py-10 font-bold">Loading Math Sandbox...</div>
            )}

            <div className="mt-8">
              <button
                onClick={restartGame}
                className="flex items-center gap-2 px-6 py-3.5 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                RESTART MATH
              </button>
            </div>
          </motion.div>
        ) : (
          // PRINTABLE WORKSHEETS GENERATOR
          <motion.div
            key="worksheet-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-8 text-black"
          >
            <div className="w-full bg-purple-100 rounded-[32px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col gap-6 print:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-purple-400 border-2 border-black p-2 rounded-xl text-white">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-purple-950">Worksheet Lab</h3>
                  <p className="text-xs font-bold text-purple-900/70">Customize, generate, and print offline addition sheets instantly!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t-2 border-purple-200 pt-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Difficulty</span>
                  <div className="flex flex-col gap-1.5">
                    {(['easy', 'medium', 'advanced'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => {
                          audioManager.playPop();
                          setWsDifficulty(diff);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs uppercase transition-all flex items-center justify-between ${
                          wsDifficulty === diff ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{diff === 'easy' ? 'Easy (Sums to 10)' : diff === 'medium' ? 'Medium (Sums to 20)' : 'Hard (Sums to 100)'}</span>
                        {wsDifficulty === diff && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Problems Count</span>
                  <div className="flex flex-col gap-1.5">
                    {([12, 20, 24] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          audioManager.playPop();
                          setWsProblemCount(count);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs uppercase transition-all flex items-center justify-between ${
                          wsProblemCount === count ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{count} Sums</span>
                        {wsProblemCount === count && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Mascot Theme</span>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { id: 'fruits', name: '🍎 Fruits' },
                      { id: 'animals', name: '🦖 Animals' },
                      { id: 'stars', name: '⭐ Magical' },
                      { id: 'classic', name: '✏️ Classic math' }
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsTheme(t.id);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
                          wsTheme === t.id ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t.name}</span>
                        {wsTheme === t.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-950 font-sans">Settings</span>
                    <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none">
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
                  </div>

                  <button
                    onClick={() => {
                      audioManager.playPop();
                      handleGenerateWorksheet();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full bg-amber-300 hover:bg-amber-400 text-black border-2 border-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
                    Randomize
                  </button>
                </div>
              </div>

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
                className="bg-white border-4 border-black p-8 sm:p-12 rounded-[44px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-[800px] font-sans relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none"
              >
                {/* 1. Header of the printed worksheet */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b-4 border-black pb-6 mb-8 print:flex-row print:justify-between print:pb-2 print:mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-300 w-12 h-12 rounded-xl flex items-center justify-center border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 print:w-10 print:h-10 print:rounded-lg">
                      <span className="text-2xl print:text-xl">🧸</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 leading-none">WONDERKIDS EDUCATION</span>
                      <h1 className="text-2xl font-black tracking-tight uppercase mt-0.5 leading-none print:text-lg">Addition Sums</h1>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs font-bold font-mono tracking-wide text-gray-700 w-full sm:w-auto print:w-auto print:gap-1">
                    <div className="flex items-center gap-1.5">
                      <span>NAME:</span>
                      <div className="flex-grow sm:w-44 border-b-2 border-dotted border-black/30 h-4 print:w-36" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>DATE:</span>
                      <div className="flex-grow sm:w-44 border-b-2 border-dotted border-black/30 h-4 print:w-36" />
                    </div>
                  </div>
                </div>

                {/* Sub-Header & Grade block */}
                <div className="flex justify-between items-center bg-gray-50 border-2 border-dashed border-black/20 p-4 rounded-2xl mb-8 print:bg-white print:border-black/30 print:py-2 print:px-3 print:mb-3 print:rounded-xl">
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-500">Assignment Topic</p>
                    <p className="text-sm font-black text-black">
                      {wsDifficulty === 'easy' ? 'Level 1: Basic addition with sums up to 10' : wsDifficulty === 'medium' ? 'Level 2: Intermediate sums up to 20' : 'Level 3: Advanced sums up to 100'}
                    </p>
                  </div>
                  <div className="border-l-2 border-dashed border-black/20 pl-4 text-center print:border-black/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">SCORE</span>
                    <div className="text-base font-black text-black mt-0.5">
                      _______ / {wsProblemCount}
                    </div>
                  </div>
                </div>

                {/* Problems Grid */}
                <div className={`grid ${wsProblemCount === 12 ? 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4'} gap-6 print:gap-x-4 print:gap-y-3`}>
                  {wsProblems.map((prob, idx) => (
                    <div
                      key={prob.id}
                      className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-gray-200 rounded-2xl relative bg-white min-h-[140px] print:min-h-[85px] print:py-2 print:px-1 print:rounded-xl print:border-black/30"
                    >
                      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 print:text-black">
                        {idx + 1}.
                      </span>

                      {wsTheme !== 'classic' && prob.emoji && (
                        <span className="absolute top-2 right-2 text-sm select-none print:block">
                          {prob.emoji}
                        </span>
                      )}

                      <div className="flex flex-col items-end pr-3 text-2xl font-black font-mono mt-4 print:mt-0 print:text-xl print:pr-1">
                        <div className="leading-none mb-1">{prob.num1}</div>
                        <div className="flex items-center gap-1 leading-none mb-1.5 print:mb-1">
                          <Plus className="w-4 h-4 stroke-[4] text-black print:w-3.5 print:h-3.5 print:stroke-[3]" />
                          <span>{prob.num2}</span>
                        </div>
                        <div className="w-16 h-1 bg-black rounded print:w-12 print:h-[2px]" />
                      </div>

                      <div className="w-16 h-10 border-2 border-dashed border-gray-300 rounded-xl mt-3.5 bg-gray-50/50 print:bg-white print:border-black/20 print:w-12 print:h-8 print:mt-1.5 print:rounded-lg" />
                    </div>
                  ))}
                </div>

                {/* Optional message for child at the bottom */}
                <div className="mt-12 text-center text-xs font-extrabold text-orange-500/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "Keep counting! You are amazing!" 🌟
                </div>

                {/* ANSWER KEY PAGE */}
                {wsShowAnswers && (
                  <div className="print-break-before mt-16 pt-12 border-t-4 border-dashed border-purple-300 relative print:border-none print:mt-0 print:pt-0">
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-purple-100 border-2 border-black px-4 py-1 rounded-full text-[10px] font-black text-purple-950 uppercase tracking-widest print:hidden">
                      ✂️ ANSWER KEY (PAGE 2)
                    </div>

                    <div className="text-center mb-8">
                      <div className="inline-block bg-purple-100 border-2 border-black p-2 rounded-xl mb-2 print:hidden">
                        <FileText className="w-5 h-5 text-purple-950" />
                      </div>
                      <h2 className="text-xl font-black uppercase text-purple-950 print:text-black">Teacher Answer Key</h2>
                      <p className="text-xs font-bold text-gray-500 font-sans">Worksheet correction sheet with calculated sums</p>
                    </div>

                    <div className={`grid ${wsProblemCount === 12 ? 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4'} gap-6 print:gap-x-4 print:gap-y-3`}>
                      {wsProblems.map((prob, idx) => (
                        <div
                          key={`key-${prob.id}`}
                          className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-purple-200 rounded-2xl relative bg-purple-50/30 min-h-[120px] print:min-h-[80px] print:p-2 print:rounded-xl print:border-black/30 print:bg-white"
                        >
                          <span className="absolute top-2 left-2 text-[10px] font-black text-purple-400 print:text-black">
                            {idx + 1}.
                          </span>

                          <div className="flex flex-col items-end pr-2 text-lg font-bold font-mono mt-2 text-gray-600 print:text-black print:mt-1 print:text-base">
                            <div className="leading-none mb-1">{prob.num1}</div>
                            <div className="flex items-center gap-0.5 leading-none mb-1 print:mb-0.5">
                              <Plus className="w-3.5 h-3.5 stroke-[3] print:w-3 print:h-3" />
                              <span>{prob.num2}</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-300 print:w-10 print:h-[1px]" />
                          </div>

                          <div className="text-xl font-black text-blue-500 mt-2 font-mono tracking-wider print:text-lg print:mt-1 print:text-blue-600">
                            {prob.num1 + prob.num2}
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
