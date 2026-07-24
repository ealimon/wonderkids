import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScoreState, GameType } from '../types';
import { audioManager } from '../utils/audio';
import {
  Trophy,
  Award,
  Star,
  Printer,
  X,
  Sparkles,
  CheckCircle,
  Medal,
  Heart,
  Crown
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreState: ScoreState;
}

const BADGES: { id: GameType; title: string; emoji: string; skill: string; bg: string }[] = [
  { id: 'sorter', title: 'Color Sorter Master', emoji: '🎨', skill: 'Colors & Sorting', bg: 'bg-yellow-300' },
  { id: 'matcher', title: 'Shape Matcher Genius', emoji: '🧩', skill: 'Shapes & Spatial', bg: 'bg-sky-400' },
  { id: 'pattern', title: 'Logic Train Engineer', emoji: '✨', skill: 'Patterns & Logic', bg: 'bg-purple-400' },
  { id: 'garden', title: 'Garden Counting Hero', emoji: '🌸', skill: 'Counting 1-10', bg: 'bg-rose-400' },
  { id: 'phonics', title: 'Phonics Explorer', emoji: '🦁', skill: 'Words & Phonics', bg: 'bg-pink-400' },
  { id: 'math', title: 'Math Addition Star', emoji: '➕', skill: 'Adding Numbers', bg: 'bg-emerald-400' },
  { id: 'subtraction', title: 'Subtraction Wizard', emoji: '➖', skill: 'Subtracting Numbers', bg: 'bg-teal-400' },
  { id: 'reading', title: 'Sight Word Champion', emoji: '📖', skill: 'Reading Sentences', bg: 'bg-purple-400' },
];

const BUDDIES = [
  { id: 'teddy', emoji: '🧸', name: 'Teddy' },
  { id: 'lion', emoji: '🦁', name: 'Leo Lion' },
  { id: 'unicorn', emoji: '🦄', name: 'Sparkles' },
  { id: 'rocket', emoji: '🚀', name: 'Cosmo' },
  { id: 'kitty', emoji: '🐱', name: 'Whiskers' },
  { id: 'puppy', emoji: '🐶', name: 'Barnaby' },
  { id: 'artist', emoji: '🎨', name: 'Picasso' },
];

