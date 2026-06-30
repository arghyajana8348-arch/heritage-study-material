import React, { ReactNode } from "react";
import { motion } from "motion/react";
import {
  Star,
  FileText,
  PenTool,
  Video,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { getSubject } from "../data";
import { SprintItem } from "../types";

interface SprintContentProps {
  subjectId: string;
  subjectName: string;
}

export default function SprintContent({
  subjectId,
  subjectName,
}: SprintContentProps) {
  const subject = getSubject(subjectId);
  const sprintData = subject?.sprint || [];

  return (
    <div className="p-4 md:p-0 pb-24 md:pb-8">
      <div className="mb-8 px-2 md:px-0">
        <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg mb-4 tracking-wider uppercase">
          Premium Access
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {subjectName}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
          Exam Sprint Content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {sprintData.length > 0 ? (
          sprintData.map((item, index) => (
            <ContentCard
              key={item.id}
              icon={
                item.type === "pdf" ? (
                  <FileText className="w-6 h-6" />
                ) : item.type === "handwritten" ? (
                  <PenTool className="w-6 h-6" />
                ) : (
                  <Star className="w-6 h-6" />
                )
              }
              title={item.title}
              desc={
                item.type === "pdf"
                  ? "Typed short notes in PDF format."
                  : item.type === "handwritten"
                    ? "Scanned handwritten topper notes."
                    : "Highly predicted questions and suggestions."
              }
              delay={0.1 * (index + 1)}
              featured={item.type === "suggestions"}
              url={item.url}
            />
          ))
        ) : (
          <>
            <ContentCard
              icon={<Star className="w-6 h-6" />}
              title="Final Suggestions"
              desc="Highly predicted questions and crucial topics you cannot afford to miss."
              delay={0.1}
              featured
            />
            <ContentCard
              icon={<FileText className="w-6 h-6" />}
              title="Typed Short Notes"
              desc="Concise, crisp notes covering all chapters for rapid final revision."
              delay={0.2}
            />
            <ContentCard
              icon={<PenTool className="w-6 h-6" />}
              title="Handwritten Topper Notes"
              desc="Scanned handwritten notes from previous year toppers."
              delay={0.3}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface ContentCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  delay: number;
  featured?: boolean;
  url?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  icon,
  title,
  desc,
  delay,
  featured,
  url,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => {
        if (url) {
          window.open(url, "_blank");
        }
      }}
      className={`rounded-3xl p-6 border shadow-sm flex flex-col justify-between group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${
        featured
          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"
          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700"
      }`}
    >
      <div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
            featured
              ? "bg-emerald-200 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
          }`}
        >
          {icon}
        </div>
        <h4
          className={`font-bold text-xl mb-2 ${featured ? "text-emerald-900 dark:text-emerald-50" : "text-slate-900 dark:text-white"}`}
        >
          {title}
        </h4>
        <p
          className={`font-medium mb-8 ${featured ? "text-emerald-700 dark:text-emerald-200" : "text-slate-500 dark:text-slate-400"}`}
        >
          {desc}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-bold tracking-wider uppercase ${featured ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"}`}
        >
          Available
        </span>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${featured ? "bg-emerald-200 dark:bg-emerald-500/20" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors"}`}
        >
          <Download
            className={`w-5 h-5 ${featured ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"}`}
          />
        </div>
      </div>
    </motion.div>
  );
};
