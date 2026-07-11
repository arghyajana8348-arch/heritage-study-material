import { motion } from 'motion/react';
import { ViewState } from '../types';
import { subjects } from '../data';
import { ChevronRight, Zap, Lock, ShieldCheck } from 'lucide-react';

interface ExamSprintProps {
  hasPaid: boolean;
  onNavigate: (view: ViewState) => void;
  onPay: () => void;
  isAdmin?: boolean;
}

export default function ExamSprint({ hasPaid, onNavigate, onPay, isAdmin = false }: ExamSprintProps) {
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-950 dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden text-white"
        >
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF603D]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFD54F]/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Lock Icon Badge */}
            <motion.div 
              animate={{ 
                rotate: [-2, 2, -2],
                y: [0, -3, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut"
              }}
              className="w-20 h-20 bg-[#FFD54F] border-[3px] border-slate-950 text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg]"
            >
              <Lock className="w-10 h-10 stroke-[2.5px]" />
            </motion.div>
            
            <span className="text-[10px] font-black tracking-widest text-slate-950 bg-[#FF603D] border-2 border-slate-950 px-2.5 py-1 rounded-md uppercase mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              COMING SOON 🔒
            </span>
            
            <h2 className="text-3xl font-black text-white mb-3 uppercase italic tracking-wide">
              Exam Sprint
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-[#FF603D] via-[#FFD54F] to-[#A8E6CF] mb-4 border-b-2 border-slate-950"></div>
            
            <p className="text-slate-350 font-extrabold text-sm leading-relaxed mb-6">
              This feature is currently locked. Study materials are being compiled and will be available very soon!
            </p>
            
            <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-4 mb-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#FF603D] shrink-0 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status: <span className="text-[#FF603D]">Uploading PDFs & Docs</span></span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                The administrator is actively scanning previous year suggestions, typed premium notes, and topper hand-written records.
              </p>
            </div>
            
            <button
              onClick={() => onNavigate({ view: "dashboard" })}
              className="w-full bg-[#A8E6CF] border-[3px] border-slate-950 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              ↩️ Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!hasPaid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-950 border-[3px] border-slate-950 dark:border-white rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-[#FF603D] border-[3px] border-slate-950 text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#000] rotate-[-4deg]">
              <Lock className="w-10 h-10 stroke-[2.5px]" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-wide">Unlock Exam Sprint</h2>
            <p className="text-slate-350 font-bold mb-8 text-sm leading-relaxed">
              Get premium access to curated cheat sheets, short notes, predicted important questions, and more across all subjects.
            </p>
            <div className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-5 mb-8 text-left">
              <div className="flex items-center gap-3 mb-3.5">
                <ShieldCheck className="w-5 h-5 text-[#A8E6CF] stroke-[2.5px]" />
                <span className="text-sm font-extrabold text-slate-200 uppercase">Final Suggestions</span>
              </div>
              <div className="flex items-center gap-3 mb-3.5">
                <ShieldCheck className="w-5 h-5 text-[#A8E6CF] stroke-[2.5px]" />
                <span className="text-sm font-extrabold text-slate-200 uppercase">Typed Short Notes</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#A8E6CF] stroke-[2.5px]" />
                <span className="text-sm font-extrabold text-slate-200 uppercase">Scanned Topper Notes</span>
              </div>
            </div>
            <button
              onClick={onPay}
              className="w-full bg-[#A8E6CF] border-[3px] border-slate-950 text-slate-955 font-black py-4 px-6 rounded-xl shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wider text-base"
            >
              Unlock Now for ₹199
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      <div className="flex items-center gap-4 mb-8 px-2 md:px-0 bg-[#FF603D] border-[3px] border-slate-950 p-6 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-slate-950 max-w-xl">
        <div className="w-14 h-14 bg-white border-2 border-slate-950 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000] rotate-[-2deg]">
          <Zap className="w-7 h-7 text-slate-950 stroke-[3px]" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic leading-none mb-1">Exam Sprint</h2>
          <p className="text-slate-800 font-extrabold text-xs uppercase tracking-wide">Select a subject to access premium content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((sub, index) => {
          const sprintColors = ["bg-[#A8E6CF]", "bg-[#FFD54F]", "bg-[#C19BF5]", "bg-[#88D3E6]"];
          const color = sprintColors[index % sprintColors.length];
          
          return (
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
              className={`w-full flex items-center justify-between p-6 rounded-2xl border-[3px] border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 transition-all text-slate-950 text-left cursor-pointer ${color}`}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-slate-950 dark:text-slate-950 bg-white/40 border border-slate-955 px-2 py-0.5 rounded w-fit mb-2 uppercase">
                  {sub.code}
                </span>
                <span className="text-xl font-black text-slate-950 dark:text-slate-950 uppercase italic leading-snug">
                  {sub.name}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0">
                <ChevronRight className="w-5 h-5 text-slate-955 stroke-[2.5px]" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
