import { motion } from "motion/react";
import { Bookmark, ViewState, Subject } from "../types";
import { subjects } from "../data";
import { BookMarked, Bookmark as BookmarkIcon } from "lucide-react";

interface SubjectListProps {
  onNavigate: (view: ViewState) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
}

export default function SubjectList({
  onNavigate,
  bookmarks,
  onToggleBookmark,
}: SubjectListProps) {
  const subjectsToDisplay = subjects;

  if (subjectsToDisplay.length === 0)
    return (
      <div className="p-6 text-center text-slate-500">No subjects found</div>
    );

  return (
    <div className="p-4 md:p-0 pb-24 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {subjectsToDisplay.map((subject, index) => {
          const totalModules = subject.modules.length;
          const progressPercentage =
            totalModules > 0 ? (subject.progress / totalModules) * 100 : 0;


          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-left hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all group flex flex-col justify-between min-h-[200px]"
            >
              <div
                className="flex justify-between items-start mb-6 cursor-pointer"
                onClick={() =>
                  onNavigate({
                    view: "modules",
                    subjectId: subject.id,
                    subjectName: subject.name,
                  })
                }
              >
                <div className="flex-1 pr-2">
                  <span className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2 block">
                    {subject.code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {subject.name}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark({
                      id: subject.id,
                      type: "subject",
                      title: subject.name,
                      subtitle: subject.code,
                    });
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    bookmarks.some((b) => b.id === subject.id)
                      ? "bg-indigo-100 dark:bg-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                  }`}
                >
                  <BookmarkIcon
                    className={`w-5 h-5 transition-colors ${
                      bookmarks.some((b) => b.id === subject.id)
                        ? "text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    }`}
                  />
                </button>
              </div>

              {/* Progress Section */}
              <div
                className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50 cursor-pointer"
                onClick={() =>
                  onNavigate({
                    view: "modules",
                    subjectId: subject.id,
                    subjectName: subject.name,
                  })
                }
              >
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Course Progress
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {subject.progress}/{totalModules} Modules
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 dark:bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
