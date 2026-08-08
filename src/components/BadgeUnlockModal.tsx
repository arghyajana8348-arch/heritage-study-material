import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { BADGES, Badge } from "../badges";
import {
  Trophy,
  Target,
  BookOpen,
  Sparkles,
  Award,
  Zap,
  CheckCheck,
  Crown,
  X,
  Sparkle,
} from "lucide-react";

interface BadgeUnlockModalProps {
  badgeId: string | null;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Target: <Target className="w-10 h-10 stroke-[2.5px]" />,
  Trophy: <Trophy className="w-10 h-10 stroke-[2.5px]" />,
  BookOpen: <BookOpen className="w-10 h-10 stroke-[2.5px]" />,
  Sparkles: <Sparkles className="w-10 h-10 stroke-[2.5px]" />,
  Award: <Award className="w-10 h-10 stroke-[2.5px]" />,
  Zap: <Zap className="w-10 h-10 stroke-[2.5px]" />,
  CheckCheck: <CheckCheck className="w-10 h-10 stroke-[2.5px]" />,
  Crown: <Crown className="w-10 h-10 stroke-[2.5px]" />,
};

export default function BadgeUnlockModal({
  badgeId,
  onClose,
}: BadgeUnlockModalProps) {
  if (!badgeId) return null;

  const badge: Badge | undefined = BADGES.find((b) => b.id === badgeId);
  if (!badge) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border-[4px] border-slate-950 dark:border-white rounded-3xl p-6 sm:p-8 shadow-[10px_10px_0px_0px_#000] dark:shadow-[10px_10px_0px_0px_#FFD54F] z-10 text-center flex flex-col items-center"
        >
          {/* Confetti decoration banner */}
          <div className="absolute -top-5 px-4 py-1 bg-[#FF603D] border-2 border-slate-950 rounded-full font-black text-xs uppercase italic tracking-wider text-slate-950 shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5 animate-bounce">
            <Sparkle className="w-4 h-4 fill-amber-300 text-slate-950" />
            Milestone Reached!
            <Sparkle className="w-4 h-4 fill-amber-300 text-slate-950" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 text-slate-950 dark:text-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000] hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[3px]" />
          </button>

          {/* Badge Icon Display */}
          <div
            className="w-24 h-24 mt-4 rounded-2xl border-[3px] border-slate-950 flex items-center justify-center text-slate-950 shadow-[6px_6px_0px_0px_#000] rotate-[-4deg] mb-6"
            style={{ backgroundColor: badge.color }}
          >
            {ICON_MAP[badge.icon] || <Trophy className="w-10 h-10" />}
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-950/20 px-3 py-1 rounded-full mb-2">
            Badge Unlocked
          </span>

          <h3 className="text-2xl sm:text-3xl font-black uppercase italic text-slate-950 dark:text-white mb-2 leading-none">
            {badge.title}
          </h3>

          <p className="text-sm font-bold text-slate-650 dark:text-slate-300 mb-6 max-w-xs leading-relaxed">
            {badge.description}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#FFD54F] border-[3px] border-slate-950 text-slate-950 font-black text-sm uppercase italic tracking-wider rounded-xl shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            Awesome! Claim Badge
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
