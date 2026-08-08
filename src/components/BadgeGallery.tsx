import React from "react";
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
  Lock,
  CheckCircle2,
} from "lucide-react";

interface BadgeGalleryProps {
  unlockedBadges: Record<string, string>; // badgeId -> timestamp
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Target: <Target className="w-6 h-6 stroke-[2.5px]" />,
  Trophy: <Trophy className="w-6 h-6 stroke-[2.5px]" />,
  BookOpen: <BookOpen className="w-6 h-6 stroke-[2.5px]" />,
  Sparkles: <Sparkles className="w-6 h-6 stroke-[2.5px]" />,
  Award: <Award className="w-6 h-6 stroke-[2.5px]" />,
  Zap: <Zap className="w-6 h-6 stroke-[2.5px]" />,
  CheckCheck: <CheckCheck className="w-6 h-6 stroke-[2.5px]" />,
  Crown: <Crown className="w-6 h-6 stroke-[2.5px]" />,
};

export default function BadgeGallery({ unlockedBadges }: BadgeGalleryProps) {
  const unlockedCount = Object.keys(unlockedBadges).length;
  const totalBadges = BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-slate-950/10 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-6 h-6 text-[#FF603D] stroke-[2.5px]" />
            <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase italic tracking-wide">
              Virtual Badges & Milestones
            </h3>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Earn rewards by completing study modules, quizzes, and AI practice.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 bg-[#FFD54F] border-2 border-slate-950 px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#000] shrink-0 self-start sm:self-auto">
          <Award className="w-4 h-4 text-slate-955 stroke-[2.5px]" />
          <span className="text-xs font-black text-slate-955 uppercase tracking-wide">
            {unlockedCount} / {totalBadges} Badges ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGES.map((badge: Badge) => {
          const isUnlocked = !!unlockedBadges[badge.id];
          const unlockedAt = unlockedBadges[badge.id];

          return (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                isUnlocked
                  ? "bg-slate-50 dark:bg-slate-800/60 border-slate-950 dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFD54F]"
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 opacity-60 grayscale-[0.6]"
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-14 h-14 rounded-xl border-2 border-slate-950 flex items-center justify-center text-slate-955 mb-3 shadow-[2px_2px_0px_0px_#000] ${
                  isUnlocked ? "rotate-[-2deg]" : "bg-slate-200 dark:bg-slate-800"
                }`}
                style={{ backgroundColor: isUnlocked ? badge.color : undefined }}
              >
                {isUnlocked ? (
                  ICON_MAP[badge.icon] || <Trophy className="w-6 h-6" />
                ) : (
                  <Lock className="w-6 h-6 text-slate-400 stroke-[2px]" />
                )}
              </div>

              {/* Badge Info */}
              <h4 className="font-black text-sm text-slate-950 dark:text-white uppercase italic leading-tight mb-1">
                {badge.title}
              </h4>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-snug mb-3">
                {badge.description}
              </p>

              {/* Status Tag */}
              <div className="mt-auto pt-2 border-t border-slate-950/10 dark:border-slate-800 w-full flex items-center justify-center">
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