export default function CertificateModal({ isOpen, onClose, scoreState }: CertificateModalProps) {
  const [activeTab, setActiveTab] = useState<'trophies' | 'certificate'>('certificate');
  const [childName, setChildName] = useState('Wonderkid Scholar');
  const [selectedBuddy, setSelectedBuddy] = useState('🧸');

  if (!isOpen) return null;

  const handlePrint = () => {
    audioManager.playPop();
    window.print();
  };

  const completedCount = Object.keys(scoreState.completedGames).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static print:z-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white border-4 border-black rounded-[36px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none"
        >
          {/* Top Bar Controls (Hidden in Print) */}
          <div className="flex items-center justify-between px-6 py-4 bg-orange-400 border-b-4 border-black print:hidden">
            <div className="flex items-center gap-2 text-white font-black">
              <Trophy className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              <span className="text-lg uppercase tracking-tight">WONDERKIDS TROPHY & CERTIFICATE CENTER</span>
            </div>

            <button
              onClick={() => {
                audioManager.playPop();
                onClose();
              }}
              className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Modal Header Tabs (Hidden in Print) */}
          <div className="flex border-b-4 border-black bg-yellow-100 p-2 gap-2 print:hidden">
            <button
              onClick={() => {
                audioManager.playPop();
                setActiveTab('certificate');
              }}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black transition-all cursor-pointer ${
                activeTab === 'certificate'
                  ? 'bg-yellow-300 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📜 MY OFFICIAL CERTIFICATE
            </button>
            <button
              onClick={() => {
                audioManager.playPop();
                setActiveTab('trophies');
              }}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black transition-all cursor-pointer ${
                activeTab === 'trophies'
                  ? 'bg-emerald-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏆 BADGES & TROPHIES ({completedCount}/8)
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-grow print:p-0 print:overflow-visible">
            {activeTab === 'certificate' ? (
              <div className="flex flex-col gap-6">
                {/* Certificate Customizer Options (Hidden in Print) */}
                <div className="bg-orange-50 border-3 border-black p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                      Child's Name on Certificate:
                    </label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Enter name..."
                      className="w-full px-4 py-2 border-2 border-black rounded-xl font-extrabold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-700 mb-1 text-center sm:text-left">
                      Choose Buddy:
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {BUDDIES.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            audioManager.playPop();
                            setSelectedBuddy(b.emoji);
                          }}
                          className={`w-9 h-9 rounded-xl border-2 border-black text-xl flex items-center justify-center transition-all cursor-pointer ${
                            selectedBuddy === b.emoji
                              ? 'bg-yellow-300 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                          title={b.name}
                        >
                          {b.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="w-full sm:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer self-end"
                  >
                    <Printer className="w-4 h-4" />
                    PRINT CERTIFICATE
                  </button>
                </div>

                {/* PRINTABLE CERTIFICATE PREVIEW CARD */}
                <div
                  id="printable-certificate"
                  className="bg-[#FFFDF9] border-[8px] border-double border-amber-600 p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-inner flex flex-col items-center text-center print:border-[12px] print:m-0 print:p-8 print:w-full print:h-full"
                >
                  {/* Decorative Corner Ornaments */}
                  <div className="absolute top-3 left-3 text-2xl select-none">👑</div>
                  <div className="absolute top-3 right-3 text-2xl select-none">✨</div>
                  <div className="absolute bottom-3 left-3 text-2xl select-none">🌟</div>
                  <div className="absolute bottom-3 right-3 text-2xl select-none">🏆</div>

                  {/* Top Seal Badge */}
                  <div className="bg-yellow-300 border-4 border-black p-3 rounded-full mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-4xl">{selectedBuddy}</span>
                  </div>

                  <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-600">
                    WONDERKIDS EARLY LEARNING ACADEMY
                  </span>

                  <h2
                    className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 my-2 uppercase italic"
                    style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
                  >
                    CERTIFICATE OF EXCELLENCE
                  </h2>

                  <p className="text-xs sm:text-sm font-bold text-gray-600 max-w-md">
                    This official award is proudly presented to:
                  </p>

                  <div className="my-4 border-b-4 border-dashed border-amber-500 px-8 py-2 min-w-[260px]">
                    <span className="text-3xl sm:text-4xl font-black text-orange-600 font-sans italic tracking-wide">
                      {childName || 'Wonderkid Scholar'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-gray-700 max-w-lg leading-relaxed mb-6">
                    for outstanding enthusiasm, curiosity, and completing educational adventures in logic, colors, counting, phonics, math, and reading!
                  </p>

                  {/* Highlights Grid */}
                  <div className="w-full max-w-md bg-amber-100/60 border-2 border-amber-300 rounded-2xl p-4 my-2 grid grid-cols-2 gap-3 text-left font-sans">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-black flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-black uppercase text-gray-500">Total Stars</div>
                        <div className="text-base font-black text-black">{scoreState.stars} Stars Earned</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-black uppercase text-gray-500">Activities</div>
                        <div className="text-base font-black text-black">{completedCount} Games Completed</div>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="w-full max-w-md flex justify-between items-end mt-8 pt-4 border-t-2 border-amber-200 text-left font-sans">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm italic text-gray-800">Teddy & Friends</span>
                      <span className="text-[10px] font-black uppercase text-gray-400 border-t border-gray-400 pt-0.5 mt-1">
                        Wonderkids Mascot
                      </span>
                    </div>

                    {/* Golden Star Emblem */}
                    <div className="w-16 h-16 rounded-full bg-yellow-400 border-4 border-black flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-12">
                      🌟
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="font-mono font-bold text-xs text-gray-700">
                        {new Date().toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-black uppercase text-gray-400 border-t border-gray-400 pt-0.5 mt-1">
                        Date Issued
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // TROPHIES & BADGES GALLERY TAB
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight">YOUR LEARNING BADGES GALLERY</h3>
                  <p className="text-xs font-bold text-gray-600 mt-1">
                    Play and complete activities to unlock all 8 shiny skill badges!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {BADGES.map((badge) => {
                    const timesPlayed = scoreState.completedGames[badge.id] || 0;
                    const isUnlocked = timesPlayed > 0;

                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-2xl border-3 border-black flex flex-col items-center text-center transition-all relative ${
                          isUnlocked
                            ? `${badge.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-100`
                            : 'bg-gray-100 text-gray-400 border-dashed opacity-60'
                        }`}
                      >
                        {isUnlocked && (
                          <div className="absolute top-2 right-2 bg-emerald-400 text-black rounded-full p-1 border border-black">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <span className="text-4xl my-2 filter drop-shadow-sm">{badge.emoji}</span>
                        <h4 className="font-black text-xs uppercase leading-tight mt-1">{badge.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase mt-1 opacity-80">
                          {badge.skill}
                        </span>

                        <div className="mt-3 pt-2 border-t border-black/20 w-full text-[10px] font-black">
                          {isUnlocked ? `Completed ${timesPlayed}x` : 'Locked'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
