import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { exportOrPrintElement } from '../utils/printHelper';
import { RotateCcw, Star, CheckCircle, Volume2, HelpCircle, Edit2, Check, Printer, Sparkles, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';

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

export default function SimpleReading({
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
  const [userName, setUserName] = useState('Little Scholar');
  const [isEditingName, setIsEditingName] = useState(false);
  const [gridItems, setGridItems] = useState<WorksheetItem[]>([]);
  const [solvedAnswers, setSolvedAnswers] = useState<Record<number, string>>({});
  const [wrongAnswers, setWrongAnswers] = useState<Record<string, boolean>>({}); // key format: `${itemId}-${word}`
  const [gameComplete, setGameComplete] = useState(false);

  // Printable Worksheet Lab States
  const [wsShowAnswers, setWsShowAnswers] = useState(false);
  const [wsProblemCount, setWsProblemCount] = useState<number>(12);
  const [wsMascotTheme, setWsMascotTheme] = useState<'reading-club' | 'wonderkids' | 'little-scholars'>('reading-club');
  const [wsProblems, setWsProblems] = useState<WorksheetItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    generateNewWorksheet();
  }, []);

  useEffect(() => {
    handleGeneratePrintWorksheet();
  }, [wsProblemCount]);

  const generateNewWorksheet = () => {
    // Select 12 items (3 rows of 4 or custom responsive grid)
    const shuffled = [...ALL_WORKSHEET_ITEMS].sort(() => Math.random() - 0.5).slice(0, 12);
    setGridItems(shuffled);
    setSolvedAnswers({});
    setWrongAnswers({});
    setGameComplete(false);
  };

  const handleGeneratePrintWorksheet = () => {
    const shuffled = [...ALL_WORKSHEET_ITEMS].sort(() => Math.random() - 0.5).slice(0, wsProblemCount);
    setWsProblems(shuffled);
  };

  const handleWordSelect = (item: WorksheetItem, word: string) => {
    if (gameComplete || solvedAnswers[item.id]) return;

    if (word === item.correctWord) {
      audioManager.playPop();
      audioManager.playCorrect();
      
      const updated = { ...solvedAnswers, [item.id]: word };
      setSolvedAnswers(updated);

      // Check if all 12 are solved
      if (Object.keys(updated).length === gridItems.length) {
        setGameComplete(true);
        audioManager.playCorrect();
        onGameWin(3);
      }
    } else {
      audioManager.playIncorrect();
      const wrongKey = `${item.id}-${word}`;
      setWrongAnswers(prev => ({ ...prev, [wrongKey]: true }));
      setTimeout(() => {
        setWrongAnswers(prev => {
          const copy = { ...prev };
          delete copy[wrongKey];
          return copy;
        });
      }, 600);
    }
  };

  const handlePrint = async () => {
    audioManager.playPop();
    const paperElement = document.getElementById('simple-reading-worksheet-paper');
    setIsExporting(true);
    await exportOrPrintElement({
      element: paperElement,
      filename: `Storybook_Reading_Worksheet_${wsMascotTheme}`,
      title: `CVC Word Reading Worksheet - ${getMascotDetails().title}`,
      onSuccess: () => setIsExporting(false),
      onError: () => setIsExporting(false),
    });
    setIsExporting(false);
  };

  const getMascotDetails = () => {
    switch (wsMascotTheme) {
      case 'wonderkids':
        return { emoji: '🧸', label: 'STORYBOOK EDUCATION', title: 'CVC Reading practice', bg: 'bg-yellow-300' };
      case 'little-scholars':
        return { emoji: '🌟', label: 'LITTLE SCHOLARS', title: 'SUPER READING STARS', bg: 'bg-pink-400 text-white' };
      case 'reading-club':
      default:
        return { emoji: '📖', label: 'READING CLUB', title: 'I CAN READ WORDS!', bg: 'bg-emerald-400 text-white' };
    }
  };

  const mascot = getMascotDetails();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none text-black" id="simple-reading-container">
      
      {/* Neo-brutalist Tab Switcher (Hidden in Print) */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('game');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'game'
              ? 'bg-emerald-400 text-gray-950'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🎮 PLAY INTERACTIVE GAME
        </button>
        <button
          onClick={() => {
            audioManager.playPop();
            if (activeTab === 'worksheet') {
              handlePrint();
            } else {
              setActiveTab('worksheet');
            }
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'worksheet'
              ? 'bg-purple-400 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📝 PRINTABLE WORKSHEETS (PDF)
        </button>
      </div>

      {/* INTERACTIVE GAME TAB */}
      <div className={`w-full flex-col items-center print:hidden ${activeTab === 'game' ? 'flex' : 'hidden'}`}>
            <ConfettiEffect active={gameComplete} />

            {/* Outer Worksheet Layout Wrapper */}
            <div className="w-full bg-white rounded-[36px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" id="interactive-worksheet-game">
              
              {/* Lined Notebook Paper Aesthetics */}
              <div className="absolute top-0 bottom-0 left-10 w-1 bg-red-400 opacity-40 pointer-events-none" />

              {/* Worksheet Header Box */}
              <div className="border-4 border-black rounded-2xl bg-amber-50 p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                
                {/* Top Left Name Field */}
                <div className="flex items-center gap-2 border-3 border-black bg-white rounded-xl px-4 py-2 w-full md:w-auto">
                  <span className="font-black text-sm sm:text-base uppercase tracking-wider text-gray-700">Name:</span>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
                        className="font-bold text-sm sm:text-base border-b-2 border-black focus:outline-none px-1 py-0.5 w-36 text-purple-700"
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
                      <span className="font-black text-sm sm:text-base text-purple-700 underline decoration-dashed decoration-2">
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
                  <p className="text-base font-extrabold text-neutral-800 mt-2 max-w-md mx-auto leading-relaxed">
                    <span className="bg-yellow-200 border border-black/15 px-2 py-0.5 rounded-md font-extrabold text-xs mr-1">DIRECTIONS:</span>
                    Look at each cute picture. Tap and circle the word that matches the picture!
                  </p>
                </div>

                {/* Custom cartoon house illustration peek-a-boo like worksheet design */}
                <div className="flex items-center gap-3 bg-white border-3 border-black px-4 py-2 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl animate-bounce">🏠</span>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-700 font-mono">READING CLUB</span>
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
                      <span className="absolute top-2 left-3 text-xs font-black font-mono text-gray-400 bg-gray-50 border border-black/10 px-2 py-0.5 rounded-md">
                        Q{index + 1}
                      </span>

                      {/* Big bouncing Emoji/Picture */}
                      <div className="mt-4 flex items-center justify-center h-20">
                        <motion.span 
                          animate={isSolved ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : {}}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="text-6xl drop-shadow-md select-none"
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
                className="flex items-center gap-2 px-8 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-sm sm:text-base font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              >
                <RotateCcw className="w-5 h-5 stroke-[3]" />
                PLAY AGAIN
              </button>
              {onNextGame && (
                <button
                  onClick={onNextGame}
                  className="flex items-center gap-2 px-8 py-4 bg-sky-400 hover:bg-sky-500 text-black border-4 border-black font-black uppercase rounded-2xl text-sm sm:text-base font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                >
                  NEXT MODULE
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              )}
            </div>
      </div>

      {/* PRINTABLE WORKSHEETS GENERATOR */}
      <div className={`w-full flex-col gap-8 text-black ${activeTab === 'worksheet' ? 'flex' : 'hidden print:flex'}`}>
            {/* Options Dashboard (Hidden in Print) */}
            <div className="w-full bg-purple-100 rounded-[32px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col gap-6 print:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-purple-400 border-2 border-black p-2 rounded-xl text-white">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-purple-950">Reading Worksheet Lab</h3>
                  <p className="text-xs font-bold text-purple-900/70">Customize, shuffle, and print professional early literacy worksheets instantly!</p>
                </div>
              </div>

              {/* Customizer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t-2 border-purple-200 pt-6">
                
                {/* 1. Words Count */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Words Count</span>
                  <div className="flex flex-col gap-1.5">
                    {([6, 8, 12, 16] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          audioManager.playPop();
                          setWsProblemCount(count);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs uppercase transition-all flex items-center justify-between ${
                          wsProblemCount === count
                            ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{count} Words</span>
                        {wsProblemCount === count && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Mascot Header Theme */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Mascot Theme</span>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { id: 'reading-club', name: '📖 Reading Club' },
                      { id: 'wonderkids', name: '🧸 Storybook' },
                      { id: 'little-scholars', name: '🌟 Little Scholars' }
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsMascotTheme(t.id);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
                          wsMascotTheme === t.id
                            ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t.name}</span>
                        {wsMascotTheme === t.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Settings */}
                <div className="flex flex-col gap-2">
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
                </div>

                {/* 4. Controls */}
                <div className="flex flex-col justify-end gap-3">
                  <button
                    onClick={() => {
                      audioManager.playPop();
                      handleGeneratePrintWorksheet();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full bg-amber-300 hover:bg-amber-400 text-black border-2 border-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
                    Randomize
                  </button>
                </div>
              </div>

              {/* Print CTA Bar */}
              <div className="flex justify-end gap-3 border-t-2 border-purple-200 pt-6">
                <button
                  onClick={handlePrint}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-75 text-white border-4 border-black font-black uppercase rounded-2xl text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 stroke-[3] animate-spin" />
                      PREPARING...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 stroke-[3]" />
                      PRINT / DOWNLOAD PDF
                    </>
                  )}
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
                id="simple-reading-worksheet-paper"
                className="bg-white border-4 border-black p-8 sm:p-12 rounded-[44px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-[800px] font-sans relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:bg-white"
              >
                {/* Lined Notebook Paper Aesthetics */}
                <div className="absolute top-0 bottom-0 left-10 w-1 bg-red-400 opacity-20 pointer-events-none print:hidden" />

                {/* 1. Header of the printed worksheet */}
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

                {/* Sub-Header & Instructions */}
                <div className="flex justify-between items-center bg-gray-50 border-2 border-dashed border-black/20 p-4 rounded-2xl mb-8 print:bg-white print:border-black/30 print:py-2 print:px-3 print:mb-3 print:rounded-xl">
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-purple-500 leading-none">Assignment Instructions</p>
                    <p className="text-sm font-black text-black mt-1 leading-tight">
                      Look at each cute picture. Draw a circle around the word that matches the picture!
                    </p>
                  </div>
                  <div className="bg-yellow-100 px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black rotate-3 print:rotate-0 print:rounded-lg">
                    {wsShowAnswers ? '🔑 ANSWER KEY' : '📝 CVC READ'}
                  </div>
                </div>

                {/* Problems Grid */}
                <div className={`grid gap-6 print:gap-x-4 print:gap-y-3 ${
                  wsProblemCount === 6 
                    ? 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3' 
                    : wsProblemCount === 8 
                    ? 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4' 
                    : wsProblemCount === 12 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-4' 
                    : 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4'
                }`}>
                  {wsProblems.map((prob, idx) => (
                    <div
                      key={prob.id}
                      className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-gray-200 rounded-2xl relative bg-white min-h-[170px] print:min-h-[105px] print:py-2 print:px-1 print:rounded-xl print:border-black/30"
                    >
                      {/* Problem Index */}
                      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 print:text-black">
                        #{idx + 1}
                      </span>

                      {/* Mascot indicator peek-a-boo (optional) */}
                      <span className="absolute top-2 right-2 text-[10px] opacity-20 print:hidden">
                        ✏️
                      </span>

                      {/* Large Emoji picture */}
                      <div className="text-5xl print:text-4xl my-2 select-none">
                        {prob.emoji}
                      </div>

                      {/* Dotted target container for word options */}
                      <div className="w-full flex flex-col gap-1.5 mt-3 pt-2.5 border-t border-dashed border-gray-200 print:mt-1.5 print:pt-1.5">
                        {prob.choices.map((word) => {
                          const isCorrect = word === prob.correctWord;
                          return (
                            <div
                              key={word}
                              className={`w-full py-1 text-center font-bold text-sm uppercase font-mono tracking-wider border-2 rounded-xl relative ${
                                wsShowAnswers && isCorrect
                                  ? 'border-red-500 text-red-600 font-black bg-red-50/20 print:border-red-600'
                                  : 'border-black/10 text-gray-800 bg-amber-50/10 print:border-black/25'
                              }`}
                            >
                              {word}

                              {wsShowAnswers && isCorrect && (
                                /* Hand-drawn circle outline overlay */
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
                                  <ellipse
                                    cx="50"
                                    cy="20"
                                    rx="44"
                                    ry="13"
                                    fill="none"
                                    stroke="#dc2626"
                                    strokeWidth="3.5"
                                  />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Message for Child */}
                <div className="mt-12 text-center text-xs font-extrabold text-orange-500/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "You are a Reading Superstar! Keep shining!" 🌟
                </div>
              </div>
            </div>
      </div>
    </div>
  );
}
