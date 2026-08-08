import { motion } from 'motion/react';
import { Bookmark, ViewState } from '../types';
import { getSubject } from '../data';
import { ChevronRight, FileText, Download, Bookmark as BookmarkIcon } from 'lucide-react';

interface ModuleListProps {
  subjectId: string;
  onNavigate: (view: ViewState) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
  completedItems?: string[];
}

export default function ModuleList({
  subjectId,
  onNavigate,
  bookmarks,
  onToggleBookmark,
  completedItems = [],
}: ModuleListProps) {
  const subject = getSubject(subjectId);

  if (!subject) return <div className="p-6 text-center font-bold text-slate-500">Subject not found</div>;

  return (
    <div className="pb-24 md:pb-8">
      {/* Subject Header inside content area */}
      <div className="px-2 md:px-0 pb-6 md:pb-8">
        <p className="text-xs font-black tracking-widest text-slate-950 dark:text-slate-350 uppercase bg-white/40 border-2 border-slate-950 w-fit px-2.5 py-1 rounded-md mb-2">{subject.code}</p>
        <h2 className="text-3xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight uppercase italic leading-none">{subject.name}</h2>
      </div>

      <div className="space-y-12">
        {/* Modules */}
        <section>
          <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white mb-6 px-2 md:px-0">Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subject.modules.map((module, index) => {
              const bgColors = ["bg-[#FFD54F]", "bg-[#C19BF5]", "bg-[#88D3E6]", "bg-[#FFD3B6]"];
              const moduleBadgeColor = bgColors[index % bgColors.length];

              let mTotal = 0;
              let mDone = 0;

              if (module.content.studyMaterial.available) {
                mTotal++;
                if (completedItems.includes(`${module.id}-material`)) mDone++;
              }
              if (module.content.quiz.available) {
                mTotal++;
                if (completedItems.includes(`${module.id}-quiz`)) mDone++;
              }

              const modProgress = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
              
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full flex flex-col p-5 md:p-6 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group"
                >
                  <div 
                    className="flex items-center cursor-pointer mb-4"
                    onClick={() => onNavigate({ 
                      view: 'moduleDetail', 
                      moduleId: module.id,
                      moduleName: module.name,
                      subjectName: subject.name
                    })}
                  >
                    <div className={`w-14 h-14 shrink-0 ${moduleBadgeColor} border-2 border-slate-950 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mr-5 rotate-[-2deg] group-hover:rotate-[2deg] transition-transform`}>
                      <span className="text-xl font-black text-slate-950">
                        {module.number}
                      </span>
                    </div>
                    
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-black text-slate-950 dark:text-white leading-tight uppercase group-hover:underline">
                        {module.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-950/20 dark:border-slate-700 px-1.5 py-0.5 rounded">
                          {mDone}/{mTotal} Tasks
                        </span>
                        {mDone === mTotal && mTotal > 0 && (
                          <span className="text-[10px] font-black uppercase bg-[#A8E6CF] text-slate-950 border border-slate-950 px-1.5 py-0.5 rounded">
                            Completed ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-white dark:bg-slate-800 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 text-slate-955">
                      <ChevronRight className="w-5 h-5 stroke-[3px]" />
                    </div>
                  </div>

                  {/* Module Mini Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 border border-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#A8E6CF] border-r border-slate-950 transition-all duration-300"
                        style={{ width: `${modProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-950/10 dark:border-slate-800/80 pt-4 flex justify-between items-center mt-auto">
                    <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Quick Actions</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark({
                          id: module.id,
                          type: 'module',
                          title: module.name,
                          subtitle: subject.name,
                          subjectName: subject.name
                        });
                      }}
                      className="w-9 h-9 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-slate-950 hover:bg-[#FFD54F]"
                    >
                      <BookmarkIcon 
                        className={`w-4 h-4 ${
                          bookmarks.some(b => b.id === module.id)
                            ? 'fill-slate-950 text-slate-950'
                            : 'text-slate-400 hover:text-slate-900'
                        }`} 
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* PYQs Section */}
        <section>
          <h3 className="text-xl font-bold uppercase text-slate-950 dark:text-white mb-6 px-2 md:px-0">Previous Year Questions (PYQs)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {(subject.pyqs && subject.pyqs.length > 0) ? subject.pyqs.map((pyq, i) => {
              const fileColors = ["bg-[#FFD54F]", "bg-[#C19BF5]", "bg-[#88D3E6]", "bg-[#FFD3B6]"];
              const fileColor = fileColors[i % fileColors.length];
              
              return (
                <motion.button
                  key={pyq.id}
                  onClick={() => {
                    if (pyq.url) window.open(pyq.url, '_blank');
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-xl hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${fileColor} border-2 border-slate-950 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                      <FileText className="w-5 h-5 text-slate-955 stroke-[2px]" />
                    </div>
                    <span className="font-extrabold text-slate-950 dark:text-white group-hover:underline">{pyq.year} PAPERS</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-950 dark:text-white stroke-[3px]" />
                </motion.button>
              );
            }) : (
              <div className="col-span-full p-8 text-center border-4 border-dashed border-slate-950 dark:border-slate-800 rounded-2xl text-slate-650 dark:text-slate-450 bg-white/20 dark:bg-slate-950/20 font-bold">
                No previous year questions available yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
