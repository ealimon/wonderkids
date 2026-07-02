import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShapeItem } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { RotateCcw, Star } from 'lucide-react';

const SHAPE_DESIGNS: { [key: string]: { path: string; color: string; label: string; emoji: string } } = {
  circle: {
    path: 'M50,10 A40,40 0 1,1 49.9,10 Z',
    color: 'fill-rose-400 stroke-rose-600',
    label: 'Circle',
    emoji: '🔴',
  },
  square: {
    path: 'M15,15 H85 V85 H15 Z',
    color: 'fill-sky-400 stroke-sky-600',
    label: 'Square',
    emoji: '🟦',
  },
  triangle: {
    path: 'M50,12 L88,82 H12 Z',
    color: 'fill-emerald-400 stroke-emerald-600',
    label: 'Triangle',
    emoji: '🔺',
  },
  star: {
    path: 'M50,10 L63,38 L93,38 L69,56 L78,86 L50,68 L22,86 L31,56 L7,38 L37,38 Z',
    color: 'fill-amber-400 stroke-amber-600',
    label: 'Star',
    emoji: '⭐',
  },
  heart: {
    path: 'M50,85 C20,60 10,42 10,27 C10,14 21,4 34,4 C42,4 47,8 50,12 C53,8 58,4 66,4 C79,4 90,14 90,27 C90,42 80,60 50,85 Z',
    color: 'fill-purple-400 stroke-purple-600',
    label: 'Heart',
    emoji: '💖',
  },
};

const SHAPES_LIST: ShapeItem[] = [
  { id: 's1', type: 'circle', emoji: '🔴', color: 'bg-rose-100 border-rose-300', svgPath: SHAPE_DESIGNS.circle.path },
  { id: 's2', type: 'square', emoji: '🟦', color: 'bg-sky-100 border-sky-300', svgPath: SHAPE_DESIGNS.square.path },
  { id: 's3', type: 'triangle', emoji: '🔺', color: 'bg-emerald-100 border-emerald-300', svgPath: SHAPE_DESIGNS.triangle.path },
  { id: 's4', type: 'star', emoji: '⭐', color: 'bg-amber-100 border-amber-300', svgPath: SHAPE_DESIGNS.star.path },
  { id: 's5', type: 'heart', emoji: '💖', color: 'bg-purple-100 border-purple-300', svgPath: SHAPE_DESIGNS.heart.path },
];

