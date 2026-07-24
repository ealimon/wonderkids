import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ShapeItem } from '../types';
import { audioManager } from '../utils/audio';
import ConfettiEffect from './ConfettiEffect';
import { RotateCcw, Star, FileText, Check, RefreshCw, Printer, Scissors, ArrowRight } from 'lucide-react';

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

interface ShapeProblem {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  emoji: string;
  label: string;
  svgPath: string;
}

export default function ShapeMatcher({
  onGameWin,
  onNextGame,
}: {
  onGameWin: (stars: number) => void;
  onNextGame?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'game' | 'worksheet'>('game');

  // Interactive Game State
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [targets, setTargets] = useState<ShapeItem[]>([]);
  const [solved, setSolved] = useState<{ [key: string]: boolean }>({}); // shapeId -> solved
  const [selectedShape, setSelectedShape] = useState<ShapeItem | null>(null);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Printable Worksheet Lab States
  const [wsShowAnswers, setWsShowAnswers] = useState(false);
  const [wsColoringOutlines, setWsColoringOutlines] = useState(false);
  const [wsShapeCount, setWsShapeCount] = useState<number>(5); // 5, 10
  const [wsMascotTheme, setWsMascotTheme] = useState<'garden' | 'meadow' | 'fairy'>('garden');
  const [wsType, setWsType] = useState<'match_line' | 'circle_shape' | 'cut_and_paste'>('match_line');
  const [wsProblems, setWsProblems] = useState<ShapeProblem[]>([]);
  const [shuffledTargets, setShuffledTargets] = useState<ShapeProblem[]>([]);

  useEffect(() => {
    restartGame();
  }, []);

  useEffect(() => {
    handleGeneratePrintWorksheet();
  }, [wsShapeCount, wsType, wsMascotTheme]);

  const restartGame = () => {
    const shuffledShapes = [...SHAPES_LIST].sort(() => Math.random() - 0.5);
    const shuffledTargets = [...SHAPES_LIST].sort(() => Math.random() - 0.5);
    setShapes(shuffledShapes);
    setTargets(shuffledTargets);
    setSolved({});
    setSelectedShape(null);
    setWrongTarget(null);
    setRoundComplete(false);
    setScore(0);
  };

  const handleGeneratePrintWorksheet = () => {
    const generated: ShapeProblem[] = [];
    const pool = [...SHAPES_LIST];
    
    for (let i = 0; i < wsShapeCount; i++) {
      const shapeTemplate = pool[i % pool.length];
      const design = SHAPE_DESIGNS[shapeTemplate.type];
      generated.push({
        id: `shape-problem-${i}-${Date.now()}`,
        type: shapeTemplate.type as 'circle' | 'square' | 'triangle' | 'star' | 'heart',
        emoji: shapeTemplate.emoji,
        label: design.label,
        svgPath: shapeTemplate.svgPath,
      });
    }

    // Shuffle problems to create dynamic sheets
    const shuffledProbs = generated.sort(() => Math.random() - 0.5);
    setWsProblems(shuffledProbs);

    // Shuffle targets independently for match layouts
    const shuffledTargs = [...shuffledProbs].sort(() => Math.random() - 0.5);
    setShuffledTargets(shuffledTargs);
  };

  const handlePrint = () => {
    audioManager.playPop();
    window.print();
  };

  const getMascotDetails = () => {
    switch (wsMascotTheme) {
      case 'meadow':
        return {
          emoji: '🌈',
          label: 'RAINBOW SHAPE CLUB',
          title: 'SHAPE DISCOVERY ADVENTURE',
          bg: 'bg-teal-300 text-black',
        };
      case 'fairy':
        return {
          emoji: '✨',
          label: 'FAIRY SHAPE CASTLE',
          title: 'ENCHANTED SHAPE CASTLE',
          bg: 'bg-amber-300 text-black',
        };
      case 'garden':
      default:
        return {
          emoji: '📐',
          label: 'SHAPE ACADEMY LAB',
          title: 'MAGIC SHAPE MATCHING',
          bg: 'bg-emerald-300 text-black',
        };
    }
  };

  const getWorksheetInstructions = () => {
    switch (wsType) {
      case 'circle_shape':
        return 'Look at the colorful shape in each box, read its name, and circle the matching silhouette shape bubble below!';
      case 'cut_and_paste':
        return 'Carefully cut out the colorful shapes in the cutting zone at the top, and paste them into their matching silhouette frames below!';
      case 'match_line':
      default:
        return 'Draw a straight path or matching line connecting each cute shape block on the left to its matching silhouette on the right!';
    }
  };

  const attemptMatch = (shape: ShapeItem, targetType: string) => {
    if (solved[shape.id] || roundComplete) return;

    if (shape.type === targetType) {
      audioManager.playCorrect();
      const nextSolved = { ...solved, [shape.id]: true };
      setSolved(nextSolved);
      setScore((prev) => prev + 1);
      setSelectedShape(null);
      setWrongTarget(null);

      if (Object.keys(nextSolved).length === SHAPES_LIST.length) {
        setRoundComplete(true);
        audioManager.playGameComplete();
        onGameWin(3);
      }
    } else {
      audioManager.playIncorrect();
      setWrongTarget(targetType);
      setTimeout(() => setWrongTarget(null), 800);
    }
  };

  const handleSelectShape = (shape: ShapeItem) => {
    if (solved[shape.id] || roundComplete) return;
    audioManager.playPop();
    setSelectedShape(shape);
  };

  const handleMatchTarget = (targetType: string) => {
    if (!selectedShape || roundComplete) return;
    attemptMatch(selectedShape, targetType);
  };

  const handleDragStart = (shape: ShapeItem) => {
    if (solved[shape.id] || roundComplete) return;
    audioManager.playPop();
    setSelectedShape(shape);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    shape: ShapeItem
  ) => {
    // Get pointer coordinates
    const pointX = info.point.x ?? (event as MouseEvent).clientX;
    const pointY = info.point.y ?? (event as MouseEvent).clientY;

    if (pointX !== undefined && pointY !== undefined && pointX !== 0 && pointY !== 0) {
      const targetElements = document.querySelectorAll('[data-target-type]');
      let matchedType: string | null = null;

      targetElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Generous padding around the target silhouette for smooth touch/mouse matching
        const padding = 25;
        if (
          pointX >= rect.left - padding &&
          pointX <= rect.right + padding &&
          pointY >= rect.top - padding &&
          pointY <= rect.bottom + padding
        ) {
          matchedType = el.getAttribute('data-target-type');
        }
      });

      if (matchedType) {
        attemptMatch(shape, matchedType);
      }
    }
  };

  const mascot = getMascotDetails();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none text-black animate-fadeIn" id="shape-matcher-root">
      
      {/* Navigation tabs switcher (Hidden when printing) */}
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 print:hidden">
        <button
          onClick={() => {
            audioManager.playPop();
            setActiveTab('game');
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${
            activeTab === 'game'
              ? 'bg-rose-300 text-gray-950'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          id="tab-btn-shapes-game"
        >
          🎮 PLAY SHAPE MATCHER
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
          id="tab-btn-shapes-worksheet"
        >
          📝 PRINT SHAPE WORKSHEET
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'game' ? (
          // INTERACTIVE SHAPE MATCHER GAME
          <motion.div
            key="game-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center print:hidden animate-fadeIn"
          >
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
                  1. TAP OR DRAG A SHAPE BLOCK!
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
                            drag
                            dragSnapToOrigin
                            onDragStart={() => handleDragStart(shape)}
                            onDragEnd={(event, info) => handleDragEnd(event, info, shape)}
                            whileDrag={{ scale: 1.15, zIndex: 100 }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.2 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSelectShape(shape)}
                            className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center bg-white border-4 border-black cursor-grab active:cursor-grabbing shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all relative touch-none select-none ${
                              isSelected ? 'ring-4 ring-orange-500 animate-bounce' : ''
                            }`}
                          >
                            <svg viewBox="0 0 100 100" className="w-16 h-16 pointer-events-none">
                              <path
                                d={shape.svgPath}
                                className={`${SHAPE_DESIGNS[shape.type].color} stroke-black stroke-4`}
                              />
                            </svg>
                            <span className="text-[10px] font-black tracking-wider text-black mt-1 uppercase font-mono pointer-events-none">
                              {SHAPE_DESIGNS[shape.type].label}
                            </span>
                          </motion.div>
                        ) : (
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
                  2. MATCH OR DROP TO SILHOUETTE!
                </h3>

                <div className="grid grid-cols-2 xs:grid-cols-3 gap-6 justify-center items-center w-full max-w-[340px]">
                  {targets.map((target) => {
                    const originalShape = SHAPES_LIST.find((s) => s.type === target.type);
                    const isMatched = originalShape ? solved[originalShape.id] : false;
                    const isWrong = wrongTarget === target.type;

                    return (
                      <motion.div
                        key={target.type}
                        data-target-type={target.type}
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
          </motion.div>
        ) : (
          // SHAPE WORKSHEET GENERATOR LAB
          <motion.div
            key="worksheet-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center"
          >
            {/* Control Panel */}
            <div className="w-full bg-purple-100 border-4 border-black p-6 sm:p-8 rounded-[36px] mb-8 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:hidden">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-purple-950" />
                <h2 className="text-xl font-black uppercase tracking-tight text-purple-950">
                  SHAPE MATCHER WORKSHEET LAB
                </h2>
              </div>
              <p className="text-xs font-bold text-purple-900/80 -mt-3 font-sans">
                Create beautiful, highly customized geometry matching worksheets. Switch layout templates, select coloring guidelines, change mascot themes, and export to paper/PDF!
              </p>

              {/* Custom controls grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t-2 border-purple-200">
                {/* 1. Worksheet Layout */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950 font-sans">Worksheet Style</span>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'match_line', name: '✏️ Draw matching line' },
                      { id: 'circle_shape', name: '⭕ Circle shape bubble' },
                      { id: 'cut_and_paste', name: '✂️ Cut & paste shape' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsType(t.id);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
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
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950 font-sans">Number of Items</span>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 5, name: '📄 5 Shapes (One of each)' },
                      { id: 10, name: '📄 10 Shapes (Two of each)' },
                    ] as const).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsShapeCount(n.id);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                          wsShapeCount === n.id
                            ? 'bg-purple-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{n.name}</span>
                        {wsShapeCount === n.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Academy Theme */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950 font-sans">School Mascot Theme</span>
                  <div className="flex flex-col gap-2">
                    {([
                      { id: 'garden', name: '🌸 Shape Academy' },
                      { id: 'meadow', name: '🦋 Rainbow Meadow' },
                      { id: 'fairy', name: '✨ Fairy Castle' },
                    ] as const).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioManager.playPop();
                          setWsMascotTheme(t.id);
                        }}
                        className={`px-4 py-2.5 text-left rounded-xl border-2 border-black font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
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
                <div className="flex flex-col gap-3 font-sans">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">Teacher Options</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border-2 border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        checked={wsShowAnswers}
                        onChange={(e) => {
                          audioManager.playPop();
                          setWsShowAnswers(e.target.checked);
                        }}
                        className="w-4 h-4 accent-purple-600 rounded border-gray-300 cursor-pointer"
                      />
                      <span className="text-[10px] font-black text-gray-700 uppercase">Answer Key</span>
                    </label>

                    <label className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border-2 border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] select-none hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        checked={wsColoringOutlines}
                        onChange={(e) => {
                          audioManager.playPop();
                          setWsColoringOutlines(e.target.checked);
                        }}
                        className="w-4 h-4 accent-purple-600 rounded border-gray-300 cursor-pointer"
                      />
                      <span className="text-[10px] font-black text-gray-700 uppercase">Coloring outlines</span>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      audioManager.playPop();
                      handleGeneratePrintWorksheet();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full bg-amber-300 hover:bg-amber-400 text-black border-2 border-black font-extrabold text-xs uppercase px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
                    Randomize Sheet
                  </button>
                </div>
              </div>

              {/* Print action row */}
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
            <div className="w-full flex justify-center print:w-full print:m-0 print:p-0 font-sans">
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body, html, #app-root, main {
                    background: white !important;
                    background-color: white !important;
                    color: black !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
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

              <div className="bg-white border-4 border-black p-8 sm:p-12 rounded-[44px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-[800px] relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:bg-white text-black text-left">
                {/* Notebook margin line (hidden in print) */}
                <div className="absolute top-0 bottom-0 left-10 w-1 bg-red-400 opacity-20 pointer-events-none print:hidden" />

                {/* Header block */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b-4 border-black pb-6 mb-8 print:flex-row print:justify-between print:pb-2 print:mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 print:w-10 print:h-10 print:rounded-lg ${mascot.bg}`}>
                      <span className="text-2xl print:text-xl">{mascot.emoji}</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 leading-none">{mascot.label}</span>
                      <h1 className="text-2xl font-black tracking-tight uppercase mt-0.5 leading-none print:text-lg">{mascot.title}</h1>
                    </div>
                  </div>

                  {/* Name and Date */}
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

                {/* Instruction Row */}
                <div className="flex justify-between items-center bg-purple-50/50 border-2 border-dashed border-black/20 p-4 rounded-2xl mb-8 print:bg-white print:border-black/30 print:py-2 print:px-3 print:mb-3 print:rounded-xl text-left">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-purple-600 leading-none">Assignment Instructions</p>
                    <p className="text-xs sm:text-sm font-black text-black mt-1 leading-tight">
                      {getWorksheetInstructions()}
                    </p>
                  </div>
                  <div className="border-l-2 border-dashed border-black/20 pl-4 text-center print:border-black/30 flex-shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 font-sans">SCORE</span>
                    <div className="text-sm font-black text-black mt-0.5 font-mono">
                      ______ / {wsShapeCount}
                    </div>
                  </div>
                </div>

                {/* Problem Templates */}
                {wsType === 'match_line' && (
                  <div className="grid grid-cols-2 gap-12 mt-4 print:gap-x-12 print:gap-y-4">
                    {/* Left shapes block */}
                    <div className="flex flex-col gap-5 justify-around">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 leading-none text-left print:hidden">🎨 SHAPE BLOCKS</span>
                      {wsProblems.map((prob, idx) => (
                        <div
                          key={`match-left-${prob.id}-${idx}`}
                          className="print-avoid-break flex items-center justify-between border-2 border-gray-300 p-4 rounded-2xl bg-white min-h-[76px] print:min-h-[56px] print:p-2 print:rounded-xl print:border-black/30 relative"
                        >
                          <span className="absolute top-1 left-1.5 text-[9px] font-black text-gray-300 print:text-black/30 font-mono">
                            {idx + 1}.
                          </span>
                          <div className="flex items-center gap-3 ml-3">
                            <div className="w-12 h-12 flex items-center justify-center">
                              <svg viewBox="0 0 100 100" className="w-10 h-10">
                                <path
                                  d={prob.svgPath}
                                  className={`${
                                    wsColoringOutlines
                                      ? 'fill-white stroke-black stroke-[4px] stroke-dasharray-[3,3]'
                                      : SHAPE_DESIGNS[prob.type].color + ' stroke-black stroke-4'
                                  }`}
                                />
                              </svg>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wide text-gray-800">{prob.label}</span>
                          </div>

                          {/* Connector */}
                          <div className="w-4 h-4 rounded-full border-3 border-black bg-white flex-shrink-0 -mr-6 z-10" />
                        </div>
                      ))}
                    </div>

                    {/* Right targets silhouettes */}
                    <div className="flex flex-col gap-5 justify-around">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 leading-none text-left print:hidden">👤 TARGET SILHOUETTES</span>
                      {shuffledTargets.map((targ, idx) => (
                        <div
                          key={`match-right-${targ.id}-${idx}`}
                          className="print-avoid-break flex items-center justify-start gap-4 border-2 border-black p-4 rounded-2xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] min-h-[76px] print:min-h-[56px] print:p-2 print:rounded-xl print:shadow-none relative"
                        >
                          {/* Connector */}
                          <div className="w-4 h-4 rounded-full border-3 border-black bg-white flex-shrink-0 -ml-6 z-10" />

                          <div className="w-12 h-12 flex items-center justify-center opacity-65">
                            <svg viewBox="0 0 100 100" className="w-10 h-10">
                              <path
                                d={targ.svgPath}
                                className="fill-gray-300 stroke-black stroke-[4px]"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider text-gray-800 font-mono">
                            {targ.label} Frame
                          </span>

                          {/* Answers overlay */}
                          {wsShowAnswers && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {wsProblems.map((p, pIdx) => {
                                if (p.type === targ.type) {
                                  return (
                                    <span key={pIdx} className="text-[8px] font-black bg-blue-100 border border-blue-400 text-blue-800 px-1.5 py-0.5 rounded-full">
                                      Match {pIdx + 1}
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {wsType === 'circle_shape' && (
                  <div className={`grid gap-5 mt-4 print:gap-x-4 print:gap-y-3 ${
                    wsShapeCount === 5
                      ? 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2'
                      : 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
                  }`}>
                    {wsProblems.map((prob, idx) => (
                      <div
                        key={`circle-item-${prob.id}-${idx}`}
                        className="print-avoid-break flex flex-col items-center justify-between p-4 border-2 border-gray-200 rounded-2xl bg-white relative print:py-3 print:px-2 print:rounded-xl print:border-black/30 text-center"
                      >
                        <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 print:text-black font-mono">
                          {idx + 1}.
                        </span>

                        <div className="flex flex-col items-center gap-1.5 mt-1">
                          <svg viewBox="0 0 100 100" className="w-16 h-16">
                            <path
                              d={prob.svgPath}
                              className={`${
                                wsColoringOutlines
                                  ? 'fill-white stroke-black stroke-[4px] stroke-dasharray-[3,3]'
                                  : SHAPE_DESIGNS[prob.type].color + ' stroke-black stroke-4'
                              }`}
                            />
                          </svg>
                          <span className="text-xs font-extrabold uppercase tracking-wide text-black">{prob.label}</span>
                        </div>

                        {/* Choices circle row */}
                        <div className="grid grid-cols-2 gap-1.5 w-full mt-4 border-t border-dashed border-gray-100 pt-3">
                          {SHAPES_LIST.map((shape) => {
                            const isCorrect = shape.type === prob.type;
                            return (
                              <div
                                key={shape.id}
                                className={`py-1.5 px-2 rounded-xl border border-solid border-gray-300 text-[10px] font-black text-center uppercase tracking-wider font-mono flex items-center justify-center gap-0.5 ${
                                  wsShowAnswers && isCorrect
                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-gray-500'
                                }`}
                              >
                                <span>{SHAPE_DESIGNS[shape.type].label}</span>
                                {wsShowAnswers && isCorrect && <Check className="w-3 h-3 text-blue-600 stroke-[4]" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {wsType === 'cut_and_paste' && (
                  <div className="flex flex-col gap-8 mt-4">
                    {/* Cut out zone */}
                    <div className="border-4 border-dashed border-purple-300 p-6 rounded-3xl bg-purple-50/10 relative print:border-black print:p-4">
                      <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-purple-400 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border-2 border-black print:bg-white print:text-black">
                        <Scissors className="w-3.5 h-3.5 stroke-[3]" />
                        CUTTING ZONE (CUT ALONG THE DOTTED LINES)
                      </span>

                      <div className="grid grid-cols-5 gap-4 mt-2 print:gap-x-3 print:gap-y-2">
                        {wsProblems.map((prob, idx) => (
                          <div
                            key={`cut-${prob.id}-${idx}`}
                            className="print-avoid-break border-2 border-dashed border-gray-400 p-3 rounded-xl bg-white flex flex-col items-center justify-center aspect-square relative print:border-black/50"
                          >
                            <svg viewBox="0 0 100 100" className="w-12 h-12">
                              <path
                                d={prob.svgPath}
                                className={`${SHAPE_DESIGNS[prob.type].color} stroke-black stroke-4`}
                              />
                            </svg>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide mt-1 leading-none font-sans">{prob.label}</span>
                            {wsShowAnswers && (
                              <span className="absolute bottom-1 right-1 text-[7px] font-black bg-blue-100 text-blue-800 px-1 rounded-full leading-none">
                                Key: {idx + 1}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pasting zone container outlines */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 leading-none text-left print:text-black">📋 PASTING ZONE (PASTE SHAPES ON THE MATCHING FRAMES)</span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 print:grid-cols-3 print:gap-3">
                        {SHAPES_LIST.map((target, idx) => (
                          <div
                            key={`paste-${target.id}-${idx}`}
                            className="print-avoid-break border-3 border-dotted border-black/45 p-4 rounded-2xl bg-gray-50/10 min-h-[130px] print:min-h-[110px] flex flex-col justify-start items-center relative print:border-black/50"
                          >
                            <div className="flex items-center gap-1.5 bg-white border border-black/45 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider leading-none -mt-7 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                              <span className="font-mono text-[9px]">{SHAPE_DESIGNS[target.type].label} BOARD</span>
                            </div>

                            <div className="flex-grow flex flex-col items-center justify-center py-4 text-center">
                              <div className="w-12 h-12 flex items-center justify-center opacity-25">
                                <svg viewBox="0 0 100 100" className="w-10 h-10">
                                  <path
                                    d={target.svgPath}
                                    className="fill-none stroke-black stroke-[3px] stroke-dasharray-[2,2]"
                                  />
                                </svg>
                              </div>
                              <span className="text-[8px] font-black tracking-widest uppercase text-gray-300 mt-2 font-mono italic select-none">
                                PASTE {SHAPE_DESIGNS[target.type].label.toUpperCase()} HERE
                              </span>
                            </div>

                            {/* Answers overlay */}
                            {wsShowAnswers && (
                              <div className="absolute inset-x-2 bottom-1.5 flex flex-wrap gap-1 items-center justify-center border-t border-dashed border-purple-200 pt-1">
                                {wsProblems.filter(p => p.type === target.type).map((p, pIdx) => (
                                  <span key={pIdx} className="text-[8px] bg-blue-150 border border-blue-400 text-blue-800 px-1 rounded flex items-center gap-1 font-sans">
                                    <span>{p.label} #{pIdx+1}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center text-xs font-extrabold text-purple-600/80 tracking-wide border-t-2 border-dashed border-black/10 pt-6 print:block print:mt-4 print:pt-2">
                  🌟 "Splendid job! You are a brilliant Geometry Champion!" 🌟
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

