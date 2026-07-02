import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { RotateCcw, Star, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

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
];

export default function WordPhonics({ onGameWin }: { onGameWin: (stars: number) => void }) {
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

  useEffect(() => {
    restartGame();
  }, []);

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

  const activeRound = rounds[currentRoundIdx];

  if (rounds.length === 0 || !activeRound) {
    return <div className="text-center py-10 font-bold">Loading safari sandbox...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black" id="phonics-game">
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
    </div>
  );
}