export default function ShapeMatcher({ onGameWin }: { onGameWin: (stars: number) => void }) {
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [targets, setTargets] = useState<ShapeItem[]>([]);
  const [solved, setSolved] = useState<{ [key: string]: boolean }>({}); // shapeId -> solved
  const [selectedShape, setSelectedShape] = useState<ShapeItem | null>(null);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    restartGame();
  }, []);

  const restartGame = () => {
    // Shuffle pieces to make them scattered, while keeping placeholders nicely aligned
    const shuffledShapes = [...SHAPES_LIST].sort(() => Math.random() - 0.5);
    const shuffledTargets = [...SHAPES_LIST].sort(() => Math.random() - 0.5); // Target silhouettes scattered as well!
    setShapes(shuffledShapes);
    setTargets(shuffledTargets);
    setSolved({});
    setSelectedShape(null);
    setWrongTarget(null);
    setRoundComplete(false);
    setScore(0);
  };

  const handleSelectShape = (shape: ShapeItem) => {
    if (solved[shape.id] || roundComplete) return;
    audioManager.playPop();
    setSelectedShape(shape);
  };

  const handleMatchTarget = (targetType: string) => {
    if (!selectedShape || roundComplete) return;

    if (selectedShape.type === targetType) {
      // Success match!
      audioManager.playCorrect();
      const nextSolved = { ...solved, [selectedShape.id]: true };
      setSolved(nextSolved);
      setScore((prev) => prev + 1);
      setSelectedShape(null);
      setWrongTarget(null);

      // Check if all are solved
      if (Object.keys(nextSolved).length === SHAPES_LIST.length) {
        setRoundComplete(true);
        audioManager.playGameComplete();
        onGameWin(3); // reward 3 stars!
      }
    } else {
      // Incorrect match
      audioManager.playIncorrect();
      setWrongTarget(targetType);
      setTimeout(() => setWrongTarget(null), 800);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none text-black" id="shape-matcher-game">
      <ConfettiEffect active={roundComplete} />

      {/* Progress & Info */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-sky-300 px-6 py-4 rounded-3xl mb-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black uppercase tracking-wider">MATCH PROGRESS:</span>
          <div className="flex gap-2">
            {SHAPES_LIST.map((shape) => {
              const isSolved = solved[shape.id];
              return (
                <div
                  key={shape.id}
                  className={`w-5 h-5 rounded-full transition-all duration-300 border-2 border-black ${
                    isSolved ? 'bg-emerald-400 scale-110' : 'bg-white'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Star className="w-5 h-5 fill-yellow-400 text-black" />
          <span className="font-black font-mono text-sm">{score} / {SHAPES_LIST.length} MATCHED</span>
        </div>
      </div>

      {/* Content Columns: Pieces & Silhouettes */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Left Card: Colorful Toy Pieces */}
        <div className="bg-orange-100 border-4 border-black rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] min-h-[350px]">
          <h3 className="text-sm font-black uppercase tracking-wider text-black font-sans mb-6">
            1. TAP A SHAPE BLOCK!
          </h3>

          <div className="flex flex-wrap gap-6 justify-center items-center">
            {shapes.map((shape) => {
              const isSolved = solved[shape.id];
              const isSelected = selectedShape?.id === shape.id;

              return (
                <AnimatePresence key={shape.id}>
                  {!isSolved ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSelectShape(shape)}
                      className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center bg-white border-4 border-black cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all relative ${
                        isSelected ? 'ring-4 ring-orange-500 animate-bounce' : ''
                      }`}
                    >
                      <svg viewBox="0 0 100 100" className="w-16 h-16">
                        <path
                          d={shape.svgPath}
                          className={`${SHAPE_DESIGNS[shape.type].color} stroke-black stroke-4`}
                        />
                      </svg>
                      <span className="text-[10px] font-black tracking-wider text-black mt-1 uppercase font-mono">
                        {SHAPE_DESIGNS[shape.type].label}
                      </span>
                    </motion.div>
                  ) : (
                    // empty spot placeholder to preserve spacing/animation rhythm
                    <div className="w-24 h-24 rounded-2xl border-4 border-dashed border-black/35 bg-white/20 flex items-center justify-center">
                      <span className="text-emerald-600 text-lg">✨</span>
                    </div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>

          {roundComplete && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-emerald-300 border-4 border-black rounded-2xl flex flex-col items-center justify-center text-center p-6"
            >
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 rounded-full mb-3 text-3xl">🧩🌟</div>
              <h4 className="text-2xl font-black uppercase tracking-tight">SENSATIONAL!</h4>
              <p className="text-xs font-bold text-gray-800 mt-2 max-w-[240px]">
                You fitted every single shape block back into the board!
              </p>
            </motion.div>
          )}
        </div>

        {/* Right Card: Grey Silhouette Board */}
        <div className="bg-sky-100 border-4 border-black rounded-3xl p-8 flex flex-col items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-sm font-black uppercase tracking-wider text-black font-sans mb-6">
            2. MATCH TO SILHOUETTE!
          </h3>

          <div className="grid grid-cols-2 xs:grid-cols-3 gap-6 justify-center items-center w-full max-w-[340px]">
            {targets.map((target) => {
              // Check if the shape corresponding to this target has been solved
              const originalShape = SHAPES_LIST.find((s) => s.type === target.type);
              const isMatched = originalShape ? solved[originalShape.id] : false;
              const isWrong = wrongTarget === target.type;

              return (
                <motion.div
                  key={target.type}
                  onClick={() => handleMatchTarget(target.type)}
                  whileHover={!isMatched && selectedShape ? { scale: 1.08 } : {}}
                  whileTap={!isMatched && selectedShape ? { scale: 0.95 } : {}}
                  animate={isWrong ? { x: [-8, 8, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`aspect-square w-full rounded-2xl border-4 flex flex-col items-center justify-center relative transition-all ${
                    isMatched
                      ? 'border-emerald-500 bg-emerald-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : isWrong
                      ? 'border-red-500 bg-red-400 text-white animate-shake shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : selectedShape
                      ? 'border-black bg-yellow-300 cursor-pointer animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-black bg-white text-black/55 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <path
                      d={SHAPE_DESIGNS[target.type].path}
                      className={`stroke-2 ${
                        isMatched
                          ? SHAPE_DESIGNS[target.type].color + ' stroke-black stroke-4'
                          : 'fill-gray-300 stroke-black stroke-4'
                      }`}
                    />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-wider mt-2 text-center font-sans">
                    {isMatched ? 'FITTED!' : SHAPE_DESIGNS[target.type].label}
                  </span>

                  {isMatched && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2.5 -right-2.5 bg-yellow-300 text-black border-2 border-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Play Again Button */}
      <div className="mt-10 flex gap-4">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 px-6 py-4 bg-yellow-300 text-black border-4 border-black font-black uppercase rounded-2xl text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          RESET BOARD
        </button>
      </div>
    </div>
  );
}
