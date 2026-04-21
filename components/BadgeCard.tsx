'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Box, Wind, Bug, Leaf, Feather, Flower2, CircleDot, X, LucideIcon, PenTool, MapPin } from 'lucide-react';
import { Badge } from '../backend/types';

const IconMap: Record<string, LucideIcon> = {
  'painting-001': Bug,      // 標本 A
  'painting-002': Flower2,  // 標本 B
  'painting-003': Leaf,     // 標本 C
  'painting-004': Feather,  // 標本 D
  'painting-005': CircleDot,// 標本 E
  'painting-006': MapPin,   // 標本 F
  'butterfly-001': Bug,
};

interface BadgeCardProps {
  badge: Badge;
  isAcquired: boolean;
}

export const BadgeCard = ({ badge, isAcquired }: BadgeCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const Icon = IconMap[badge.id] || CircleDot;
  const locked = !isAcquired;

  const handleOpenViewer = () => {
    window.location.assign(`/viewer?model=${encodeURIComponent(badge.model_url)}&name=${encodeURIComponent(badge.name)}`);
  };

  const handleRelease = () => {
    window.location.assign(`/release?model=${encodeURIComponent(badge.model_url)}&name=${encodeURIComponent(badge.name)}`);
  };

  // アルバム風のランダムな傾きを生成
  const rotation = isAcquired ? (parseInt(badge.id.slice(-1)) % 2 === 0 ? 1.5 : -1.5) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={!locked ? { scale: 1.02, rotate: 0, zIndex: 50 } : {}}
      viewport={{ once: true }}
      className="relative flex justify-center w-full group"
      style={{ rotate: `${rotation}deg` }}
    >
      {/* 貼り付け用のマスキングテープ (さらに不規則に) */}
      {!locked && (
        <>
          <div className="tape -top-5 left-1/2 -translate-x-1/2 opacity-80" />
          <div className="tape -bottom-4 right-0 w-12 rotate-[45deg] opacity-40 scale-75" />
        </>
      )}

      <div 
        onClick={() => !locked && !showActions && setShowActions(true)}
        className={`
          relative w-full max-w-[300px] min-h-[320px] p-10 flex flex-col items-center justify-center text-center transition-all duration-500
          ${locked ? 'border-2 border-dashed border-[#3e2f28]/10 bg-white/30 grayscale sepia opacity-40' : 'bg-[#fffdf5] shadow-md border border-[#dcd4c0]'}
        `}
      >
        <AnimatePresence mode="wait">
          {locked ? (
            <motion.div key="locked" className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 border border-dashed border-[#3e2f28]/20 rounded-full flex items-center justify-center">
                <Lock size={24} strokeWidth={1} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">Uncharted Area</p>
            </motion.div>
          ) : showActions ? (
            <motion.div 
              key="actions"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full space-y-6"
            >
              <div className="border-b border-[#3e2f28]/20 pb-4 mb-6">
                <p className="font-data text-[8px] uppercase tracking-[0.2em] mb-2 opacity-50">Journal Entry</p>
                <h2 className="text-2xl font-bold italic font-serif text-[#3e2f28]">{badge.name}</h2>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleOpenViewer}
                  className="w-full py-3 bg-[#3e2f28] text-[#fdfaf2] flex items-center justify-center gap-3 hover:bg-[#5a463b] transition-colors shadow-md"
                >
                  <PenTool size={16} />
                  <span className="font-data text-[10px] uppercase tracking-widest font-bold text-white">Detailed Sketch</span>
                </button>

                <button 
                  onClick={handleRelease}
                  className="w-full py-3 border border-[#3e2f28] text-[#3e2f28] flex items-center justify-center gap-3 hover:bg-[#3e2f28]/5 transition-colors"
                >
                  <Wind size={16} />
                  <span className="font-data text-[10px] uppercase tracking-widest font-bold">Release to Wild</span>
                </button>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
                className="pt-6 text-[9px] font-mono uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity"
              >
                Close Page
              </button>
            </motion.div>
          ) : (
            <motion.div key="sketch" className="flex flex-col items-center gap-6 w-full">
              {/* スケッチアイコン（細い線） */}
              <div className="relative p-6">
                <Icon size={80} strokeWidth={0.5} className="text-[#3e2f28]/80 drop-shadow-sm" />
                <div className="absolute inset-0 border border-[#3e2f28]/10 rounded-full scale-125 border-dashed" />
              </div>

              <div className="space-y-1 mt-4">
                <h3 className="text-xl font-bold italic text-[#3e2f28]/90 font-serif leading-tight">
                  {badge.name}
                </h3>
                <p className="font-data text-[8px] text-[#3e2f28]/40 uppercase tracking-tighter">
                  OBSERVED AT NODE_{badge.id.slice(0,4)}
                </p>
              </div>
              
              <div className="mt-8 flex items-center gap-2 opacity-30">
                <span className="w-8 h-[1px] bg-current" />
                <span className="text-[7px] font-mono uppercase tracking-[0.2em]">Open Entry</span>
                <span className="w-8 h-[1px] bg-current" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
