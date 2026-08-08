import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ViewState } from "../types";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  Lightbulb,
  Star,
  ThumbsUp,
  ThumbsDown,
  Award,
  Check,
} from "lucide-react";

interface QuizProps {
  moduleId: string;
  moduleName: string;
  subjectName: string;
  onNavigate: (view: ViewState) => void;
  completedItems?: string[];
  onToggleCompleted?: (itemId: string) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "Which of the following is a key concept in this module?",
    options: ["Oscillation and Waves", "General Relativity", "Fluid Dynamics", "Thermodynamic cycles"],
    correctAnswer: 0,
  },
  {
    id: 2,
    text: "What is the primary application of the theories discussed?",
    options: [
      "Bridge Construction",
      "Semiconductor Fabrication",
      "Power Generation",
      "All of the above",
    ],
    correctAnswer: 3,
  },
  {
    id: 3,
    text: "Which formula or method is mostly used to solve standard problems in this section?",
    options: ["Linear Differential Equations", "Newton-Raphson Method", "Maxwell Relations", "Gauss Divergence Theorem"],
    correctAnswer: 0,
  },
];

export default function Quiz({
  moduleId,
  moduleName,
  subjectName,
  onNavigate,
  completedItems = [],
  onToggleCompleted,
  onUnlockBadge,
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [isFinished, setIsFinished] = useState(false);

  // Automatically mark quiz as completed when finished & trigger badge unlocks
  useEffect(() => {
    if (isFinished) {
      if (onToggleCompleted) {
        const quizItemId = `${moduleId}-quiz`;
        if (!completedItems.includes(quizItemId)) {
          onToggleCompleted(quizItemId);
        }
      }

      if (onUnlockBadge) {
        // Unlock first quiz badge
        onUnlockBadge("first_quiz");

        // Calculate score for 100% perfect quiz badge
        let score = 0;
        sampleQuestions.forEach((q) => {
          if (selectedAnswers[q.id] === q.correctAnswer) {
            score++;
          }
        });
        if (score === sampleQuestions.length) {
          onUnlockBadge("perfect_quiz");
        }
      }
    }
  }, [isFinished, moduleId, completedItems, onToggleCompleted, onUnlockBadge, selectedAnswers]);

  // State for AI explanations
  const [explanations, setExplanations] = useState<
    Record<number, { text?: string; loading: boolean; error?: string }>
  >({});

  // State for overall Gemini AI performance rating
  const [performanceRating, setPerformanceRating] = useState<{
    loading: boolean;
    data?: {
      ratingTitle: string;
      stars: number;
      summary: string;
      strengths: string[];
      areasToImprove: string[];
      actionableTip: string;
    };
    error?: string;
  }>({ loading: false });

  // State for per-question explanation feedback ratings
  const [explanationRatings, setExplanationRatings] = useState<
    Record<number, "up" | "down">
  >({});

  const rateExplanation = (qId: number, feedback: "up" | "down") => {
    setExplanationRatings((prev) => ({
      ...prev,
      [qId]: feedback,
    }));
  };

  const fetchPerformanceRating = async () => {
    setPerformanceRating({ loading: true });
    try {
      const score = calculateScore();
      const total = sampleQuestions.length;
      const percentage = Math.round((score / total) * 100);

      const questionsSummary = sampleQuestions.map((q) => ({
        question: q.text,
        userChoice: q.options[selectedAnswers[q.id]] ?? "None",
        correctChoice: q.options[q.correctAnswer],
        isCorrect: selectedAnswers[q.id] === q.correctAnswer,
      }));

      const res = await fetch("/api/quiz/rate-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName,
          moduleName,
          score,
          total,
          percentage,
          questionsSummary,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response from server. Check GEMINI_API_KEY in Settings > Secrets.");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI performance rating.");
      }

      setPerformanceRating({ loading: false, data: data.rating });
      if (onUnlockBadge) {
        onUnlockBadge("ai_learner");
      }
    } catch (err: any) {
      setPerformanceRating({
        loading: false,
        error: err?.message || "Could not generate AI rating.",
      });
    }
  };

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsFinished(false);
    setExplanations({});
  };

  const calculateScore = () => {
    let score = 0;
    sampleQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const fetchExplanation = async (q: Question) => {
    const selectedOptionIndex = selectedAnswers[q.id];
    if (selectedOptionIndex === undefined) return;

    setExplanations((prev) => ({
      ...prev,
      [q.id]: { loading: true },
    }));

    try {
      const res = await fetch("/api/quiz/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: q.text,
          options: q.options,
          selectedAnswer: q.options[selectedOptionIndex],
          correctAnswer: q.options[q.correctAnswer],
          subjectName,
          moduleName,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const rawText = await res.text();
        console.error("Non-JSON API response received:", rawText);
        throw new Error(
          "Server returned a non-JSON response. Please ensure GEMINI_API_KEY is configured in Settings > Secrets."
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch AI explanation.");
      }

      setExplanations((prev) => ({
        ...prev,
        [q.id]: { text: data.explanation, loading: false },
      }));

      if (onUnlockBadge) {
        onUnlockBadge("ai_learner");
      }
    } catch (err: any) {
      setExplanations((prev) => ({
        ...prev,
        [q.id]: {
          loading: false,
          error: err.message || "Could not load AI feedback.",
        },
      }));
    }
  };

  const explainAllWrongAnswers = () => {
    sampleQuestions.forEach((q) => {
      if (selectedAnswers[q.id] !== q.correctAnswer) {
        if (!explanations[q.id]?.text && !explanations[q.id]?.loading) {
          fetchExplanation(q);
        }
      }
    });
  };

  if (isFinished) {
    const score = calculateScore();
    const percentage = Math.round((score / sampleQuestions.length) * 100);
    const wrongQuestions = sampleQuestions.filter(
      (q) => selectedAnswers[q.id] !== q.correctAnswer
    );

    return (
      <div className="pb-24 md:pb-8 flex flex-col items-center justify-center min-h-[60vh] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-[#FFD54F] border-[3px] border-slate-950 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_#000] rotate-[-3deg]">
            <span className="text-3xl font-black text-slate-955 italic">
              {percentage}%
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-2 uppercase italic tracking-wide">
            Quiz Completed!
          </h2>
          <p className="text-slate-655 dark:text-slate-400 mb-6 font-bold">
            You scored {score} out of {sampleQuestions.length} in {moduleName}.
          </p>

          {/* Gemini AI Performance Rating Section */}
          <div className="mb-6 text-left">
            {!performanceRating.data && !performanceRating.loading && !performanceRating.error && (
              <button
                onClick={fetchPerformanceRating}
                className="w-full py-3 px-4 bg-[#C19BF5] border-[3px] border-slate-950 text-slate-950 font-black text-xs uppercase italic tracking-wider rounded-xl shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5px]" />
                Get Gemini AI Performance Rating & Review
                <Award className="w-4 h-4 stroke-[2.5px]" />
              </button>
            )}

            {performanceRating.loading && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-950 rounded-xl flex items-center justify-center gap-3 text-purple-950 dark:text-purple-300 font-extrabold text-xs">
                <Loader2 className="w-5 h-5 animate-spin stroke-[3px]" />
                <span>Evaluating quiz results with Gemini AI...</span>
              </div>
            )}

            {performanceRating.error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-slate-950 rounded-xl flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-400">
                <span>{performanceRating.error}</span>
                <button
                  onClick={fetchPerformanceRating}
                  className="px-2.5 py-1 bg-white border border-slate-950 text-slate-950 font-black rounded shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {performanceRating.data && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50/80 dark:bg-purple-950/50 border-[3px] border-slate-950 dark:border-white p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFD54F]"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-950/10 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-700 dark:text-purple-400 stroke-[2.5px]" />
                    <span className="text-xs font-black uppercase italic tracking-wider text-purple-950 dark:text-purple-200">
                      Gemini AI Rating & Evaluation
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= performanceRating.data!.stars
                            ? "fill-amber-400 text-slate-950 stroke-[1.5px]"
                            : "text-slate-300 dark:text-slate-700 stroke-[1.5px]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase italic mb-1">
                  {performanceRating.data.ratingTitle}
                </h3>

                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  {performanceRating.data.summary}
                </p>

                {performanceRating.data.strengths?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                      Key Strengths:
                    </span>
                    <ul className="list-disc list-inside text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-0.5">
                      {performanceRating.data.strengths.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {performanceRating.data.areasToImprove?.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block mb-1">
                      Focus Areas:
                    </span>
                    <ul className="list-disc list-inside text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-0.5">
                      {performanceRating.data.areasToImprove.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {performanceRating.data.actionableTip && (
                  <div className="bg-amber-100/80 dark:bg-amber-950/40 border border-amber-900/30 p-2.5 rounded-xl flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-amber-950 dark:text-amber-200 leading-snug">
                      <span className="uppercase font-black text-[10px]">AI Tip: </span>
                      {performanceRating.data.actionableTip}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {wrongQuestions.length > 0 && (
            <div className="mb-6 flex items-center justify-between bg-[#C19BF5]/20 border-2 border-slate-950 rounded-xl p-3">
              <div className="flex items-center gap-2 text-left">
                <Sparkles className="w-5 h-5 text-purple-700 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-black uppercase text-slate-950 dark:text-white">
                  Gemini AI Feedback Ready
                </span>
              </div>
              <button
                onClick={explainAllWrongAnswers}
                className="px-3 py-1.5 bg-[#C19BF5] border-2 border-slate-950 font-black text-xs uppercase text-slate-950 rounded-lg shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                Explain All
              </button>
            </div>
          )}

          <div className="space-y-4">
            {sampleQuestions.map((q) => {
              const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
              const exp = explanations[q.id];

              return (
                <div
                  key={q.id}
                  className={`text-left p-4 border-2 border-slate-950 rounded-xl transition-all ${
                    isCorrect
                      ? "bg-slate-50 dark:bg-slate-800/50"
                      : "bg-red-50/60 dark:bg-red-950/20 border-red-950 dark:border-red-800"
                  }`}
                >
                  <p className="font-extrabold text-slate-955 dark:text-slate-200 mb-2 leading-tight">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-650 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-350">
                      Your answer: {q.options[selectedAnswers[q.id]] ?? "None"}
                    </span>
                  </div>

                  {!isCorrect && (
                    <>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 shrink-0" />
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Correct answer: {q.options[q.correctAnswer]}
                        </span>
                      </div>

                      {/* AI Explanation Block */}
                      <div className="mt-3 pt-3 border-t-2 border-slate-950/10 dark:border-slate-800">
                        {exp?.loading ? (
                          <div className="flex items-center gap-2 py-2 text-xs font-black text-purple-700 dark:text-purple-300">
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            <span>Asking Gemini AI tutor for tailored feedback...</span>
                          </div>
                        ) : exp?.error ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{exp.error}</span>
                            </div>
                            <button
                              onClick={() => fetchExplanation(q)}
                              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-950 dark:border-white font-bold text-xs rounded shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                            >
                              Retry AI Explanation
                            </button>
                          </div>
                        ) : exp?.text ? (
                          <div className="bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-900 dark:border-purple-600 p-3 rounded-xl">
                            <div className="flex items-center justify-between gap-1.5 mb-1.5 text-purple-900 dark:text-purple-300">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 stroke-[2.5px]" />
                                <span className="text-xs font-black uppercase tracking-wide">
                                  Gemini AI Feedback
                                </span>
                              </div>

                              {/* Feedback Rating controls */}
                              <div className="flex items-center gap-1">
                                {explanationRatings[q.id] ? (
                                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-950 flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3px]" />
                                    Rated
                                  </span>
                                ) : (
                                  <>
                                    <span className="text-[10px] font-bold text-slate-500 mr-1">Rate:</span>
                                    <button
                                      onClick={() => rateExplanation(q.id, "up")}
                                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all cursor-pointer"
                                      title="Helpful AI Feedback"
                                    >
                                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                                    </button>
                                    <button
                                      onClick={() => rateExplanation(q.id, "down")}
                                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-950 hover:bg-rose-100 dark:hover:bg-rose-900 transition-all cursor-pointer"
                                      title="Needs Improvement"
                                    >
                                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                              {exp.text}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => fetchExplanation(q)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#88D3E6] border-2 border-slate-950 text-slate-950 font-black text-xs uppercase tracking-wide rounded-lg shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 transition-all cursor-pointer mt-1"
                          >
                            <Lightbulb className="w-4 h-4 stroke-[2.5px]" />
                            Explain Wrong Answer with AI
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={restartQuiz}
              className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-[3px] border-slate-950 dark:border-white font-black uppercase text-sm rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5px]" />
              Retake
            </button>
            <button
              onClick={() =>
                onNavigate({
                  view: "moduleDetail",
                  moduleId,
                  moduleName,
                  subjectName,
                })
              }
              className="flex-1 py-3.5 px-4 bg-[#FFD54F] text-slate-950 border-[3px] border-slate-950 font-black uppercase text-sm rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() =>
            onNavigate({
              view: "moduleDetail",
              moduleId,
              moduleName,
              subjectName,
            })
          }
          className="flex items-center gap-2 px-3 py-1.5 bg-[#88D3E6] border-2 border-slate-950 text-slate-950 font-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3px]" />
          <span className="text-xs uppercase tracking-wide">Back</span>
        </button>
        <div className="text-xs font-black uppercase tracking-wider text-slate-650 dark:text-slate-400 bg-white/40 border border-slate-950 px-2.5 py-1 rounded">
          Question {currentQuestionIndex + 1} of {sampleQuestions.length}
        </div>
      </div>

      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
      >
        <div className="mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-[#FF603D] bg-[#FF603D]/10 border border-[#FF603D] px-2 py-0.5 rounded block w-fit mb-2">
            {subjectName}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white uppercase leading-snug">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.id] === index;
            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#C19BF5] text-slate-950 font-black"
                    : "bg-white dark:bg-slate-950 text-slate-950 dark:text-white font-bold"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                      isSelected
                        ? "bg-white"
                        : "bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-6 border-t-2 border-slate-950/10 dark:border-slate-800/80">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`font-black uppercase text-sm py-3 px-6 rounded-xl border-[3px] border-slate-950 dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer ${
              currentQuestionIndex === 0
                ? "text-slate-400 bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed opacity-50 shadow-none"
                : "text-slate-950 bg-white dark:bg-slate-800 dark:text-white"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            className={`font-black uppercase text-sm py-3 px-8 rounded-xl border-[3px] border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer ${
              selectedAnswers[currentQuestion.id] === undefined
                ? "bg-slate-100 text-slate-400 border-slate-350 cursor-not-allowed shadow-none"
                : "bg-[#FF603D] text-slate-955"
            }`}
          >
            {currentQuestionIndex === sampleQuestions.length - 1
              ? "Finish"
              : "Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
