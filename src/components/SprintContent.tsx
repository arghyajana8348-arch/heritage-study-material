import React, { ReactNode } from "react";
import { motion } from "motion/react";
import {
  Star,
  FileText,
  PenTool,
  Download,
} from "lucide-react";
import { getSubject } from "../data";

interface SprintContentProps {
  subjectId: string;
  subjectName: string;
  onUnlockBadge?: (badgeId: string) => void;
}

export default function SprintContent({
  subjectId,
  subjectName,
  onUnlockBadge,
}: SprintContentProps) {
  const subject = getSubject(subjectId);
  const sprintData = subject?.sprint || [];

  React.useEffect(() => {
    if (onUnlockBadge) {
      onUnlockBadge("sprint_warrior");
    }
  }, [onUnlockBadge]);

  return (
    <div className="pb-24 md:pb-8">
      <div className="mb-8 px-2 md:px-0">
        <div className="inline-block px-3 py-1.5 bg-[#FF603D] border-2 border-slate-950 text-slate-950 text-xs font-black rounded-lg mb-4 tracking-wider uppercase shadow-[2px_2px_0px_0px_#000] rotate-[-1deg]">
          PREMIUM ACCESS
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight uppercase italic leading-none mb-2">
          {subjectName}
        </h2>
        <p className="text-slate-700 dark:text-slate-350 font-extrabold text-sm uppercase tracking-wide">
          Exam Sprint Materials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sprintData.length > 0 ? (
          sprintData.map((item, index) => (
            <ContentCard
              key={item.id}
              icon={
                item.type === "pdf" ? (
                  <FileText className="w-6 h-6 stroke-[2px]" />
                ) : item.type === "handwritten" ? (
                  <PenTool className="w-6 h-6 stroke-[2px]" />
                ) : (
                  <Star className="w-6 h-6 stroke-[2.5px]" />
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
              type={item.type}
            />
          ))
        ) : (
          <>
            <ContentCard
              icon={<Star className="w-6 h-6 stroke-[2.5px]" />}
              title="Final Suggestions"
              desc="Highly predicted questions and crucial topics you cannot afford to miss."
              delay={0.1}
              featured
              type="suggestions"
            />
            <ContentCard
              icon={<FileText className="w-6 h-6 stroke-[2px]" />}
              title="Typed Short Notes"
              desc="Concise, crisp notes covering all chapters for rapid final revision."
              delay={0.2}
              type="pdf"
            />
            <ContentCard
              icon={<PenTool className="w-6 h-6 stroke-[2px]" />}
              title="Handwritten Topper Notes"
              desc="Scanned handwritten notes from previous year toppers."
              delay={0.3}
              type="handwritten"
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
  type: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  icon,
  title,
  desc,
  delay,
  featured,
  url,
  type,
}) => {
  const badgeColors = {
    suggestions: "bg-[#FF603D]",
    pdf: "bg-[#FFD54F]",
    handwritten: "bg-[#C19BF5]",
  };

  const badgeColor = badgeColors[type as keyof typeof badgeColors] || "bg-[#88D3E6]";

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
      className={`rounded-2xl p-6 border-[3px] border-slate-950 text-slate-950 flex flex-col justify-between group cursor-pointer transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
        featured
          ? "bg-[#FF603D] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFD54F]"
          : "bg-white dark:bg-slate-900 dark:text-white dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      }`}
    >
      <div>
        <div
          className={`w-12 h-12 rounded-xl border-2 border-slate-950 flex items-center justify-center mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-[-3deg] ${
            featured ? "bg-white text-slate-950" : `${badgeColor} text-slate-950`
          }`}
        >
          {icon}
        </div>
        <h4
          className={`font-black text-xl mb-2 uppercase italic leading-none group-hover:underline ${
            featured ? "text-slate-950 dark:text-slate-950" : "text-slate-950 dark:text-white"
          }`}
        >
          {title}
        </h4>
        <p
          className={`font-semibold text-sm leading-relaxed mb-8 ${
            featured ? "text-slate-900 dark:text-slate-900" : "text-slate-655 dark:text-slate-400"
          }`}
        >
          {desc}
        </p>
      </div>

      <div className="flex items-center justify-between border-t-2 border-slate-950/10 dark:border-slate-800/80 pt-4">
        <span
          className="text-xs font-black tracking-wider uppercase bg-white/40 border border-slate-950 px-2 py-0.5 rounded text-slate-950 dark:text-slate-950"
        >
          Available
        </span>
        <div
          className="w-10 h-10 rounded-full border-2 border-slate-950 bg-white text-slate-950 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-transform"
        >
          <Download
            className="w-5 h-5 stroke-[2.5px]"
          />
        </div>
      </div>
    </motion.div>
  );
};
