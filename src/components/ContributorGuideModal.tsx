import React, { useState } from "react";
import { X, BookOpen, Map, FileText, Code, Mail, Github, Check, Copy, ExternalLink, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface ContributorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContributorGuideModal({ isOpen, onClose }: ContributorGuideModalProps) {
  const [copied, setCopied] = useState(false);
  const email = "arghyajana8348@gmail.com";

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contributionCategories = [
    {
      icon: <FileText className="w-6 h-6 text-slate-950" />,
      title: "Study Materials",
      bgColor: "bg-[#FFD54F]",
      items: [
        "Handwritten & typed notes",
        "Syllabus & reference guides",
        "Previous year question papers",
        "Solved answer keys & suggestions"
      ]
    },
    {
      icon: <Map className="w-6 h-6 text-slate-950" />,
      title: "Mind Maps & Visuals",
      bgColor: "bg-[#C19BF5]",
      items: [
        "Chapter flowcharts",
        "Visual summaries & cheat sheets",
        "Formula & definition lists"
      ]
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-slate-950" />,
      title: "Practice Quizzes",
      bgColor: "bg-[#88D3E6]",
      items: [
        "Module-wise MCQs",
        "Detailed explanation keys",
        "Exam sprint question sets"
      ]
    },
    {
      icon: <Code className="w-6 h-6 text-slate-950" />,
      title: "Code & Design",
      bgColor: "bg-[#FF603D]",
      items: [
        "New platform features",
        "UI & responsiveness fixes",
        "Typo corrections & documentation"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-950 dark:text-white"
      >
        {/* Header */}
        <div className="p-6 border-b-[3px] border-slate-950 dark:border-slate-800 flex items-center justify-between bg-[#C19BF5] text-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-wide">
                Contributor's Guide
              </h3>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 mt-0.5">
                Help us make Heritage Study better for everyone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border-2 border-slate-950 bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 shadow-[2px_2px_0px_0px_#000] transition-all cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 max-h-[calc(90vh-100px)]">
          {/* Introduction */}
          <div>
            <h4 className="text-lg font-black uppercase italic text-slate-950 dark:text-white mb-2">
              Want to see your name on the contributors list?
            </h4>
            <p className="text-slate-650 dark:text-slate-400 font-bold text-sm leading-relaxed">
              Heritage Study is a community-driven, open-source initiative built by students, for students.
              Every note, mind map, or feature update you submit helps your classmates prepare more efficiently for exams.
              Whether you are technical or non-technical, there is a place for your contribution!
            </p>
          </div>

          {/* Contribution Categories Grid */}
          <div className="space-y-4">
            <h5 className="font-black text-xs uppercase tracking-wider text-[#FF603D] border-b-2 border-slate-100 dark:border-slate-800 pb-1">
              1. What you can contribute
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contributionCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 rounded-xl p-4 flex gap-4"
                >
                  <div className={`w-12 h-12 ${category.bgColor} border-2 border-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]`}>
                    {category.icon}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h6 className="font-black text-sm uppercase italic text-slate-950 dark:text-white leading-tight">
                      {category.title}
                    </h6>
                    <ul className="space-y-1">
                      {category.items.map((item, i) => (
                        <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-950 dark:bg-slate-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to submit */}
          <div className="space-y-4">
            <h5 className="font-black text-xs uppercase tracking-wider text-[#FF603D] border-b-2 border-slate-100 dark:border-slate-800 pb-1">
              2. How to submit your work
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Method A: Non-technical */}
              <div className="bg-[#FFD3B6] border-2 border-slate-950 rounded-xl p-5 text-slate-950 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📧</span>
                    <h6 className="font-black text-sm uppercase tracking-wide">Method A: Content Creators</h6>
                  </div>
                  <p className="text-xs font-bold leading-relaxed mb-4">
                    Send study materials, PDFs, images, or documents directly to our coordinator email. We will review it and upload it with proper credit to your profile!
                  </p>
                </div>
                
                <div className="bg-white border-2 border-slate-950 rounded-lg p-2 flex items-center justify-between shadow-[2px_2px_0px_0px_#000]">
                  <span className="font-mono text-xs font-extrabold truncate pr-2 select-all">
                    {email}
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded bg-slate-100 hover:bg-[#A8E6CF] border border-slate-950 text-slate-950 cursor-pointer transition-all shrink-0"
                    title="Copy Email"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Method B: Technical */}
              <div className="bg-[#A8E6CF] border-2 border-slate-950 rounded-xl p-5 text-slate-950 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💻</span>
                    <h6 className="font-black text-sm uppercase tracking-wide">Method B: Developers</h6>
                  </div>
                  <p className="text-xs font-bold leading-relaxed mb-4">
                    Fork our open-source codebase on GitHub, implement features or fix bugs, and submit a Pull Request.
                  </p>
                </div>
                
                <a
                  href="http://github.com/arghyajana8348-arch/heritage-study"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white border-2 border-slate-950 text-slate-950 font-black py-2.5 px-4 rounded-lg shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Github className="w-4 h-4" />
                  GitHub Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Submission Guidelines */}
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 rounded-xl p-5 space-y-3">
            <h6 className="font-black text-xs uppercase tracking-wide text-slate-950 dark:text-white">
              ⚠️ General Submission Guidelines
            </h6>
            <ul className="space-y-2 text-xs font-bold text-slate-655 dark:text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#FF603D]">✓</span>
                <span><strong>Originality:</strong> Ensure you have the right to share the notes or materials you send. No heavily restricted or paywalled commercial PDFs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF603D]">✓</span>
                <span><strong>Legibility:</strong> Try to scan handwritten notes under good lighting using apps (Adobe Scan, CamScanner, vFlat) so your peers can read clearly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF603D]">✓</span>
                <span><strong>Credits:</strong> Don't forget to include your full name and social handle so we can list you on the website's wall of contributors!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t-[3px] border-slate-950 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
            Heritage Study Community Core
          </p>
          <a
            href="/contributor.md"
            target="_blank"
            className="text-xs font-black text-[#FF603D] hover:underline flex items-center gap-1 uppercase"
          >
            Open raw contributor.md <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
