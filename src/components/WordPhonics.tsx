import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import {
  RotateCcw,
  Star,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Printer,
  Sparkles,
  RefreshCw,
  Check,
  FileText
} from 'lucide-react';

interface PhonicsWord {
  word: string;
  emoji: string;
  hint: string;
  startingSound: string;
}

const PHONICS_WORDS_POOL: PhonicsWord[] = [
  { word: 'CAT', emoji: '🐱', hint: 'A cute furry pet that says meow!', startingSound: '/k/' },
  { word: 'DOG', emoji: '🐶', hint: 'A playful companion that loves to bark!', startingSound: '/d/' },
  { word: 'FOX', emoji: '🦊', hint: 'A clever wild animal living in the woods!', startingSound: '/f/' },
  { word: 'PIG', emoji: '🐷', hint: 'A cheerful pink farm animal that loves mud!', startingSound: '/p/' },
  { word: 'SUN', emoji: '☀️', hint: 'The big bright yellow star in our sky!', startingSound: '/s/' },
  { word: 'BED', emoji: '🛌', hint: 'The warm, cozy place where you sleep at night!', startingSound: '/b/' },
  { word: 'COW', emoji: '🐮', hint: 'A friendly farm animal that gives us milk!', startingSound: '/k/' },
  { word: 'HAT', emoji: '🎩', hint: 'Something neat you wear on top of your head!', startingSound: '/h/' },
  { word: 'BUS', emoji: '🚌', hint: 'The big yellow vehicle that takes kids to school!', startingSound: '/b/' },
  { word: 'CUP', emoji: '🧁', hint: 'A small sweet cupcake treat in a wrapper!', startingSound: '/k/' },
  { word: 'HEN', emoji: '🐔', hint: 'A friendly farm bird that lays eggs!', startingSound: '/h/' },
  { word: 'BAT', emoji: '🦇', hint: 'A nocturnal flying mammal with wings!', startingSound: '/b/' },
  { word: 'LOG', emoji: '🪵', hint: 'A thick piece of wood from a tree!', startingSound: '/l/' },
  { word: 'MOP', emoji: '🧹', hint: 'A handy tool used to clean up wet floors!', startingSound: '/m/' },
  { word: 'PEN', emoji: '🖊️', hint: 'A tool filled with ink for writing on paper!', startingSound: '/p/' },
  { word: 'BUG', emoji: '🐛', hint: 'A tiny crawling insect found in the dirt!', startingSound: '/b/' },
  { word: 'LION', emoji: '🦁', hint: 'The brave King of the Jungle with a big mane!', startingSound: '/l/' },
  { word: 'FROG', emoji: '🐸', hint: 'A green jumping animal that says ribbit!', startingSound: '/f/' },
];

