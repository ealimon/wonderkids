import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { RotateCcw, Star, CheckCircle, Volume2, HelpCircle, Edit2, Check } from 'lucide-react';

interface WorksheetItem {
  id: number;
  emoji: string;
  correctWord: string;
  wrongWord: string;
  choices: string[]; // e.g. ["pin", "pig"]
  itemName: string;
}

const ALL_WORKSHEET_ITEMS: WorksheetItem[] = [
  { id: 1, emoji: '🐖', correctWord: 'pig', wrongWord: 'pin', choices: ['pin', 'pig'], itemName: 'pig' },
  { id: 2, emoji: '🧹', correctWord: 'mop', wrongWord: 'map', choices: ['map', 'mop'], itemName: 'mop' },
  { id: 3, emoji: '🖊️', correctWord: 'pen', wrongWord: 'pet', choices: ['pen', 'pet'], itemName: 'pen' },
  { id: 4, emoji: '🐕', correctWord: 'wag', wrongWord: 'wet', choices: ['wag', 'wet'], itemName: 'wagging dog' },
  { id: 5, emoji: '🛏️', correctWord: 'bed', wrongWord: 'bet', choices: ['bet', 'bed'], itemName: 'bed' },
  { id: 6, emoji: '🐶', correctWord: 'pug', wrongWord: 'pig', choices: ['pug', 'pig'], itemName: 'pug dog' },
  { id: 7, emoji: '🐔', correctWord: 'hen', wrongWord: 'hut', choices: ['hut', 'hen'], itemName: 'hen' },
  { id: 8, emoji: '🦊', correctWord: 'fox', wrongWord: 'fog', choices: ['fog', 'fox'], itemName: 'fox' },
  { id: 9, emoji: '🛖', correctWord: 'hut', wrongWord: 'hug', choices: ['hut', 'hug'], itemName: 'hut' },
  { id: 10, emoji: '💇', correctWord: 'wig', wrongWord: 'rig', choices: ['wig', 'rig'], itemName: 'wig' },
  { id: 11, emoji: '🍲', correctWord: 'pot', wrongWord: 'pet', choices: ['pot', 'pet'], itemName: 'pot' },
  { id: 12, emoji: '🍑', correctWord: 'pit', wrongWord: 'kit', choices: ['kit', 'pit'], itemName: 'peach pit' },
  // Additional sight words/CVC items for replayability
  { id: 13, emoji: '🐱', correctWord: 'cat', wrongWord: 'can', choices: ['cat', 'can'], itemName: 'cat' },
  { id: 14, emoji: '☀️', correctWord: 'sun', wrongWord: 'run', choices: ['sun', 'run'], itemName: 'sun' },
  { id: 15, emoji: '🧢', correctWord: 'cap', wrongWord: 'cup', choices: ['cap', 'cup'], itemName: 'cap' },
  { id: 16, emoji: '🪵', correctWord: 'log', wrongWord: 'leg', choices: ['log', 'leg'], itemName: 'log' },
  { id: 17, emoji: '🕸️', correctWord: 'web', wrongWord: 'wet', choices: ['web', 'wet'], itemName: 'spider web' },
  { id: 18, emoji: '🦇', correctWord: 'bat', wrongWord: 'bag', choices: ['bat', 'bag'], itemName: 'bat' },
  { id: 19, emoji: '🥤', correctWord: 'cup', wrongWord: 'cap', choices: ['cup', 'cap'], itemName: 'cup' },
  { id: 20, emoji: '🐭', correctWord: 'rat', wrongWord: 'rag', choices: ['rat', 'rag'], itemName: 'rat' },
];

