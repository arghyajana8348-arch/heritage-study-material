import { ReactNode } from "react";
import { motion } from "motion/react";
import { getModule, getSubject } from "../data";
import {
  FileText,
  CheckSquare,
  Network,
  Lock,
  Download,
  Play,
  Maximize2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { ViewState } from "../types";

interface ModuleDetailProps {
  subjectId: string;
  moduleId: string;
  subjectName: string;
  onNavigate: (view: ViewState) => void;
  completedItems: string[];
  onToggleCompleted: (id: string) => void;
}

export default function ModuleDetail({
  subjectId,
  moduleId,
  subjectName,
  onNavigate,
  completedItems,
  onToggleCompleted,
}: ModuleDetailProps) {
  const module = getModule(subjectId, moduleId);
  const subject = getSubject(subjectId);

  if (!module || !subject)
    return (
      <div className="p-6 text-center font-bold text-slate-500">Module not found</div>
    );

  // Calculate subject progress dynamically
  let totalTasks = 0;
  let completedTasks = 0;

  subject.modules.forEach((m) => {
    if (m.content.studyMaterial.available) {
      totalTasks++;
      if (completedItems.includes(`${m.id}-material`)) completedTasks++;
    }
    if (m.content.quiz.available) {
      totalTasks++;
      if (completedItems.includes(`${m.id}-quiz`)) completedTasks++;
    }
  });

  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleDownload = (url: string | undefined, title: string) => {
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = title || "download";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("This material doesn't have a PDF link yet.");
    }
  };

  return (
    <div className="pb-24 md:pb-8">
      {/* Module Header */}
      <div className="bg-[#88D3E6] px-6 py-8 md:p-10 border-[3px] border-slate-950 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-slate-950 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div>
            <div className="inline-block px-3 py-1 bg-white border-2 border-slate-950 text-slate-950 text-xs font-black rounded-lg mb-4 tracking-wider uppercase shadow-[2px_2px_0px_0px_#000] rotate-[-1deg]">
              Module {module.number}
            </div>
            <h2 className="text-3xl md:text-5xl font-black leading-none uppercase italic mb-3">
              {module.name}
            </h2>
            <p className="text-slate-800 mt-2 text-lg font-extrabold uppercase tracking-wide">
              {subjectName}
            </p>
          </div>

          <div className="w-full md:w-64 bg-white border-[3px] border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] shrink-0 text-slate-955">
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-xs font-black uppercase text-slate-800">
                Subject Progress
              </span>
              <span className="text-sm font-black text-slate-950 italic">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 border-2 border-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A8E6CF] border-r-2 border-slate-950 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-600 mt-2.5 text-right">
              {completedTasks} / {totalTasks} tasks done
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Study Materials */}
          {(module.content.studyMaterial.materials && module.content.studyMaterial.materials.length > 0) ? (
            module.content.studyMaterial.materials.map((mat, idx) => (
              <ContentCard
                key={mat.id || idx}
                type="Study Material"
                title={mat.title}
                description={mat.description}
                available={true}
                icon={<FileText className="w-8 h-8 stroke-[2px]" />}
                actionIcon={<Download className="w-5 h-5 stroke-[2.5px]" />}
                actionLabel="Download PDF"
                color="blue"
                delay={0.1 + (idx * 0.05)}
                isCompleted={completedItems.includes(`${moduleId}-material-${mat.id}`)}
                onToggleCompleted={() => onToggleCompleted(`${moduleId}-material-${mat.id}`)}
                onAction={() => handleDownload(mat.url, mat.title)}
              />
            ))
          ) : (
            <ContentCard
              type="Study Material"
              title={module.content.studyMaterial.title}
              description={module.content.studyMaterial.description}
              available={module.content.studyMaterial.available}
              icon={<FileText className="w-8 h-8 stroke-[2px]" />}
              actionIcon={<Download className="w-5 h-5 stroke-[2.5px]" />}
              actionLabel="Download PDF"
              color="blue"
              delay={0.1}
              isCompleted={completedItems.includes(`${moduleId}-material`)}
              onToggleCompleted={() => onToggleCompleted(`${moduleId}-material`)}
              onAction={() => handleDownload(module.content.studyMaterial.url, module.content.studyMaterial.title)}
            />
          )}

          {/* Quiz */}
          <ContentCard
            type="Quiz"
            title={module.content.quiz.title}
            description={module.content.quiz.description}
            available={module.content.quiz.available}
            icon={<CheckSquare className="w-8 h-8 stroke-[2px]" />}
            actionIcon={<Play className="w-5 h-5 stroke-[2.5px]" />}
            actionLabel="Start Quiz"
            color="emerald"
            delay={0.2}
            isCompleted={completedItems.includes(`${moduleId}-quiz`)}
            onToggleCompleted={() => onToggleCompleted(`${moduleId}-quiz`)}
            onAction={() =>
              onNavigate({
                view: "quiz",
                moduleId,
                moduleName: module.name,
                subjectName,
              })
            }
          />

          {/* Mind Map */}
          <ContentCard
            type="Mind Map"
            title={module.content.mindMap.title}
            description={module.content.mindMap.description}
            available={module.content.mindMap.available}
            icon={<Network className="w-8 h-8 stroke-[2px]" />}
            actionIcon={<Maximize2 className="w-5 h-5 stroke-[2.5px]" />}
            actionLabel="View Map"
            color="purple"
            delay={0.3}
            onAction={() => {
              if (module.content.mindMap.url) {
                window.open(module.content.mindMap.url, '_blank');
              } else {
                alert("This mind map doesn't have a link yet.");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface ContentCardProps {
  key?: string | number;
  type: string;
  title: string;
  description: string;
  available: boolean;
  icon: ReactNode;
  actionIcon: ReactNode;
  actionLabel: string;
  color: "blue" | "emerald" | "purple";
  delay: number;
  isCompleted?: boolean;
  onToggleCompleted?: () => void;
  onAction?: () => void;
}

function ContentCard({
  type,
  title,
  description,
  available,
  icon,
  actionIcon,
  actionLabel,
  color,
  delay,
  isCompleted,
  onToggleCompleted,
  onAction,
}: ContentCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-[#88D3E6]",
      shadow: "shadow-[4px_4px_0px_0px_#88D3E6]",
      activeBtn:
        "bg-[#88D3E6] border-[3px] border-slate-950 text-slate-955 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    },
    emerald: {
      bg: "bg-[#C19BF5]",
      shadow: "shadow-[4px_4px_0px_0px_#C19BF5]",
      activeBtn:
        "bg-[#C19BF5] border-[3px] border-slate-950 text-slate-955 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    },
    purple: {
      bg: "bg-[#FFD54F]",
      shadow: "shadow-[4px_4px_0px_0px_#FFD54F]",
      activeBtn:
        "bg-[#FFD54F] border-[3px] border-slate-950 text-slate-955 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    },
  };

  const style = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-6 md:p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col ${!available ? "opacity-70 grayscale-[0.3]" : ""}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-[-3deg] ${style.bg} text-slate-955`}
        >
          {icon}
        </div>
        {available && onToggleCompleted && (
          <button
            onClick={onToggleCompleted}
            className="w-9 h-9 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center shadow-[1px_1px_0px_0px_#000] active:translate-y-0.5 transition-all text-slate-950 cursor-pointer"
            title={isCompleted ? "Mark as uncompleted" : "Mark as completed"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5 text-slate-400" />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <p
          className="text-[10px] font-black uppercase tracking-wider mb-2 text-slate-500 dark:text-slate-400"
        >
          {type}
        </p>
        <h3 className="font-black text-slate-950 dark:text-white text-xl uppercase italic mb-2 leading-none">
          {title}
        </h3>
        <p className="text-slate-650 dark:text-slate-400 text-sm mb-6 leading-relaxed font-bold">
          {description}
        </p>

        <div className="mt-auto flex flex-col gap-3">
          {available ? (
            <button
              onClick={onAction}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase text-sm tracking-wide transition-all cursor-pointer ${style.activeBtn}`}
            >
              {actionIcon}
              {actionLabel}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase text-sm tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-455 dark:text-slate-500 border-2 border-slate-950/20 dark:border-slate-800/80 cursor-not-allowed">
              <Lock className="w-4 h-4 stroke-[3px]" />
              Not available
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
