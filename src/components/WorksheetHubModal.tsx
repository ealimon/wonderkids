import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';
import { GameType } from '../types';
import {
  X,
  Printer,
  Sparkles,
  BookOpen,
  Plus,
  Minus,
  Sparkle,
  Layers,
  Shapes,
  Palette,
  Flower2,
  Share2,
  ChevronRight,
  Info
} from 'lucide-react';

interface WorksheetHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorksheet: (game: GameType) => void;
}

interface WorksheetSubject {
  id: GameType;
  title: string;
  category: string;
  emoji: string;
  description: string;
  types: string[];
  color: string;
  accentBg: string;
  icon: typeof Printer;
}

const WORKSHEET_SUBJECTS: WorksheetSubject[] = [
  {
    id: 'math',
    title: 'Math Addition Lab',
    category: 'MATH & COUNTING',
    emoji: '➕',
    description: 'Customizable sums up to 10 with illustrated picture items, tens frames, and full teacher answer key.',
    types: ['Illustrated Math', 'Number Equations', 'Tens Frame Counting'],
    color: 'bg-emerald-400 text-gray-900 border-black',
    accentBg: 'bg-emerald-100',
    icon: Plus,
  },
  {
    id: 'subtraction',
    title: 'Math Subtraction Lab',
    category: 'MATH & TAKING AWAY',
    emoji: '➖',
    description: 'Visual cross-out problems, basic subtraction facts, and teacher answer keys.',
    types: ['Visual Take-Away', 'Cross-Out Counting', 'Subtraction Facts'],
    color: 'bg-teal-400 text-white border-black',
    accentBg: 'bg-teal-100',
    icon: Minus,
  },
  {
    id: 'phonics',
    title: 'Phonics & CVC Spelling',
    category: 'READING & PHONICS',
    emoji: '🦁',
    description: 'Word box letter spelling, missing beginning sounds, vowel identification, and tracing guide lines.',
    types: ['Box Spelling', 'Beginning Sounds', 'Middle Vowels', 'Letter Tracing'],
    color: 'bg-pink-400 text-white border-black',
    accentBg: 'bg-pink-100',
    icon: BookOpen,
  },
  {
    id: 'reading',
    title: 'Sight Word & Story Reading',
    category: 'EARLY LITERACY',
    emoji: '📖',
    description: 'CVC decodable sentences, picture-to-sentence matching, and reading comprehension check marks.',
    types: ['Sentence Matching', 'Sight Words', 'Reading Comprehension'],
    color: 'bg-purple-400 text-white border-black',
    accentBg: 'bg-purple-100',
    icon: BookOpen,
  },
  {
    id: 'sorter',
    title: 'Color Sorting & Matching',
    category: 'COLORS & VISUAL LOGIC',
    emoji: '🎨',
    description: 'Color-matching line connections, circle correct colors, and cut & paste bucket sorting.',
    types: ['Match by Line', 'Circle Color', 'Cut & Paste Sorting'],
    color: 'bg-yellow-300 text-black border-black',
    accentBg: 'bg-yellow-100',
    icon: Palette,
  },
  {
    id: 'matcher',
    title: 'Shape Explorer & Geometry',
    category: 'GEOMETRY & SPATIAL',
    emoji: '🔺',
    description: 'Circle, Square, Triangle, Star, Diamond, Heart matching with traceable outlines.',
    types: ['Shape Outlines', 'Silhouette Matching', 'Cut & Glue'],
    color: 'bg-sky-400 text-white border-black',
    accentBg: 'bg-sky-100',
    icon: Shapes,
  },
  {
    id: 'pattern',
    title: 'Pattern Train & Sequences',
    category: 'LOGIC & SEQUENCES',
    emoji: '🚂',
    description: 'AB, AAB, ABB, and ABC repeating sequence challenges with illustrated shape clues.',
    types: ['Draw What Is Next', 'Circle Missing Item', 'Cut & Paste Sequence'],
    color: 'bg-purple-400 text-white border-black',
    accentBg: 'bg-purple-100',
    icon: Layers,
  },
  {
    id: 'garden',
    title: 'Counting Garden Numbers',
    category: 'NUMBER SENSE',
    emoji: '🌱',
    description: 'Count garden blooms, match numerals, circle correct quantities, and dot counting.',
    types: ['Count & Write', 'Number Matching', 'Garden Quantities'],
    color: 'bg-rose-400 text-white border-black',
    accentBg: 'bg-rose-100',
    icon: Flower2,
  },
];

export default function WorksheetHubModal({
  isOpen,
  onClose,
  onSelectWorksheet,
}: WorksheetHubModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto print:hidden"
        onClick={onClose}
        id="worksheet-hub-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className="bg-[#FFFBF5] border-4 border-black rounded-[40px] p-6 sm:p-10 max-w-4xl w-full shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] text-black relative my-auto max-h-[90vh] overflow-y-auto flex flex-col gap-6"
          onClick={(e) => e.stopPropagation()}
          id="worksheet-hub-card"
        >
          {/* Close button */}
          <button
            onClick={() => {
              audioManager.playPop();
              onClose();
            }}
            className="absolute top-6 right-6 w-12 h-12 bg-rose-400 hover:bg-rose-500 text-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer z-20"
            id="close-hub-modal-btn"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col gap-2 pr-12">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500 text-white border-2 border-black font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                🖨️ TEACHER & PARENT PRINTABLES
              </span>
              <span className="bg-yellow-300 text-black border-2 border-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                8 WORKSHEET LABS
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black italic mt-1"
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              PRINTABLE WORKSHEETS & LABS
            </h2>
            <p className="text-sm sm:text-base font-bold text-gray-700 font-sans leading-relaxed">
              Every learning activity includes a fully customizable, high-resolution worksheet generator with answer keys and native AirPrint & PDF sharing. Choose a subject below to customize and print!
            </p>
          </div>

          {/* iPad AirPrint & Sharing Tip Banner */}
          <div className="bg-sky-100 border-3 border-black rounded-2xl p-4 flex items-start gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-sans">
            <Info className="w-6 h-6 text-sky-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-bold text-sky-950 leading-relaxed">
              <span className="font-black text-black">Printing on Apple iPad / iPhone:</span> When you tap <span className="font-black text-purple-700">PRINT / DOWNLOAD PDF</span> inside any lab, your iPad will automatically open the native AirPrint & Share sheet so you can print wirelessly, save to Photos, or export to Apple Files!
            </div>
          </div>

          {/* Grid of Worksheets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-2">
            {WORKSHEET_SUBJECTS.map((item) => (
              <div
                key={item.id}
                className={`${item.color} rounded-3xl p-5 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:scale-[1.01] transition-transform relative overflow-hidden`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-white text-black border-2 border-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {item.category}
                    </span>
                    <span className="text-3xl filter drop-shadow-sm">{item.emoji}</span>
                  </div>

                  <h3
                    className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-3 mb-1"
                    style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-extrabold opacity-90 font-sans leading-snug">
                    {item.description}
                  </p>

                  {/* Worksheet modes pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.types.map((type, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-black/10 text-current font-black text-[10px] px-2 py-0.5 rounded-md border border-current/20 uppercase"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t-2 border-current/15 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase tracking-wider opacity-80 font-sans">
                    Includes Answer Key
                  </span>
                  <button
                    onClick={() => {
                      audioManager.playPop();
                      onSelectWorksheet(item.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 stroke-[3]" />
                    OPEN WORKSHEET
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Close */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                audioManager.playPop();
                onClose();
              }}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-black border-3 border-black font-black uppercase rounded-2xl text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              CLOSE WINDOW
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
