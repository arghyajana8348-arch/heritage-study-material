import { motion } from 'motion/react';
import { ViewState } from '../types';
import { subjects } from '../data';
import { ChevronRight, Zap, Lock, ShieldCheck } from 'lucide-react';

interface ExamSprintProps {
  hasPaid: boolean;
  onNavigate: (view: ViewState) => void;
  onPay: () => void;
}

export default function ExamSprint({ hasPaid, onNavigate, onPay }: ExamSprintProps) {
  if (!hasPaid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Exam Sprint</h2>
            <p className="text-slate-400 font-medium mb-8">
              Get premium access to curated cheat sheets, short notes, predicted important questions, and more across all subjects.
            </p>
            <div className="w-full bg-slate-800/50 rounded-2xl p-4 mb-8 text-left border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Final Suggestions</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Typed Short Notes</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Scanned Topper Notes</span>
              </div>
            </div>
            <button
              onClick={onPay}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Unlock Now for ₹199
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 pb-24 md:pb-8">
      <div className="flex items-center gap-3 mb-8 px-2 md:px-0">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Sprint</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Select a subject to access premium content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {subjects.map((sub, index) => (
          <motion.button
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate({ 
              view: 'sprintContent', 
              subjectId: sub.id,
              subjectName: sub.name
            })}
            className="w-full flex items-center justify-between p-6 rounded-3xl border transition-all text-left bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 group"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest text-emerald-600/80 dark:text-emerald-400/80 uppercase mb-2 block">
                {sub.code}
              </span>
              <span className="text-xl font-bold text-emerald-900 dark:text-emerald-300 mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors">
                {sub.name}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-500/20">
              <ChevronRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
