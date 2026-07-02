import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameType, ScoreState } from './types';
import { audioManager } from './utils/audio';
import ColorSorter from './components/ColorSorter';
import ShapeMatcher from './components/ShapeMatcher';
import PatternCompleter from './components/PatternCompleter';
import CountingGarden from './components/CountingGarden';
import WordPhonics from './components/WordPhonics';
import MathAddition from './components/MathAddition';
import MathSubtraction from './components/MathSubtraction';
import SimpleReading from './components/SimpleReading';
import {
  Volume2,
  VolumeX,
  Star,
  ArrowLeft,
  Trophy,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [muted, setMuted] = useState(false);
  const [scoreState, setScoreState] = useState<ScoreState>({
    stars: 0,
    completedGames: {},
  });
  const [showStarCelebration, setShowStarCelebration] = useState(false);

  // Load score state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('storybook_education_score');
    if (saved) {
      try {
        setScoreState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load score state', e);
      }
    }
    // Set initial mute state
    audioManager.setMuted(muted);
  }, []);

  const handleGameWin = (awardedStars: number) => {
    setScoreState((prev) => {
      const nextStars = prev.stars + awardedStars;
      const nextCompleted = { ...prev.completedGames };
      if (activeGame) {
        nextCompleted[activeGame] = (nextCompleted[activeGame] || 0) + 1;
      }
      const nextState = {
        stars: nextStars,
        completedGames: nextCompleted,
      };
      localStorage.setItem('storybook_education_score', JSON.stringify(nextState));
      return nextState;
    });

    // Trigger star flash celebration
    setShowStarCelebration(true);
    setTimeout(() => setShowStarCelebration(false), 3000);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioManager.setMuted(nextMuted);
    if (!nextMuted) {
      audioManager.playPop();
    }
  };

  const selectGame = (game: GameType) => {
    audioManager.ensureAudioUnlocked();
    audioManager.playPop();
    setActiveGame(game);
  };

  const goBack = () => {
    if (activeGame !== null) {
      audioManager.playPop();
      setActiveGame(null);
    }
  };

  const resetAllStars = () => {
    audioManager.playIncorrect();
    const confirmed = window.confirm('Do you want to reset your stars to 0?');
    if (confirmed) {
      const nextState = { stars: 0, completedGames: {} };
      setScoreState(nextState);
      localStorage.setItem('storybook_education_score', JSON.stringify(nextState));
      audioManager.playPop();
    }
  };

  // Helper info for dashboard cards
  const gamesList = [
    {
      id: 'sorter' as GameType,
      title: 'COLOR SORTER',
      emoji: '🎨',
      secondaryEmoji: '🧺',
      description: 'Sort toys & fruits into matching baskets!',
      skill: 'SORTING & COLORS',
      bgColor: 'bg-yellow-300 border-4 border-black text-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-gray-900',
      descColor: 'text-yellow-900',
      actionText: "LET'S SORT!",
    },
    {
      id: 'matcher' as GameType,
      title: 'SHAPE MATCHER',
      emoji: '🧩',
      secondaryEmoji: '🔺',
      description: 'Fit shapes into wooden silhouette spots!',
      skill: 'SHAPES & SPATIAL',
      bgColor: 'bg-sky-400 border-4 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-white',
      descColor: 'text-sky-950',
      actionText: "LET'S MATCH!",
    },
    {
      id: 'pattern' as GameType,
      title: 'PATTERN TRAIN',
      emoji: '❓',
      secondaryEmoji: '✨',
      description: 'Look at the chain! What comes next?',
      skill: 'LOGIC & SEQUENCES',
      bgColor: 'bg-purple-400 border-4 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-white',
      descColor: 'text-purple-950',
      actionText: "LET'S SOLVE!",
    },
    {
      id: 'garden' as GameType,
      title: 'COUNTING GARDEN',
      emoji: '🌱',
      secondaryEmoji: '🌸',
      description: 'Tap seeds to watch flowers bloom & count!',
      skill: 'COUNTING & NUMBERS',
      bgColor: 'bg-rose-400 border-4 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-white',
      descColor: 'text-rose-950',
      actionText: "LET'S COUNT!",
    },
    {
      id: 'phonics' as GameType,
      title: 'PHONICS SAFARI',
      emoji: '🦁',
      secondaryEmoji: '🔤',
      description: 'Spell cute words & learn letter sounds!',
      skill: 'PHONICS & WORDS',
      bgColor: 'bg-pink-400 border-4 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-white',
      descColor: 'text-pink-950',
      actionText: "LET'S SPELL!",
    },
    {
      id: 'math' as GameType,
      title: 'MATH ADDITION',
      emoji: '➕',
      secondaryEmoji: '🍎',
      description: 'Add cute items & learn counting sums up to 10!',
      skill: 'MATH & ADDING',
      bgColor: 'bg-emerald-400 border-4 border-black text-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-gray-900',
      descColor: 'text-emerald-950',
      actionText: "LET'S ADD!",
    },
    {
      id: 'subtraction' as GameType,
      title: 'MATH SUBTRACTION',
      emoji: '➖',
      secondaryEmoji: '🎈',
      description: 'Take away cute items & solve subtraction levels!',
      skill: 'MATH & TAKING AWAY',
      bgColor: 'bg-teal-400 border-4 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-white',
      descColor: 'text-teal-950',
      actionText: "LET'S SUBTRACT!",
    },
    {
      id: 'reading' as GameType,
      title: 'SIMPLE READING',
      emoji: '📖',
      secondaryEmoji: '🦋',
      description: 'Tap & read sight word sentences, then match pictures!',
      skill: 'READING & SIGHT WORDS',
      bgColor: 'bg-purple-400 border-4 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      tagColor: 'bg-white text-black border-2 border-black',
      textColor: 'text-white',
      descColor: 'text-purple-950',
      actionText: "LET'S READ!",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#FFFBF5] text-[#2D2D2D] flex flex-col font-sans selection:bg-yellow-200 selection:text-black overflow-x-hidden relative"
      id="app-root"
      onClick={() => audioManager.ensureAudioUnlocked()}
    >
      {/* Top Border Accent */}
      <div className="h-3 w-full bg-orange-500 border-b-4 border-black print:hidden" />

      {/* Header Container */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4 border-b-4 border-black print:hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Waving brand / Left logo */}
          <div
            onClick={goBack}
            className="flex items-center gap-4 cursor-pointer group select-none"
          >
            <div className="bg-yellow-300 w-14 h-14 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-transform group-hover:scale-105 group-hover:rotate-3">
              <span className="text-3xl filter drop-shadow-sm select-none">🧸</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest font-black text-orange-500 leading-none mb-1">ADVENTURE PORTAL</span>
              <h1 className="text-4xl font-black tracking-tighter leading-none italic uppercase" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                WONDERKIDS
              </h1>
            </div>
          </div>

          {/* Scoring & Utility controls */}
          <div className="flex items-center gap-3">
            {/* Stars Collected Indicator */}
            <div
              className={`flex items-center gap-2 bg-yellow-300 border-4 border-black px-4 py-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all relative ${
                showStarCelebration ? 'scale-110 ring-4 ring-black ring-offset-2' : ''
              }`}
            >
              <Star className={`w-5 h-5 fill-black text-black ${showStarCelebration ? 'animate-spin' : 'animate-bounce-slow'}`} />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black uppercase tracking-wider">STARS</span>
                <span className="text-lg font-black font-mono leading-none mt-0.5">
                  {scoreState.stars}
                </span>
              </div>

              {/* Sparkles flash when points increase */}
              <AnimatePresence>
                {showStarCelebration && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-3 -right-3 text-2xl"
                  >
                    ✨
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sound Toggle Button */}
            <button
              onClick={toggleMute}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all border-4 border-black ${
                muted
                  ? 'bg-rose-400 text-white hover:bg-rose-500'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              title={muted ? 'Unmute Sounds' : 'Mute Sounds'}
              id="mute-toggle-btn"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 font-bold text-xs sm:text-sm tracking-wide border-t-2 border-dashed border-black/15 pt-3 mt-1">
          <button onClick={goBack} className={`pb-1 border-b-3 transition-colors cursor-pointer ${!activeGame ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>ALL GAMES</button>
          <button onClick={() => selectGame('phonics')} className={`pb-1 border-b-3 transition-colors cursor-pointer ${activeGame === 'phonics' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>PHONICS</button>
          <button onClick={() => selectGame('math')} className={`pb-1 border-b-3 transition-colors cursor-pointer ${activeGame === 'math' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>ADDITION</button>
          <button onClick={() => selectGame('subtraction')} className={`pb-1 border-b-3 transition-colors cursor-pointer ${activeGame === 'subtraction' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>SUBTRACTION</button>
          <button onClick={() => selectGame('reading')} className={`pb-1 border-b-3 transition-colors cursor-pointer ${activeGame === 'reading' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>READING</button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-8 relative print:p-0 print:max-w-none print:w-full print:m-0">
        <AnimatePresence mode="wait">
          {activeGame === null ? (
            // DASHBOARD MENU
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-10"
            >
              {/* Playful greeting card */}
              <div className="bg-orange-500 rounded-[50px] border-4 border-black p-8 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white">
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 transform -translate-x-12 translate-y-12 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />

                <div className="max-w-xl relative z-10">
                  <span className="bg-yellow-300 text-black border-2 border-black font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Welcome Friend! 👋
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mt-4 leading-tight italic uppercase" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                    Let's Play & Learn!
                  </h2>
                  <p className="text-sm font-bold mt-2 text-orange-50 leading-relaxed font-sans max-w-lg">
                    Select any creative activity below. Count in the magical garden, sort colorful fruits, spell CVC words, solve math equations, or practice reading worksheets!
                  </p>
                </div>

                {/* Stars status card */}
                {scoreState.stars > 0 && (
                  <div className="absolute right-8 bottom-8 hidden sm:flex items-center gap-2.5 bg-yellow-300 text-black border-4 border-black px-5 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Trophy className="w-6 h-6 text-black fill-black/20" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-wider">Trophy Case</span>
                      <span className="text-sm font-black font-sans">
                        {Object.keys(scoreState.completedGames).length} Games Beaten!
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Cards Grid */}
              <div className="flex flex-col gap-6">
                <h3 className="text-md font-black uppercase tracking-wider text-black font-sans">
                  CHOOSE YOUR ADVENTURE:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {gamesList.map((g, idx) => {
                    const completedTimes = scoreState.completedGames[g.id] || 0;
                    const isCompleted = completedTimes > 0;

                    return (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 120 }}
                        whileHover={{ scale: 1.025, rotate: idx % 2 === 0 ? 0.5 : -0.5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectGame(g.id)}
                        className={`${g.bgColor} rounded-[40px] p-7 flex flex-col justify-between cursor-pointer transition-shadow relative overflow-hidden`}
                        id={`dashboard-card-${g.id}`}
                      >
                        {/* Background subtle icons decoration */}
                        <div className="absolute right-4 bottom-4 text-[11rem] opacity-10 select-none pointer-events-none transform rotate-12 font-black">
                          {g.emoji}
                        </div>

                        {/* Top info row */}
                        <div>
                          <div className="flex justify-between items-start">
                            {/* Colorful Category badge */}
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider font-sans shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${g.tagColor}`}>
                              {g.skill}
                            </span>

                            {/* Completed tick badge */}
                            {isCompleted && (
                              <div className="flex items-center gap-1.5 bg-emerald-400 text-black px-3 py-1 rounded-full text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
                                <Award className="w-3.5 h-3.5 fill-white" />
                                <span>DONE!</span>
                              </div>
                            )}
                          </div>

                          {/* App Card Content */}
                          <div className="flex items-center gap-5 mt-5 relative z-10">
                            <div className="bg-white text-black p-4 rounded-3xl text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-3 border-black flex-shrink-0 animate-pulse-slow">
                              {g.emoji}
                            </div>
                            <div>
                              <h4 className="text-2xl font-black tracking-tight uppercase" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                                {g.title}
                              </h4>
                              <p className={`text-xs font-bold mt-1 max-w-[240px] leading-relaxed font-sans ${g.descColor}`}>
                                {g.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Button indicator */}
                        <div className="flex justify-between items-center border-t-2 border-black/10 mt-8 pt-4 relative z-10">
                          <span className={`text-xs font-bold font-sans ${g.descColor}`}>
                            {completedTimes > 0 ? `Played: ${completedTimes} times` : 'READY TO PLAY'}
                          </span>
                          <span className="flex items-center gap-1.5 bg-white text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                            {g.actionText}
                            <ChevronRight className="w-4 h-4 stroke-[3]" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Reset capability footer */}
              {scoreState.stars > 0 && (
                <div className="w-full flex justify-center mt-4">
                  <button
                    onClick={resetAllStars}
                    className="text-xs font-bold text-amber-700/60 hover:text-amber-700/90 transition-colors font-sans underline cursor-pointer"
                  >
                    Clear Star Score & Progress
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            // GAME CONTAINER SCREEN
            <motion.div
              key="game-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-8"
            >
              {/* Game toolbar control row */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-black font-black rounded-2xl text-sm font-sans transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer select-none print:hidden"
                  id="back-playground-btn"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  BACK TO PLAYGROUND
                </button>

                {/* Show active game title floating */}
                <div className="flex items-center gap-2 bg-yellow-300 border-4 border-black px-4 py-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none print:hidden">
                  <Sparkles className="w-4 h-4 text-black animate-spin" />
                  <span className="text-xs font-black text-black uppercase tracking-wider font-sans">
                    PLAYING: {activeGame === 'sorter' ? 'Color Sorter' : activeGame === 'matcher' ? 'Shape Matcher' : activeGame === 'pattern' ? 'Pattern Train' : activeGame === 'garden' ? 'Counting Garden' : activeGame === 'phonics' ? 'Phonics Safari' : activeGame === 'math' ? 'Math Addition' : activeGame === 'subtraction' ? 'Math Subtraction' : 'Simple Reading'}
                  </span>
                </div>
              </div>

              {/* Mounted Active Game Module */}
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-full bg-white rounded-[44px] p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] print:border-none print:shadow-none print:p-0 print:bg-white"
              >
                {activeGame === 'sorter' && (
                  <ColorSorter onGameWin={handleGameWin} />
                )}
                {activeGame === 'matcher' && (
                  <ShapeMatcher onGameWin={handleGameWin} />
                )}
                {activeGame === 'pattern' && (
                  <PatternCompleter onGameWin={handleGameWin} />
                )}
                {activeGame === 'garden' && (
                  <CountingGarden onGameWin={handleGameWin} />
                )}
                {activeGame === 'phonics' && (
                  <WordPhonics onGameWin={handleGameWin} />
                )}
                {activeGame === 'math' && (
                  <MathAddition onGameWin={handleGameWin} />
                )}
                {activeGame === 'subtraction' && (
                  <MathSubtraction onGameWin={handleGameWin} />
                )}
                {activeGame === 'reading' && (
                  <SimpleReading onGameWin={handleGameWin} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Floating visual nodes */}
      <div className="absolute top-1/4 -left-12 text-6xl opacity-10 select-none pointer-events-none hover:rotate-12 transition-transform print:hidden">🎈</div>
      <div className="absolute top-2/3 -right-12 text-6xl opacity-10 select-none pointer-events-none hover:rotate-12 transition-transform print:hidden">🧸</div>
      <div className="absolute bottom-12 left-12 text-5xl opacity-10 select-none pointer-events-none hover:rotate-12 transition-transform print:hidden">🌸</div>

      {/* Footer credits block */}
      <footer className="w-full text-center py-6 text-[10px] sm:text-xs font-bold text-amber-800/40 font-sans mt-auto print:hidden">
        <span>© 2026 Storybook Education. Built for active play & early learning.</span>
      </footer>
    </div>
  );
}
