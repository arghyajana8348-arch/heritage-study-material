import { motion } from "motion/react";
import { Bookmark, ViewState, Subject } from "../types";
import { subjects } from "../data";
import { BookMarked, Bookmark as BookmarkIcon } from "lucide-react";

interface SubjectListProps {
  onNavigate: (view: ViewState) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
  completedItems?: string[];
}

export default function SubjectList({
  onNavigate,
  bookmarks,
  onToggleBookmark,
  completedItems = [],
}: SubjectListProps) {
  const subjectsToDisplay = subjects;

  const cardColors = [
    "bg-[#FFD54F]", // Yellow
    "bg-[#C19BF5]", // Purple
    "bg-[#88D3E6]", // Blue
    "bg-[#FFD3B6]", // Peach
  ];

  if (subjectsToDisplay.length === 0)
    return (
      <div className="p-6 text-center font-bold text-slate-700 dark:text-slate-400">No subjects found</div>
    );

  return (
    <div className="pb-24 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjectsToDisplay.map((subject, index) => {
          const totalModules = subject.modules.length;
          let totalTasks = 0;
          let completedTasks = 0;
          let completedModulesCount = 0;

          subject.modules.forEach((m) => {
            let mTotal = 0;
            let mDone = 0;

            if (m.content.studyMaterial.available) {
              mTotal++;
              totalTasks++;
              if (completedItems.includes(`${m.id}-material`)) {
                mDone++;
                completedTasks++;
              }
            }
            if (m.content.quiz.available) {
              mTotal++;
              totalTasks++;
              if (completedItems.includes(`${m.id}-quiz`)) {
                mDone++;
                completedTasks++;
              }
            }

            if (mTotal > 0 && mDone === mTotal) {
              completedModulesCount++;
            }
          });

          const progressPercentage =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          const cardColor = cardColors[index % cardColors.length];

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${cardColor} border-[3px] border-slate-950 p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between min-h-[220px] text-slate-950`}
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
                <div className="flex-1 min-w-0 pr-3">
                  <span className="text-[10px] font-black tracking-widest text-slate-950 dark:text-slate-950 uppercase bg-white/40 border border-slate-950 px-2 py-0.5 rounded block w-fit mb-2">
                    {subject.code}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-slate-950 leading-tight uppercase italic mt-1 group-hover:underline break-words" title={subject.name}>
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
                  className="w-10 h-10 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-transform cursor-pointer"
                >
                  <BookmarkIcon
                    className={`w-5 h-5 ${
                      bookmarks.some((b) => b.id === subject.id)
                        ? "text-slate-950 fill-slate-950"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  />
                </button>
              </div>

              {/* Progress Section */}
              <div
                className="mt-auto pt-4 border-t-2 border-slate-950/20 cursor-pointer"
                onClick={() =>
                  onNavigate({
                    view: "modules",
                    subjectId: subject.id,
                    subjectName: subject.name,
                  })
                }
              >
                <div className="flex justify-between items-end mb-2.5">
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-800">
                    Course Progress
                  </span>
                  <span className="text-[10px] font-black text-slate-950 dark:text-slate-950 bg-white/40 border border-slate-950 px-2 py-0.5 rounded">
                    {completedModulesCount}/{totalModules} Modules ({progressPercentage}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-white border-2 border-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A8E6CF] border-r-2 border-slate-950"
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
