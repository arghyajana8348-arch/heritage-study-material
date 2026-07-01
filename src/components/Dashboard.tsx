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

interface DashboardProps {
  user: { email: string } | null;
  onNavigate: (view: ViewState) => void;
  hasPaid: boolean;
  setHasPaid: (val: boolean) => void;
  bookmarks: Bookmark[];
  completedItems: string[];
}

export default function Dashboard({
  user,
  onNavigate,
  hasPaid,
  setHasPaid,
  bookmarks,
  completedItems,
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

  const displayName = user?.email
    ? user.email
        .split("@")[0]
        .split(".")
        .filter((part) => !part.match(/cse|it|ece|ee|me|ce|\d+/i)) // Filter out department codes and numbers
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Engineering Student";

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
    <div className="p-4 md:p-0 space-y-8 md:space-y-12 pb-24 md:pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-base font-medium text-slate-500 dark:text-slate-400 mb-1">
          {getGreeting()}
        </h2>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
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
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
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
              className="w-full flex-1 min-h-[220px] bg-indigo-600 dark:bg-indigo-600 rounded-3xl p-8 text-left relative overflow-hidden group hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-xl shadow-indigo-900/10 dark:shadow-none flex flex-col justify-between active:scale-[0.98]"
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-100 dark:text-indigo-50 text-sm font-medium mb-3 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="w-4 h-4" />
                    <span>{nextToLearn.subjectName}</span>
                  </div>
                  <h4 className="text-white text-3xl font-bold mb-4 pr-8 max-w-md leading-tight">
                    {nextToLearn.moduleName}
                  </h4>
                </div>

                <div className="flex items-center text-indigo-50 font-medium text-base gap-2 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <PlayCircle className="w-5 h-5" />
                  Continue Learning
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl transition-transform group-hover:scale-110" />
              <div className="absolute top-0 right-10 w-32 h-32 bg-indigo-400/30 rounded-full -translate-y-1/2 blur-2xl" />
            </button>
          ) : (
            <div className="w-full flex-1 min-h-[220px] bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
              <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No recent activity</h4>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">Start your journey by selecting a subject from the menu to begin learning.</p>
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
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Current Semester
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors flex-1 flex flex-col justify-center">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-bold text-xl">
                    Overall Progress
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                    {completedModulesCount} of {totalModules} modules
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-end mb-2">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {overallProgressPercentage}%
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
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
              className="w-full mt-8 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              View All Subjects
            </button>
          </div>
        </motion.section>
      </div>

      {/* Quick Links */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Quick Jump
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink
            title="Mathematics-I"
            code="MTH1101"
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
        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200">
          <BookmarkIcon className="w-5 h-5" />
          <h3 className="text-xl font-semibold">Bookmarks</h3>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <BookmarkIcon className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">
              You haven't bookmarked any subjects or modules yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bookmarks.map((bookmark) => (
              <button
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
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 text-left transition-all group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded block w-fit">
                      {bookmark.type}
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 line-clamp-1">
                      {bookmark.subtitle}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {bookmark.title}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors shrink-0">
                  <BookmarkIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 fill-indigo-500 dark:fill-indigo-400" />
                </div>
              </button>
            ))}
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
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-200 dark:border-slate-800"
            >
              {checkoutState === "idle" && (
                <>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Secure Checkout
                    </h3>
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">
                          Last Minute Exam Kit
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Full Sem 1 Access
                        </p>
                      </div>
                      <div className="ml-auto font-black text-xl text-slate-900 dark:text-white">
                        ₹199
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Card Details
                      </label>
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                        defaultValue="4242 4242 4242 4242"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                          defaultValue="12/26"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                          defaultValue="123"
                        />
                      </div>
                    </div>

                    <button
                      onClick={processPayment}
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      Pay ₹199
                    </button>
                  </div>
                </>
              )}

              {checkoutState === "processing" && (
                <div className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    Processing...
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Please do not close this window.
                  </p>
                </div>
              )}

              {checkoutState === "success" && (
                <div className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    Payment Successful!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
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
  onClick,
}: {
  title: string;
  code: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow hover:border-slate-200 dark:hover:border-slate-700 text-left transition-all group flex items-start justify-between"
    >
      <div>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block mb-1">
          {code}
        </span>
        <span className="font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </span>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors shrink-0">
        <BookMarked className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
      </div>
    </button>
  );
}
