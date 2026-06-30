import { useState } from "react";
import { motion } from "motion/react";
import { ViewState } from "../types";
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw } from "lucide-react";

interface QuizProps {
  moduleId: string;
  moduleName: string;
  subjectName: string;
  onNavigate: (view: ViewState) => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

// Sample questions, we can generate them dynamically or have fixed ones for the prototype
const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "Which of the following is a key concept in this module?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 1, // 0-indexed, so 'Option B'
  },
  {
    id: 2,
    text: "What is the primary application of the theories discussed?",
    options: [
      "Data Analysis",
      "Web Development",
      "Machine Learning",
      "All of the above",
    ],
    correctAnswer: 3,
  },
  {
    id: 3,
    text: "Which formula or method is mostly used to solve standard problems in this section?",
    options: ["Method X", "Method Y", "Method Z", "None of the above"],
    correctAnswer: 0,
  },
];

export default function Quiz({
  moduleId,
  moduleName,
  subjectName,
  onNavigate,
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [isFinished, setIsFinished] = useState(false);

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

  if (isFinished) {
    const score = calculateScore();
    const percentage = Math.round((score / sampleQuestions.length) * 100);

    return (
      <div className="pb-24 md:pb-8 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {percentage}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Quiz Completed!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            You scored {score} out of {sampleQuestions.length} in {moduleName}.
          </p>

          <div className="space-y-4">
            {sampleQuestions.map((q) => {
              const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className="text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl"
                >
                  <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Your answer: {q.options[selectedAnswers[q.id]]}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-0" />
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Correct answer: {q.options[q.correctAnswer]}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={restartQuiz}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
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
              className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8 max-w-2xl mx-auto">
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
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Module</span>
        </button>
        <div className="text-sm font-bold text-slate-400 dark:text-slate-500">
          Question {currentQuestionIndex + 1} of {sampleQuestions.length}
        </div>
      </div>

      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800"
      >
        <div className="mb-6">
          <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block mb-2">
            {subjectName} - {moduleName}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.id] === index;
            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-100"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-indigo-600 dark:border-indigo-400"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`font-bold py-3 px-6 rounded-xl transition-colors ${
              currentQuestionIndex === 0
                ? "text-slate-400 bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-50"
                : "text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            className={`font-bold py-3 px-8 rounded-xl transition-colors ${
              selectedAnswers[currentQuestion.id] === undefined
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
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
