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
      <div className="p-6 text-center text-slate-500">Module not found</div>
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
      <div className="bg-white dark:bg-slate-900 px-6 py-8 md:p-10 md:rounded-3xl border-b md:border border-slate-100 dark:border-slate-800 transition-colors mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg mb-4 tracking-wider uppercase">
              Module {module.number}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              {module.name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">
              {subjectName}
            </p>
          </div>

          <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Subject Progress
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 dark:bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium text-right">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Study Materials */}
          {(module.content.studyMaterial.materials && module.content.studyMaterial.materials.length > 0) ? (
            module.content.studyMaterial.materials.map((mat, idx) => (
              <ContentCard
                key={mat.id || idx}
                type="Study Material"
                title={mat.title}
                description={mat.description}
                available={true}
                icon={<FileText className="w-8 h-8" />}
                actionIcon={<Download className="w-5 h-5" />}
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
              icon={<FileText className="w-8 h-8" />}
              actionIcon={<Download className="w-5 h-5" />}
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
            icon={<CheckSquare className="w-8 h-8" />}
            actionIcon={<Play className="w-5 h-5" />}
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
            icon={<Network className="w-8 h-8" />}
            actionIcon={<Maximize2 className="w-5 h-5" />}
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
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-100 dark:border-blue-500/20",
      activeBtn:
        "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-100 dark:border-emerald-500/20",
      activeBtn:
        "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-100 dark:border-purple-500/20",
      activeBtn:
        "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none",
    },
  };

  const style = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col ${!available ? "opacity-75 grayscale-[0.2]" : ""}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}
        >
          {icon}
        </div>
        {available && onToggleCompleted && (
          <button
            onClick={onToggleCompleted}
            className={`transition-colors p-1 rounded-full ${isCompleted ? "text-emerald-500" : "text-slate-300 dark:text-slate-600 hover:text-slate-400"}`}
            title={isCompleted ? "Mark as uncompleted" : "Mark as completed"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <Circle className="w-7 h-7" />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <p
          className={`text-xs font-bold uppercase tracking-widest mb-2 ${style.text}`}
        >
          {type}
        </p>
        <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-2">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">
          {description}
        </p>

        <div className="mt-auto flex flex-col gap-3">
          {available ? (
            <button
              onClick={onAction}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${style.activeBtn}`}
            >
              {actionIcon}
              {actionLabel}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed transition-colors">
              <Lock className="w-4 h-4" />
              Not available yet
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
