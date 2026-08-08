import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, ViewState } from "../types";
import { subjects } from "../data";
import {
  PlayCircle,
  TrendingUp,
  Clock,
  BookMarked,
  X,
  CheckCircle2,
  Loader2,
  CreditCard,
  Bookmark as BookmarkIcon,
} from "lucide-react";

import { getUserDisplayName } from "../lib/utils";
import StudyAnalytics from "./StudyAnalytics";
import BadgeGallery from "./BadgeGallery";

interface DashboardProps {
  user: { email: string; user_metadata?: any } | null;
  onNavigate: (view: ViewState) => void;
  hasPaid: boolean;
  setHasPaid: (val: boolean) => void;
  bookmarks: Bookmark[];
  completedItems: string[];
  onToggleBookmark: (bookmark: Bookmark) => void;
  unlockedBadges?: Record<string, string>;
}

export default function Dashboard({
  user,
  onNavigate,
  hasPaid,
  setHasPaid,
  bookmarks,
  completedItems,
  onToggleBookmark,
  unlockedBadges = {},
}: DashboardProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<
    "idle" | "processing" | "success"
  >("idle");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour === 12) return "Good noon,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
  };

  const displayName = getUserDisplayName(user);

  const handleCheckout = () => {
    if (hasPaid) {
      onNavigate({ view: "examSprint" });
      return;
    }
    setIsCheckoutOpen(true);
    setCheckoutState("idle");
  };

  const processPayment = () => {
    setCheckoutState("processing");
    setTimeout(() => {
      setCheckoutState("success");
      setHasPaid(true);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        onNavigate({ view: "examSprint" });
      }, 1500);
    }, 1500);
  };

  let totalTasks = 0;
  let totalCompletedTasks = 0;
  let totalModules = 0;
  let completedModulesCount = 0;
  let allModulesList: any[] = [];

  subjects.forEach((sub) => {
    sub.modules.forEach((m) => {
      totalModules++;
      let moduleTasks = 0;
      let moduleCompletedTasks = 0;

      if (m.content.studyMaterial.available) {
        moduleTasks++;
        totalTasks++;
        if (completedItems.includes(`${m.id}-material`)) {
          moduleCompletedTasks++;
          totalCompletedTasks++;
        }
        if (m.content.studyMaterial.materials) {
           m.content.studyMaterial.materials.forEach(mat => {
             moduleTasks++;
             totalTasks++;
             if (completedItems.includes(`${m.id}-material-${mat.id}`)) {
                moduleCompletedTasks++;
                totalCompletedTasks++;
             }
           });
        }
      }
      if (m.content.quiz.available) {
        moduleTasks++;
        totalTasks++;
        if (completedItems.includes(`${m.id}-quiz`)) {
          moduleCompletedTasks++;
          totalCompletedTasks++;
        }
      }

      if (moduleCompletedTasks === moduleTasks && moduleTasks > 0) {
        completedModulesCount++;
      }

      allModulesList.push({
        subjectName: sub.name,
        subjectId: sub.id,
        moduleId: m.id,
        moduleName: m.name,
        completed: moduleCompletedTasks,
        total: moduleTasks
      });
    });
  });

  const overallProgressPercentage =
    totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  let nextToLearn = null;
  if (totalCompletedTasks > 0) {
    let inProgressModules = allModulesList.filter(m => m.completed > 0 && m.completed < m.total);
    if (inProgressModules.length > 0) {
      nextToLearn = inProgressModules[inProgressModules.length - 1];
    } else {
      let lastCompletedIdx = -1;
      for (let i = 0; i < allModulesList.length; i++) {
        if (allModulesList[i].completed === allModulesList[i].total && allModulesList[i].total > 0) {
          lastCompletedIdx = i;
        }
      }
      if (lastCompletedIdx !== -1 && lastCompletedIdx + 1 < allModulesList.length) {
        nextToLearn = allModulesList[lastCompletedIdx + 1];
      } else if (lastCompletedIdx !== -1) {
        nextToLearn = allModulesList[lastCompletedIdx];
      }
    }
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-24 md:pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-300 mb-1">
          {getGreeting()}
        </h2>
        <h1 className="text-3xl md:text-5xl font-black text-slate-950 dark:text-white uppercase italic tracking-wide">
          {displayName}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Continue Learning */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white">
              Continue Learning
            </h3>
          </div>

          {nextToLearn ? (
            <button
              onClick={() =>
                onNavigate({
                  view: "moduleDetail",
                  moduleId: nextToLearn.moduleId,
                  moduleName: nextToLearn.moduleName,
                  subjectName: nextToLearn.subjectName,
                })
              }
              className="w-full flex-1 min-h-[220px] bg-[#C19BF5] border-[3px] border-slate-950 text-slate-950 p-8 text-left relative overflow-hidden group shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#FFD54F] rounded-2xl hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="relative z-10 flex flex-col h-full justify-between gap-6 pr-2 sm:pr-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-950 text-xs font-black uppercase tracking-wider bg-white/40 border-2 border-slate-950 w-fit px-3 py-1 rounded-full max-w-full overflow-hidden">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5px] shrink-0" />
                    <span className="truncate max-w-[180px] xs:max-w-[240px] sm:max-w-xs md:max-w-sm" title={nextToLearn.subjectName}>
                      {nextToLearn.subjectName}
                    </span>
                  </div>
                  <h4 className="text-slate-950 text-2xl sm:text-3xl font-black mt-4 max-w-md leading-tight uppercase italic break-words">
                    {nextToLearn.moduleName}
                  </h4>
                </div>

                <div className="flex items-center text-slate-950 font-black text-sm uppercase tracking-wide gap-2 bg-[#FFD54F] border-2 border-slate-950 w-fit px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 transition-transform">
                  <PlayCircle className="w-5 h-5 stroke-[2.5px]" />
                  Continue Learning
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/20 rounded-full translate-x-1/4 translate-y-1/4" />
            </button>
          ) : (
            <div className="w-full flex-1 min-h-[220px] bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col items-center justify-center text-center">
              <BookMarked className="w-12 h-12 text-slate-950 dark:text-white mb-4 stroke-[2.5px]" />
              <h4 className="text-xl font-black text-slate-950 dark:text-white uppercase mb-2">No recent activity</h4>
              <p className="text-slate-650 dark:text-slate-400 max-w-sm text-sm font-bold leading-relaxed">Start your journey by selecting a subject from the menu to begin learning.</p>
            </div>
          )}
        </motion.section>

        {/* Semester Snapshot */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white">
              Current Semester
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#A8E6CF] border-2 border-slate-950 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <TrendingUp className="w-7 h-7 text-slate-950 stroke-[2.5px]" />
                </div>
                <div>
                  <p className="text-slate-950 dark:text-white font-black text-lg uppercase tracking-wide leading-tight">
                    Progress
                  </p>
                  <p className="text-slate-655 dark:text-slate-450 text-xs font-bold mt-0.5">
                    {completedModulesCount} / {totalModules} modules done
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-end mb-2">
                  <div className="text-3xl font-black text-slate-950 dark:text-white italic">
                    {overallProgressPercentage}%
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A8E6CF] border-r-2 border-slate-950"
                    style={{ width: `${overallProgressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onNavigate({
                  view: "subjects",
                })
              }
              className="w-full mt-6 py-3.5 bg-[#FFD54F] border-[3px] border-slate-950 text-slate-950 font-black text-sm uppercase tracking-wide rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer"
            >
              View All Subjects
            </button>
          </div>
        </motion.section>
      </div>

      {/* Study Analytics Section */}
      <StudyAnalytics
        completedItems={completedItems}
        completedModulesCount={completedModulesCount}
        totalModules={totalModules}
      />

      {/* Badges and Milestones Gallery */}
      <BadgeGallery unlockedBadges={unlockedBadges} />

      {/* Quick Links */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white mb-4">
          Quick Jump
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <QuickLink
            title="Mathematics-I"
            code="MTH1101"
            color="bg-[#FFD54F]"
            onClick={() =>
              onNavigate({
                view: "modules",
                subjectId: "MTH1101",
                subjectName: "Mathematics-I",
              })
            }
          />
          <QuickLink
            title="Physics-I"
            code="PHY1001"
            color="bg-[#88D3E6]"
            onClick={() =>
              onNavigate({
                view: "modules",
                subjectId: "PHY1001",
                subjectName: "Physics-I",
              })
            }
          />
          <QuickLink
            title="Electronics Devices"
            code="ECE1001"
            color="bg-[#C19BF5]"
            onClick={() =>
              onNavigate({
                view: "modules",
                subjectId: "ECE1001",
                subjectName: "Introduction to Electronics Devices & Circuits",
              })
            }
          />
          <QuickLink
            title="Universal Human Values"
            code="HUM1002"
            color="bg-[#FFD3B6]"
            onClick={() =>
              onNavigate({
                view: "modules",
                subjectId: "HUM1002",
                subjectName: "Universal Human Values and Professional Ethics",
              })
            }
          />
        </div>
      </motion.section>

      {/* Bookmarks */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4 text-slate-950 dark:text-white">
          <BookmarkIcon className="w-5 h-5 stroke-[2.5px]" />
          <h3 className="text-xl font-black uppercase">Bookmarks</h3>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-950 dark:text-white shadow-[2px_2px_0px_0px_#000]">
              <BookmarkIcon className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <p className="text-slate-650 dark:text-slate-400 font-bold">
              You haven't bookmarked any subjects or modules yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.map((bookmark, index) => {
              const bookmarkColors = [
                "bg-[#FFD54F]", // Yellow
                "bg-[#C19BF5]", // Purple
                "bg-[#88D3E6]", // Blue
                "bg-[#FFD3B6]", // Peach
              ];
              const cardColor = bookmarkColors[index % bookmarkColors.length];

              return (
                <div
                  key={bookmark.id}
                  onClick={() => {
                    if (bookmark.type === "subject") {
                      onNavigate({
                        view: "modules",
                        subjectId: bookmark.id,
                        subjectName: bookmark.title,
                      });
                    } else {
                      onNavigate({
                        view: "moduleDetail",
                        moduleId: bookmark.id,
                        moduleName: bookmark.title,
                        subjectName: bookmark.subjectName || "",
                      });
                    }
                  }}
                  className={`${cardColor} p-5 rounded-2xl border-[3px] border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group flex items-start justify-between cursor-pointer text-slate-950 dark:text-slate-950`}
                >
                  <div className="flex-1 pr-3 truncate text-slate-950 dark:text-slate-950">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-slate-950 dark:text-slate-950 uppercase tracking-widest bg-white/40 border border-slate-950 px-2 py-0.5 rounded">
                        {bookmark.type}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-800 truncate max-w-[120px]">
                        {bookmark.subtitle}
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-slate-950 dark:text-slate-950 leading-tight uppercase italic group-hover:underline truncate">
                      {bookmark.title}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(bookmark);
                    }}
                    className="w-10 h-10 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FF603D] hover:scale-105 active:translate-y-0.5 transition-all cursor-pointer text-slate-950"
                    title="Remove Bookmark"
                  >
                    <BookmarkIcon className="w-4 h-4 text-slate-950 fill-slate-950 stroke-[2px]" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden relative"
            >
              {checkoutState === "idle" && (
                <>
                  <div className="p-6 border-b-[3px] border-slate-950 dark:border-slate-800 flex items-center justify-between bg-[#C19BF5]">
                    <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-wide">
                      Secure Checkout
                    </h3>
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-8 h-8 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center text-slate-950 hover:scale-115 active:scale-95 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-2 border-slate-950">
                      <div className="w-12 h-12 bg-[#FFD54F] border-2 border-slate-950 text-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                        <CreditCard className="w-6 h-6 stroke-[2.5px]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-950 dark:text-white leading-tight uppercase italic mb-0.5">
                          Last Minute Exam Kit
                        </h4>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Full Sem 1 Access
                        </p>
                      </div>
                      <div className="ml-auto font-black text-2xl text-slate-950 dark:text-white">
                        ₹199
      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-black uppercase text-slate-950 dark:text-white">
                        Card Details
                      </label>
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full px-4 py-3 border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl focus:outline-none font-bold"
                        defaultValue="4242 4242 4242 4242"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl focus:outline-none font-bold"
                          defaultValue="12/26"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="w-full px-4 py-3 border-2 border-slate-950 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl focus:outline-none font-bold"
                          defaultValue="123"
                        />
                      </div>
                    </div>

                    <button
                      onClick={processPayment}
                      className="w-full bg-[#FF603D] border-[3px] border-slate-950 text-slate-950 font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Pay ₹199
                    </button>
                  </div>
                </>
              )}

              {checkoutState === "processing" && (
                <div className="p-12 flex flex-col items-center justify-center text-center min-h-[350px]">
                  <Loader2 className="w-12 h-12 text-slate-950 dark:text-white animate-spin mb-6 stroke-[3px]" />
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-2 uppercase tracking-wide">
                    Processing...
                  </h3>
                  <p className="text-slate-650 dark:text-slate-400 font-bold">
                    Please do not close this window.
                  </p>
                </div>
              )}

              {checkoutState === "success" && (
                <div className="p-12 flex flex-col items-center justify-center text-center min-h-[350px]">
                  <div className="w-20 h-20 bg-[#A8E6CF] border-2 border-slate-950 text-slate-950 rounded-full flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#000]">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5px]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-2 uppercase tracking-wide">
                    Payment Successful!
                  </h3>
                  <p className="text-slate-650 dark:text-slate-400 font-bold">
                    You now have access to the Exam Kit.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickLink({
  title,
  code,
  color,
  onClick,
}: {
  title: string;
  code: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} p-5 rounded-xl border-[3px] border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-slate-950 text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group flex items-start justify-between cursor-pointer`}
    >
      <div>
        <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest bg-white/40 border border-slate-950 px-1.5 py-0.5 rounded block w-fit mb-2">
          {code}
        </span>
        <span className="font-extrabold text-slate-950 block leading-snug truncate max-w-[170px] uppercase italic">
          {title}
        </span>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/40 border-2 border-slate-950 flex items-center justify-center shrink-0">
        <BookMarked className="w-4 h-4 text-slate-950 stroke-[2px]" />
      </div>
    </button>
  );
}
