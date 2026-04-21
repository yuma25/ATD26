"use client";

import { motion } from "framer-motion";
import {
  Lock,
  Check,
  Shield,
  Zap,
  Star,
  Trophy,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { Badge } from "../backend/types";

const IconMap: Record<string, LucideIcon> = {
  "butterfly-001": Shield,
  "zap-002": Zap,
  "star-003": Star,
  "trophy-004": Trophy,
};

interface BadgeCardProps {
  badge: Badge;
  isAcquired: boolean;
}

export const BadgeCard = ({ badge, isAcquired }: BadgeCardProps) => {
  const Icon = IconMap[badge.id] || HelpCircle;
  const locked = !isAcquired;

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex items-center gap-8 relative overflow-hidden"
    >
      <div
        className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 ${
          locked
            ? "bg-slate-50 text-slate-200"
            : "bg-blue-50 text-blue-600 shadow-inner"
        }`}
        style={{
          backgroundColor: locked ? undefined : `${badge.color}15`,
          color: locked ? undefined : badge.color,
        }}
      >
        {locked ? (
          <Lock size={32} strokeWidth={1.5} />
        ) : (
          <Icon size={40} strokeWidth={2} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3
            className={`text-2xl font-bold tracking-tight ${locked ? "text-slate-300" : "text-slate-900"}`}
          >
            {badge.name}
          </h3>
          {!locked && (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Check size={14} className="text-white" strokeWidth={4} />
            </div>
          )}
        </div>
        <p
          className={`text-sm ${locked ? "text-slate-200" : "text-slate-500"} font-medium leading-relaxed`}
        >
          {badge.description}
        </p>
      </div>

      {locked && (
        <div className="absolute top-6 right-8 text-slate-100">
          <Lock size={20} />
        </div>
      )}
    </motion.div>
  );
};
