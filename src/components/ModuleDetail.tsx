import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  BookOpen,
  Eye,
  X,
  ExternalLink,
  FolderOpen,
  FileCheck,
} from "lucide-react";
import { ViewState } from "../types";

interface ModuleDetailProps {
  subjectId: string;
  moduleId: string;
  subjectName: string;
  onNavigate: (view: ViewState) => void;
  completedItems: string[];
  onToggleCompleted: (id: string) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export default function ModuleDetail({
  subjectId,
  moduleId,
  subjectName,
  onNavigate,
  completedItems,
  onToggleCompleted,
  onUnlockBadge,
}: ModuleDetailProps) {
  const module = getModule(subjectId, moduleId);
  const subject = getSubject(subjectId);

  const [isPdfLibraryOpen, setIsPdfLibraryOpen] = useState(false);
  const [selectedPdfForReader, setSelectedPdfForReader] = useState<{
    id: string;
    title: string;
    description: string;
    url: string;
    size?: string;
  } | null>(null);

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
    if (onToggleCompleted && !completedItems.includes(`${moduleId}-material`)) {
      onToggleCompleted(`${moduleId}-material`);
    }
    if (onUnlockBadge) {
      onUnlockBadge("scholar_notes");
    }
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

  // Construct multiple PDFs list for this module
  const getModulePdfList = () => {
    const uploaded = module.content.studyMaterial.materials || [];
    const defaultList = [
      {
        id: `${module.id}-pdf-1`,
        title: `Module ${module.number}: Comprehensive Lecture Notes (Part 1)`,
        description: `Full typed study notes for ${module.name}. Covers core theory, formulas, and definitions.`,
        url: module.content.studyMaterial.url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: "2.8 MB PDF",
      },
      {
        id: `${module.id}-pdf-2`,
        title: `Module ${module.number}: Formula Sheet & Quick Revision (Part 2)`,
        description: `2-page quick reference formula guide, key equations, and summary charts.`,
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: "1.4 MB PDF",
      },
      {
        id: `${module.id}-pdf-3`,
        title: `Module ${module.number}: Handwritten Class Notes & Solved Examples`,
        description: `High-quality scanned handwritten topper notes with step-by-step solved numericals.`,
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: "4.2 MB PDF",
      },
      {
        id: `${module.id}-pdf-4`,
        title: `Module ${module.number}: Practice Question Bank & PYQ Solutions`,
        description: `Curated practice questions and previous year end-term exam solutions.`,
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: "3.1 MB PDF",
      },
    ];

    if (uploaded.length > 0) {
      const mappedUploaded = uploaded.map((m, i) => ({
        id: m.id || `uploaded-${i}`,
        title: m.title,
        description: m.description,
        url: m.url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: "Admin Uploaded PDF",
      }));
      return [...mappedUploaded, ...defaultList];
    }

    return defaultList;
  };

  const pdfList = getModulePdfList();

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
          {/* Study Materials Card (Opens PDF Library Pop-out) */}
          <ContentCard
            type="Study Material & Notes"
            title="Comprehensive Notes"
            description={`Multiple PDF resources & lecture notes available for Module ${module.number} (${pdfList.length} PDFs)`}
            available={module.content.studyMaterial.available}
            icon={<FileText className="w-8 h-8 stroke-[2px]" />}
            actionIcon={<BookOpen className="w-5 h-5 stroke-[2.5px]" />}
            actionLabel="View Notes & PDFs"
            color="blue"
            delay={0.1}
            isCompleted={completedItems.includes(`${moduleId}-material`)}
            onToggleCompleted={() => onToggleCompleted(`${moduleId}-material`)}
            onAction={() => setIsPdfLibraryOpen(true)}
          />

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
                window.open(module.content.mindMap.url, "_blank");
              } else {
                alert("This mind map doesn't have a link yet.");
              }
            }}
          />
        </div>
      </div>

      {/* PDF Resources Pop-out Library Window */}
      <AnimatePresence>
        {isPdfLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPdfLibraryOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Window Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden z-10 flex flex-col max-h-[85vh] text-slate-950 dark:text-white"
            >
              {/* Window Header */}
              <div className="p-5 sm:p-6 bg-[#88D3E6] border-b-[3px] border-slate-950 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_#000] shrink-0 rotate-[-2deg]">
                    <FolderOpen className="w-6 h-6 stroke-[2.5px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-white border border-slate-950 px-2 py-0.5 rounded text-slate-950">
                        Module {module.number}
                      </span>
                      <span className="text-xs font-black text-slate-950 uppercase italic">
                        {subjectName}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase italic text-slate-950 leading-none mt-1">
                      PDF Resources & Notes
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsPdfLibraryOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white border-2 border-slate-950 text-slate-950 flex items-center justify-center shadow-[2px_2px_0px_0px_#000] hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>

              {/* Notice Banner */}
              <div className="px-5 sm:px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b-2 border-slate-950 dark:border-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-amber-200 text-xs font-bold shrink-0">
                <FileCheck className="w-4 h-4 text-[#FF603D] shrink-0 stroke-[2.5px]" />
                <span>
                  Select any document below to <strong>Read PDF</strong> directly in our inline viewer or <strong>Download PDF</strong> to save to your device.
                </span>
              </div>

              {/* PDF Items List */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 divide-y-2 divide-slate-100 dark:divide-slate-800">
                {pdfList.map((pdf, idx) => (
                  <div
                    key={pdf.id || idx}
                    className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border-2 border-slate-950/20 dark:border-slate-700 hover:border-slate-950 dark:hover:border-white transition-all"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 border-2 border-slate-950 text-red-600 dark:text-red-400 flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000] font-black text-xs leading-none">
                        <FileText className="w-5 h-5 stroke-[2.5px]" />
                        <span className="text-[8px] mt-0.5 uppercase font-black">PDF</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-base text-slate-950 dark:text-white leading-tight uppercase italic">
                          {pdf.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 line-clamp-2 leading-relaxed">
                          {pdf.description}
                        </p>
                        <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-950 dark:border-slate-700 px-2 py-0.5 rounded">
                          {pdf.size || "Document PDF"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Read & Download */}
                    <div className="flex items-center gap-2 shrink-0 sm:self-center mt-2 sm:mt-0">
                      <button
                        onClick={() => {
                          if (onToggleCompleted && !completedItems.includes(`${moduleId}-material`)) {
                            onToggleCompleted(`${moduleId}-material`);
                          }
                          if (onUnlockBadge) {
                            onUnlockBadge("scholar_notes");
                          }
                          setSelectedPdfForReader(pdf);
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFD54F] border-2 border-slate-950 text-slate-950 font-black text-xs uppercase tracking-wide shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 stroke-[2.5px]" />
                        Read PDF
                      </button>

                      <button
                        onClick={() => handleDownload(pdf.url, pdf.title)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#88D3E6] border-2 border-slate-950 text-slate-950 font-black text-xs uppercase tracking-wide shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 stroke-[2.5px]" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Window Footer */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-950 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>Total Files: {pdfList.length} PDFs</span>
                <button
                  onClick={() => setIsPdfLibraryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-white font-black text-slate-950 dark:text-white uppercase shadow-[2px_2px_0px_0px_#000] hover:bg-slate-200 cursor-pointer"
                >
                  Close Library
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inline Embedded PDF Viewer / Reader Modal */}
      <AnimatePresence>
        {selectedPdfForReader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPdfForReader(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Reader Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-[92vh] max-w-5xl bg-slate-900 border-[3px] border-white rounded-3xl shadow-[8px_8px_0px_0px_#FFD54F] overflow-hidden z-10 flex flex-col text-white"
            >
              {/* Reader Header */}
              <div className="p-4 bg-slate-950 border-b-2 border-slate-800 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedPdfForReader(null)}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all cursor-pointer shrink-0"
                    title="Back to PDF list"
                  >
                    <X className="w-5 h-5 stroke-[2.5px]" />
                  </button>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-[#FFD54F] tracking-wider block">
                      PDF Reader Mode
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                      {selectedPdfForReader.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={selectedPdfForReader.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs hover:bg-slate-700 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 stroke-[2.5px]" />
                    Open in New Tab
                  </a>
                  <button
                    onClick={() =>
                      handleDownload(
                        selectedPdfForReader.url,
                        selectedPdfForReader.title
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#88D3E6] border-2 border-slate-950 text-slate-955 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5px]" />
                    Download
                  </button>
                </div>
              </div>

              {/* Reader Document Viewer Frame */}
              <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-2">
                <iframe
                  src={selectedPdfForReader.url}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                  title={selectedPdfForReader.title}
                />
              </div>

              {/* Reader Toolbar / Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Reading: {selectedPdfForReader.title}</span>
                <div className="flex items-center gap-3">
                  <a
                    href={selectedPdfForReader.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#FFD54F] hover:underline font-bold flex items-center gap-1"
                  >
                    Having trouble viewing? Open full PDF <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

