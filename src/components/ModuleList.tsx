import { motion } from 'motion/react';
import { Bookmark, ViewState } from '../types';
import { getSubject } from '../data';
import { ChevronRight, FileText, Download, Bookmark as BookmarkIcon } from 'lucide-react';

interface ModuleListProps {
  subjectId: string;
  onNavigate: (view: ViewState) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bookmark: Bookmark) => void;
}

export default function ModuleList({ subjectId, onNavigate, bookmarks, onToggleBookmark }: ModuleListProps) {
  const subject = getSubject(subjectId);

  if (!subject) return <div className="p-6 text-center text-slate-500">Subject not found</div>;

  return (
    <div className="p-4 md:p-0 pb-24 md:pb-8">
      {/* Subject Header inside content area */}
      <div className="px-2 md:px-0 pb-6 md:pb-8">
        <p className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-2">{subject.code}</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{subject.name}</h2>
      </div>

      <div className="space-y-12">
        {/* Modules */}
        <section>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2 md:px-0">Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {subject.modules.map((module, index) => {
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full flex flex-col p-5 md:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 group"
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
                    <div className="w-14 h-14 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 mr-5 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/30 transition-colors">
                      <span className="text-xl font-bold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {module.number}
                      </span>
                    </div>
                    
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        3 Sections
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors shrink-0">
                      <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>

                  <div className="border-t border-slate-50 dark:border-slate-800/50 pt-4 flex justify-between items-center mt-auto">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Quick Actions</span>
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
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        bookmarks.some(b => b.id === module.id) 
                          ? 'bg-indigo-100 dark:bg-indigo-500/20' 
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                      }`}
                    >
                      <BookmarkIcon 
                        className={`w-4 h-4 transition-colors ${
                          bookmarks.some(b => b.id === module.id)
                            ? 'text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
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
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2 md:px-0">Previous Year Questions (PYQs)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(subject.pyqs && subject.pyqs.length > 0) ? subject.pyqs.map((pyq, i) => (
              <motion.button
                key={pyq.id}
                onClick={() => {
                  if (pyq.url) window.open(pyq.url, '_blank');
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                    <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{pyq.year}</span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </motion.button>
            )) : (
              <div className="col-span-full p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400">
                No previous year questions available yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