export default function WordPhonics({ onGameWin }: { onGameWin: (stars: number) => void }) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'game' | 'worksheet'>('game');

  // Interactive Game States
  const [rounds, setRounds] = useState<PhonicsWord[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]); // holds letters filled so far, e.g. ['C', '', '']
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0); // index we are currently looking for (0, 1, or 2)
  const [letterOptions, setLetterOptions] = useState<string[]>([]); // scrambled options + distractors
  const [wrongOption, setWrongOption] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [phonicsSubtitle, setPhonicsSubtitle] = useState('');

  // Printable Worksheet Lab States
  const [wsShowAnswers, setWsShowAnswers] = useState(false);
  const [wsProblemCount, setWsProblemCount] = useState<number>(6);
  const [wsMascotTheme, setWsMascotTheme] = useState<'jungle' | 'polar' | 'farm'>('jungle');
  const [wsType, setWsType] = useState<'spell' | 'first' | 'vowel' | 'trace'>('spell');
  const [wsProblems, setWsProblems] = useState<PhonicsWord[]>([]);

  useEffect(() => {
    restartGame();
  }, []);

  useEffect(() => {
    handleGeneratePrintWorksheet();
  }, [wsProblemCount]);

  const restartGame = () => {
    // Select 4 random words from pool
    const shuffled = [...PHONICS_WORDS_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
    setRounds(shuffled);
    setCurrentRoundIdx(0);
    setGameComplete(false);
    setScore(0);
    setupRound(shuffled[0]);
  };

  const setupRound = (round: PhonicsWord) => {
    setSpelledLetters(Array(round.word.length).fill(''));
    setCurrentLetterIdx(0);
    setRoundComplete(false);
    setPhonicsSubtitle(`Spell ${round.word}! Can you find the letter "${round.word[0]}"?`);

    // Create options: correct letters + some random distractors
    const wordLetters = round.word.split('');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractors: string[] = [];

    while (distractors.length < 3) {
      const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!wordLetters.includes(randChar) && !distractors.includes(randChar)) {
        distractors.push(randChar);
      }
    }

    // Combine & shuffle options
    const options = [...wordLetters, ...distractors].sort(() => Math.random() - 0.5);
    setLetterOptions(options);
  };

  const handleSelectLetter = (letter: string) => {
    if (roundComplete || gameComplete) return;

    const activeRound = rounds[currentRoundIdx];
    const targetLetter = activeRound.word[currentLetterIdx];

    if (letter === targetLetter) {
      // Correct letter!
      audioManager.playPop();
      audioManager.playSparkle(1.0 + currentLetterIdx * 0.15); // ascending sparkle pitch!
      
      const newSpelled = [...spelledLetters];
      newSpelled[currentLetterIdx] = letter;
      setSpelledLetters(newSpelled);

      const nextIdx = currentLetterIdx + 1;
      setCurrentLetterIdx(nextIdx);

      // Cute subtitle update based on progress
      if (nextIdx < activeRound.word.length) {
        const letterForNext = activeRound.word[nextIdx];
        setPhonicsSubtitle(`Awesome! Now find the letter "${letterForNext}"!`);
      } else {
        // Round Complete!
        audioManager.playCorrect();
        setRoundComplete(true);
        setScore((prev) => prev + 1);
        setPhonicsSubtitle(`Super job! ${activeRound.word} spells ${activeRound.word.toLowerCase()}! ${activeRound.emoji}`);

        // If this is the final round
        if (currentRoundIdx === rounds.length - 1) {
          setGameComplete(true);
          onGameWin(3); // award 3 stars for spelling master!
        }
      }
    } else {
      // Wrong letter
      audioManager.playIncorrect();
      setWrongOption(letter);
      setTimeout(() => setWrongOption(null), 500);
      setPhonicsSubtitle(`Oops! Let's try again. Look for "${targetLetter}"!`);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx < rounds.length - 1) {
      const nextIdx = currentRoundIdx + 1;
      setCurrentRoundIdx(nextIdx);
      setupRound(rounds[nextIdx]);
    }
  };

  const handleGeneratePrintWorksheet = () => {
    const shuffled = [...PHONICS_WORDS_POOL].sort(() => Math.random() - 0.5).slice(0, wsProblemCount);
    setWsProblems(shuffled);
  };

  const handlePrint = () => {
    audioManager.playPop();
    window.print();
  };

  const getMascotDetails = () => {
    switch (wsMascotTheme) {
      case 'polar':
        return { emoji: '🐻', label: 'POLAR EXPLORERS ACADEMY', title: 'POLAR SAFARI SPELLING', bg: 'bg-sky-400 text-white' };
      case 'farm':
        return { emoji: '🐷', label: 'HAPPY FARM SCHOOL', title: 'FARMHOUSE PHONICS', bg: 'bg-orange-400 text-white' };
      case 'jungle':
      default:
        return { emoji: '🦁', label: 'JUNGLE SAFARI CLUB', title: 'PHONICS SAFARI ADVENTURE', bg: 'bg-emerald-400 text-white' };
    }
  };

  const getWorksheetInstructions = () => {
    switch (wsType) {
      case 'trace':
        return 'Trace over the dotted letters nicely with your crayon or pencil to practice spelling each safari animal!';
      case 'first':
        return 'Look at the picture, speak the name out loud, and write down the missing starting letter in the empty box!';
      case 'vowel':
        return 'Listen carefully to the middle sound! Write the missing vowel letter (A, E, I, O, or U) in the center box!';
      case 'spell':
      default:
        return 'Spell the whole word by writing each letter inside the empty boxes! Say the phonics sounds out loud!';
    }
  };

  const activeRound = rounds[currentRoundIdx];
  const mascot = getMascotDetails();

  if (rounds.length === 0 || !activeRound) {
    return <div className="text-center py-10 font-bold">Loading safari sandbox...</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none text-black" id="phonics-game-container">
      
      {/* Tab Switcher (Hidden in Print) */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('game');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'game'
              ? 'bg-pink-300 text-gray-950'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          🎮 PLAY SAFARI GAME
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
        >
          📝 PRINT PHONICS WORKSHEET
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'game' ? (
          // INTERACTIVE SAFARI GAME TAB
          <motion.div
            key="game-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center print:hidden"
          >
            <ConfettiEffect active={gameComplete} />

            {/* Progress & Header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-pink-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black uppercase tracking-wider">SAFARI LEVELS:</span>
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
                <span className="font-black font-mono text-sm">{score} / {rounds.length} SPELLED</span>
              </div>
            </div>

            {/* Main Interactive Board */}
            <div className="w-full bg-pink-100 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
              
              {/* Decorative jungle corner leaf/vibe */}
              <div className="absolute top-2 right-2 text-3xl opacity-30 select-none">🌴</div>
              <div className="absolute bottom-2 left-2 text-3xl opacity-30 select-none">🌿</div>

              {/* Intro / Instruction prompt */}
              <div className="text-center mb-6">
                <div className="inline-block bg-yellow-300 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3.5 rounded-2xl mb-3 text-2xl">🦁</div>
                <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>PHONICS WORD BUILDER</h2>
                
                {/* Subtitle helper showing letter sounds guidance */}
                <div className="bg-white border-2 border-black rounded-xl px-4 py-1.5 inline-block mt-2 font-black text-xs uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  🔊 {phonicsSubtitle}
                </div>
              </div>

              {/* Word Display Area */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-6">
                {/* Left: Giant Round Icon Card */}
                <motion.div
                  animate={roundComplete ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.6 }}
                  className="w-32 h-32 bg-white border-4 border-black rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative flex-shrink-0"
                >
                  <span className="text-6xl mb-1 filter drop-shadow-md select-none">{activeRound.emoji}</span>
                  <span className="text-[10px] font-black uppercase tracking-wide text-gray-500 bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full">
                    {activeRound.startingSound} SOUND
                  </span>
                </motion.div>

                {/* Right: Slots for Letters */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  <p className="text-xs font-bold text-gray-700 max-w-xs text-center md:text-left leading-relaxed">
                    💡 {activeRound.hint}
                  </p>

                  {/* Empty and filled letter slots */}
                  <div className="flex gap-3">
                    {spelledLetters.map((char, idx) => {
                      const isActiveSlot = idx === currentLetterIdx && !roundComplete;
                      return (
                        <motion.div
                          key={idx}
                          animate={isActiveSlot ? { scale: [1, 1.05, 1], borderColor: ['#000000', '#F97316', '#000000'] } : {}}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className={`w-14 h-16 rounded-2xl border-4 flex items-center justify-center text-3xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                            char
                              ? 'bg-emerald-300 border-black text-black'
                              : isActiveSlot
                              ? 'bg-yellow-100 border-orange-500 text-orange-500 animate-pulse'
                              : 'bg-white border-dashed border-gray-400 text-gray-400'
                          }`}
                        >
                          {char || '?'}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Choice Bubbles Panel */}
              <div className="border-t-3 border-black/15 pt-6 mt-4 min-h-[120px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {roundComplete ? (
                    <motion.div
                      key="round-win-overlay"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-lg mb-4">
                        <CheckCircle className="w-6 h-6 fill-white text-black" />
                        SPECTACULAR SPELLING MASTER! 🎉
                      </div>
                      {!gameComplete ? (
                        <button
                          onClick={handleNextRound}
                          className="flex items-center gap-2 px-8 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
                        >
                          Next Word
                          <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </button>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-xl text-pink-950 font-black uppercase tracking-widest font-sans">JUNGLE VICTORY! 🏆</span>
                          <span className="text-xs font-bold text-pink-900 mt-2">Awesome reading & phonics skills! You earned 3 Shiny Stars!</span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center w-full" key="bubbles-panel">
                      <span className="text-xs font-black uppercase tracking-wider text-pink-950 mb-4 font-sans">
                        TAP THE CORRECT BUBBLE TO BUILD THE WORD:
                      </span>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {letterOptions.map((letter) => {
                          const isWrong = wrongOption === letter;
                          return (
                            <motion.button
                              key={letter}
                              onClick={() => handleSelectLetter(letter)}
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
                              {letter}
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
                RESTART PHONICS
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
            {/* Options Dashboard Sidebar (Hidden in Print) */}
            <div className="w-full bg-purple-100 rounded-[32px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 flex flex-col gap-6 print:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-purple-400 border-2 border-black p-2 rounded-xl text-white">
                  <Sparkles className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-purple-950">Phonics Worksheet Lab</h3>
                  <p className="text-xs font-bold text-purple-900/70">Configure, randomize, and print safari-themed early spelling worksheets instantly!</p>
                </div>
              </div>

              {/* Grid of Customizers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-t-2 border-purple-200 pt-6">
                
                {/* 1. Problem Type */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Worksheet Type</span>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { id: 'spell', name: '✏️ Spell Whole Word' },
                      { id: 'first', name: '🔤 Missing Starting Sound' },
                      { id: 'vowel', name: '💡 Missing Vowel Sound' },
                      { id: 'trace', name: '✍️ Trace Word Letters' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsType(t.id);
                        }}
                        className={`px-4 py-2 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between ${
                          wsType === t.id
                            ? 'bg-purple-400 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
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
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Words Count</span>
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

                {/* 3. Mascot Theme */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Mascot Theme</span>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { id: 'jungle', name: '🦁 Jungle Safari' },
                      { id: 'polar', name: '🐻 Polar Expedition' },
                      { id: 'farm', name: '🐷 Farm Adventure' },
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

                {/* Problems Grid */}
                <div className={`grid gap-6 print:gap-x-4 print:gap-y-3 ${
                  wsProblemCount === 4 
                    ? 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4' 
                    : wsProblemCount === 5 
                    ? 'grid-cols-2 sm:grid-cols-5 print:grid-cols-5'
                    : 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
                }`}>
                  {wsProblems.map((prob, idx) => (
                    <div
                      key={prob.word + '-' + idx}
                      className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-gray-200 rounded-2xl relative bg-white min-h-[170px] print:min-h-[105px] print:py-2 print:px-1 print:rounded-xl print:border-black/30"
                    >
                      {/* Problem Index */}
                      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 print:text-black">
                        {idx + 1}.
                      </span>

                      {/* Mascot Theme Indicator badge or simple display inside print */}
                      <span className="text-4xl print:text-3xl filter drop-shadow select-none mt-2 print:mt-1">
                        {prob.emoji}
                      </span>

                      <p className="text-[10px] font-bold text-gray-400 mt-2 text-center leading-tight print:hidden">
                        {prob.hint}
                      </p>

                      {/* Spell boxes */}
                      <div className="flex gap-1.5 mt-4 print:mt-2">
                        {prob.word.split('').map((char, charIdx) => {
                          // Determine blank states
                          let isBlank = false;
                          if (wsType === 'spell') {
                            isBlank = true;
                          } else if (wsType === 'first' && charIdx === 0) {
                            isBlank = true;
                          } else if (wsType === 'vowel' && charIdx === 1) {
                            isBlank = true;
                          }

                          const isTrace = wsType === 'trace';

                          return (
                            <div
                              key={charIdx}
                              className={`w-9 h-10 print:w-7 print:h-8 border-2 rounded-xl flex items-center justify-center text-sm font-black font-mono relative transition-all ${
                                isBlank
                                  ? 'border-dashed border-gray-400 bg-gray-50/20 print:border-black/30'
                                  : isTrace
                                  ? 'border-dashed border-gray-200 text-gray-300 font-extrabold bg-gray-50/10'
                                  : 'border-solid border-gray-300 text-gray-800 bg-white'
                              }`}
                            >
                              {isBlank ? '' : char}
                              {isBlank && (
                                <span className="absolute bottom-1 left-1.5 right-1.5 h-[2.5px] bg-gray-300 print:bg-black/30 rounded-full" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Signature Message */}
                <div className="mt-12 text-center text-xs font-extrabold text-orange-500/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "You are a Phonics Superstar! Keep shining!" 🌟
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
                        Worksheet correction sheet with full spelling answers
                      </p>
                    </div>

                    <div className={`grid gap-6 print:gap-x-4 print:gap-y-3 ${
                      wsProblemCount === 4 
                        ? 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4' 
                        : wsProblemCount === 5 
                        ? 'grid-cols-2 sm:grid-cols-5 print:grid-cols-5'
                        : 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
                    }`}>
                      {wsProblems.map((prob, idx) => (
                        <div
                          key={`key-${prob.word}-${idx}`}
                          className="print-avoid-break flex flex-col items-center justify-center p-4 border-2 border-solid border-purple-200 rounded-2xl relative bg-purple-50/20 min-h-[120px] print:min-h-[80px] print:p-2 print:rounded-xl print:border-black/30 print:bg-white"
                        >
                          {/* Problem Index */}
                          <span className="absolute top-2 left-2 text-[10px] font-black text-purple-400 print:text-black">
                            {idx + 1}.
                          </span>

                          <span className="text-3xl print:text-2xl filter drop-shadow select-none">
                            {prob.emoji}
                          </span>

                          {/* Full spelling with colored highlight on answers */}
                          <div className="flex gap-1 mt-3 print:mt-1.5">
                            {prob.word.split('').map((char, charIdx) => {
                              // Highlight color if this letter was a fill-in blank
                              let isAnswer = false;
                              if (wsType === 'spell') {
                                isAnswer = true;
                              } else if (wsType === 'first' && charIdx === 0) {
                                isAnswer = true;
                              } else if (wsType === 'vowel' && charIdx === 1) {
                                isAnswer = true;
                              } else if (wsType === 'trace') {
                                isAnswer = true;
                              }

                              return (
                                <div
                                  key={charIdx}
                                  className={`w-7 h-8 print:w-6 print:h-7 border rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                                    isAnswer
                                      ? 'bg-blue-100 border-blue-400 text-blue-600 print:bg-blue-50 print:border-blue-300'
                                      : 'bg-gray-100 border-gray-300 text-gray-500'
                                  }`}
                                >
                                  {char}
                                </div>
                              );
                            })}
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