export default function SimpleReading({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [userName, setUserName] = useState('Little Scholar');
  const [isEditingName, setIsEditingName] = useState(false);
  const [gridItems, setGridItems] = useState<WorksheetItem[]>([]);
  // Store correctly answered item IDs and their chosen word
  const [solvedAnswers, setSolvedAnswers] = useState<Record<number, string>>({});
  const [wrongAnswers, setWrongAnswers] = useState<Record<string, boolean>>({}); // key format: `${itemId}-${word}`
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    generateNewWorksheet();
  }, []);

  const generateNewWorksheet = () => {
    // Select 12 items (3 rows of 4 or custom responsive grid)
    const shuffled = [...ALL_WORKSHEET_ITEMS].sort(() => Math.random() - 0.5).slice(0, 12);
    setGridItems(shuffled);
    setSolvedAnswers({});
    setWrongAnswers({});
    setGameComplete(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Kind, clear speed
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWordSelect = (item: WorksheetItem, word: string) => {
    if (gameComplete || solvedAnswers[item.id]) return;

    if (word === item.correctWord) {
      audioManager.playPop();
      audioManager.playCorrect();
      
      const updated = { ...solvedAnswers, [item.id]: word };
      setSolvedAnswers(updated);
      
      // Kid friendly word pronunciation
      speakText(`${word}! Excellent!`);

      // Check if all 12 are solved
      if (Object.keys(updated).length === gridItems.length) {
        setGameComplete(true);
        audioManager.playCorrect();
        onGameWin(3);
        setTimeout(() => {
          speakText(`Amazing job, ${userName}! You completed your worksheet! A plus grade!`);
        }, 600);
      }
    } else {
      audioManager.playIncorrect();
      const wrongKey = `${item.id}-${word}`;
      setWrongAnswers(prev => ({ ...prev, [wrongKey]: true }));
      speakText(`That is ${word}. Try again!`);
      setTimeout(() => {
        setWrongAnswers(prev => {
          const copy = { ...prev };
          delete copy[wrongKey];
          return copy;
        });
      }, 600);
    }
  };

  const handleSpeakItemHint = (item: WorksheetItem) => {
    speakText(`Can you find the word that matches the picture of the ${item.itemName}? The choices are: ${item.choices[0]}, or ${item.choices[1]}.`);
  };

  const score = Object.keys(solvedAnswers).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none text-black" id="interactive-worksheet-game">
      <ConfettiEffect active={gameComplete} />

      {/* Outer Worksheet Layout Wrapper */}
      <div className="w-full bg-white rounded-[36px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        
        {/* Lined Notebook Paper Aesthetics */}
        <div className="absolute top-0 bottom-0 left-10 w-1 bg-red-400 opacity-40 pointer-events-none" />

        {/* Worksheet Header Box */}
        <div className="border-4 border-black rounded-2xl bg-amber-50 p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          
          {/* Top Left Name Field */}
          <div className="flex items-center gap-2 border-3 border-black bg-white rounded-xl px-4 py-2 w-full md:w-auto">
            <span className="font-black text-sm uppercase tracking-wider text-gray-700">Name:</span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
                  className="font-bold text-sm border-b-2 border-black focus:outline-none px-1 py-0.5 w-36 text-purple-700"
                  maxLength={15}
                  autoFocus
                />
                <button 
                  onClick={() => setIsEditingName(false)}
                  className="bg-emerald-400 p-1 border border-black rounded-md cursor-pointer hover:bg-emerald-500"
                >
                  <Check className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                <span className="font-black text-sm text-purple-700 underline decoration-dashed decoration-2">
                  {userName}
                </span>
                <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition-colors" />
              </div>
            )}
          </div>

          {/* Title Banner */}
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-950 font-sans" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
              I Can Read Words! 📖
            </h1>
            <p className="text-xs font-bold text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
              <span className="bg-yellow-200 border border-black/15 px-1.5 py-0.5 rounded-md font-extrabold text-[10px] mr-1">DIRECTIONS:</span>
              Look at each cute picture. Tap and circle the word that matches the picture!
            </p>
          </div>

          {/* Custom cartoon house illustration peek-a-boo like worksheet design */}
          <div className="flex items-center gap-3 bg-white border-3 border-black px-4 py-2 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
            <div className="flex flex-col items-center">
              <span className="text-2xl animate-bounce">🏠</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 font-mono">READING CLUB</span>
            </div>
            <div className="flex -space-x-2">
              <span className="text-xl">🧒</span>
              <span className="text-xl">👧</span>
            </div>
          </div>
        </div>

        {/* Interactive Worksheet Grid of 12 Matching Squares */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {gridItems.map((item, index) => {
            const isSolved = solvedAnswers[item.id] !== undefined;
            const solvedWord = solvedAnswers[item.id];

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: isSolved ? 0 : -3 }}
                className={`border-3 border-black rounded-3xl p-4 flex flex-col justify-between items-center relative min-h-[220px] transition-all duration-300 ${
                  isSolved 
                    ? 'bg-emerald-50/90 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {/* Index badge */}
                <span className="absolute top-2 left-3 text-[10px] font-black font-mono text-gray-400 bg-gray-50 border border-black/10 px-1.5 py-0.5 rounded-md">
                  Q{index + 1}
                </span>

                {/* Speech Synthesis / Tip Button */}
                <button
                  onClick={() => handleSpeakItemHint(item)}
                  className="absolute top-2 right-2 bg-purple-100 hover:bg-purple-200 border border-black/20 p-1.5 rounded-lg cursor-pointer transition-all active:scale-95"
                  title="Hear clue"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                </button>

                {/* Big bouncing Emoji/Picture */}
                <div className="mt-4 flex items-center justify-center h-20">
                  <motion.span 
                    animate={isSolved ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : {}}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-6xl drop-shadow-md select-none cursor-pointer"
                    onClick={() => handleSpeakItemHint(item)}
                  >
                    {item.emoji}
                  </motion.span>
                </div>

                {/* Words Choices Box */}
                <div className="w-full flex flex-col gap-2 mt-4 pt-3 border-t-2 border-dashed border-gray-200">
                  {item.choices.map((word) => {
                    const isSelectedAndCorrect = solvedWord === word;
                    const isSelectedAndWrong = wrongAnswers[`${item.id}-${word}`] === true;

                    return (
                      <motion.button
                        key={word}
                        onClick={() => handleWordSelect(item, word)}
                        whileTap={{ scale: 0.95 }}
                        animate={isSelectedAndWrong ? { x: [-8, 8, -8, 8, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`w-full py-1.5 rounded-xl text-lg font-black uppercase font-mono tracking-wider border-2 relative overflow-hidden cursor-pointer transition-all ${
                          isSelectedAndCorrect
                            ? 'bg-transparent text-emerald-700 border-transparent font-black scale-110'
                            : isSelectedAndWrong
                            ? 'bg-red-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-amber-50/50 hover:bg-yellow-100/80 text-gray-800 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        {word}

                        {/* Beautiful sketch crayon circle overlay when selected/correct */}
                        {isSelectedAndCorrect && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <motion.ellipse
                              cx="50"
                              cy="20"
                              rx="45"
                              ry="15"
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="3.5"
                              strokeDasharray="200"
                              initial={{ strokeDashoffset: 200 }}
                              animate={{ strokeDashoffset: 0 }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                            {/* Double stroke overlay for hand drawn feel */}
                            <motion.ellipse
                              cx="52"
                              cy="22"
                              rx="43"
                              ry="13"
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="1.5"
                              strokeDasharray="200"
                              initial={{ strokeDashoffset: 200 }}
                              animate={{ strokeDashoffset: 10 }}
                              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                            />
                          </svg>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Big Ink Stamp Overlay when Game is Complete */}
        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ scale: 3, opacity: 0, rotate: 20 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute inset-0 m-auto w-80 h-44 border-8 border-red-600 rounded-[36px] bg-white/95 flex flex-col items-center justify-center p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.8)] z-50 select-none pointer-events-auto cursor-default"
              style={{ top: '35%' }}
            >
              <span className="text-4xl font-black text-red-600 uppercase tracking-widest font-sans drop-shadow-sm">A+ EXCELLENT</span>
              <span className="text-lg font-black text-red-600 mt-1 uppercase font-mono">100% PERFECT WORK!</span>
              <span className="text-xs text-red-500 font-extrabold mt-2 italic">GRADER: TEACHER ROBOT 🤖</span>
              
              {/* Reset/New Worksheet Button on Stamp */}
              <button
                onClick={generateNewWorksheet}
                className="mt-4 px-4 py-2 bg-yellow-300 text-black border-2 border-black font-black uppercase rounded-lg text-xs font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all"
              >
                NEW WORKSHEET
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons Footer */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button
          onClick={generateNewWorksheet}
          className="flex items-center gap-2 px-6 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          NEW SHUFFLED SHEET
        </button>
      </div>
    </div>
  );
}
