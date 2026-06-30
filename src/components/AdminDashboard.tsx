import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusCircle,
  FileText,
  HelpCircle,
  Save,
  CheckCircle,
  Trash2,
  Image as ImageIcon,
  File,
  Upload,
  BrainCircuit,
  Zap,
} from "lucide-react";
import { subjects } from "../data";
import { Subject, Module, QuizQuestion } from "../types";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "material" | "quiz" | "mindmap" | "sprint" | "pyq"
  >("material");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [sprintType, setSprintType] = useState<
    "pdf" | "handwritten" | "suggestions"
  >("pdf");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    }
  };

  // Quiz specific state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);

  const allSubjects = subjects;
  const currentSubject = allSubjects.find((s) => s.id === selectedSubject);

  let totalQuizzes = 0;
  let totalQuestions = 0;
  let difficultyScores: number[] = [];

  subjects.forEach((subject) => {
    subject.modules.forEach((module) => {
      if (
        module.content.quiz &&
        module.content.quiz.available &&
        module.content.quiz.questions
      ) {
        totalQuizzes++;
        totalQuestions += module.content.quiz.questions.length;

        module.content.quiz.questions.forEach((q) => {
          if (q.difficulty === "easy") difficultyScores.push(1);
          else if (q.difficulty === "medium") difficultyScores.push(2);
          else if (q.difficulty === "hard") difficultyScores.push(3);
        });
      }
    });
  });

  const avgDifficultyScore =
    difficultyScores.length > 0
      ? difficultyScores.reduce((a, b) => a + b, 0) / difficultyScores.length
      : 0;

  let avgDifficultyLabel = "N/A";
  if (avgDifficultyScore > 0) {
    if (avgDifficultyScore < 1.6) avgDifficultyLabel = "Easy";
    else if (avgDifficultyScore < 2.4) avgDifficultyLabel = "Medium";
    else avgDifficultyLabel = "Hard";
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        question: "",
        options: ["", ""],
        correctOptionIndex: 0,
        difficulty: "medium",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQs = [...questions];
    newQs[index].question = text;
    setQuestions(newQs);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const newQs = [...questions];
    newQs[qIndex].options[oIndex] = text;
    setQuestions(newQs);
  };

  const handleAddOption = (qIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options.push("");
    setQuestions(newQs);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const newQs = [...questions];
    if (newQs[qIndex].options.length <= 2) return; // Keep at least 2 options
    newQs[qIndex].options.splice(oIndex, 1);
    if (newQs[qIndex].correctOptionIndex >= newQs[qIndex].options.length) {
      newQs[qIndex].correctOptionIndex = newQs[qIndex].options.length - 1;
    }
    setQuestions(newQs);
  };

  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].correctOptionIndex = oIndex;
    setQuestions(newQs);
  };

  const handleDifficultyChange = (
    qIndex: number,
    difficulty: "easy" | "medium" | "hard",
  ) => {
    const newQs = [...questions];
    newQs[qIndex].difficulty = difficulty;
    setQuestions(newQs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    }
  };

  const handleSave = () => {
    if (!currentSubject || !title || !description) return;
    if (activeTab !== "sprint" && activeTab !== "pyq" && !selectedModule) return;

    if (activeTab === "sprint") {
      if (!currentSubject.sprint) currentSubject.sprint = [];
      currentSubject.sprint.push({
        id: crypto.randomUUID(),
        title,
        type: sprintType,
        url,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTitle("");
        setDescription("");
        setUrl("");
        setQuestions([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 3000);
      return;
    }

    if (activeTab === "pyq") {
      if (!currentSubject.pyqs) currentSubject.pyqs = [];
      currentSubject.pyqs.push({
        id: crypto.randomUUID(),
        year: title,
        url,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTitle("");
        setDescription("");
        setUrl("");
        setQuestions([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 3000);
      return;
    }

    const module = currentSubject.modules.find((m) => m.id === selectedModule);
    if (module) {
      if (activeTab === "material") {
        if (!module.content.studyMaterial.materials) {
          module.content.studyMaterial.materials = [];
        }
        module.content.studyMaterial.materials.push({
          id: crypto.randomUUID(),
          title,
          description,
          url,
        });
        // We can also update the main study material object if it's the first one, for backward compatibility
        if (module.content.studyMaterial.materials.length === 1) {
          module.content.studyMaterial.title = title;
          module.content.studyMaterial.description = description;
          module.content.studyMaterial.url = url;
          module.content.studyMaterial.available = true;
        }
      } else if (activeTab === "quiz") {
        module.content.quiz = {
          title,
          description,
          url,
          available: true,
          questions: questions.length > 0 ? questions : undefined,
        };
      } else if (activeTab === "mindmap") {
        module.content.mindMap = {
          title,
          description,
          url,
          available: true,
        };
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTitle("");
        setDescription("");
        setUrl("");
        setQuestions([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 3000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage course content, study materials, and quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Total Quizzes
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalQuizzes}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Total Questions
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {totalQuestions}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Average Difficulty
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {avgDifficultyLabel}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("material")}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "material"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-5 h-5" />
            Study Material
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "quiz"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            Quiz
          </button>
          <button
            onClick={() => setActiveTab("mindmap")}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "mindmap"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-5 h-5" />
            Mind Map
          </button>
          <button
            onClick={() => setActiveTab("sprint")}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "sprint"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Zap className="w-5 h-5" />
            Exam Sprint
          </button>
          <button
            onClick={() => setActiveTab("pyq")}
            className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "pyq"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-5 h-5" />
            PYQ
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject || ""}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedModule("");
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a subject</option>
                {allSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === "sprint" ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Sprint Content Type
                </label>
                <select
                  value={sprintType || "pdf"}
                  onChange={(e) => setSprintType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pdf">PDF Upload</option>
                  <option value="handwritten">Handwritten Notes</option>
                  <option value="suggestions">Last-Minute Suggestions</option>
                </select>
              </div>
            ) : activeTab === "pyq" ? (
              <div /> // PYQ doesn't need module or sprint type
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Module
                </label>
                <select
                  value={selectedModule || ""}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!currentSubject}
                >
                  <option value="">Select a module</option>
                  {currentSubject?.modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <hr className="border-slate-200 dark:border-slate-800 my-4" />

          {activeTab === "material" && selectedModule && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Existing Study Materials
              </h3>
              <div className="space-y-3">
                {currentSubject?.modules
                  .find((m) => m.id === selectedModule)
                  ?.content.studyMaterial.materials?.map((mat, idx) => (
                    <div
                      key={mat.id || idx}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {mat.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {mat.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {mat.url && (
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const mod = currentSubject?.modules.find(
                              (m) => m.id === selectedModule
                            );
                            if (mod && mod.content.studyMaterial.materials) {
                              mod.content.studyMaterial.materials =
                                mod.content.studyMaterial.materials.filter(
                                  (m) => m.id !== mat.id
                                );
                              // Force re-render
                              setSelectedModule("");
                              setTimeout(() => setSelectedModule(selectedModule), 0);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {(!currentSubject?.modules.find((m) => m.id === selectedModule)
                  ?.content.studyMaterial.materials ||
                  currentSubject?.modules.find((m) => m.id === selectedModule)
                    ?.content.studyMaterial.materials?.length === 0) && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No materials added yet.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {activeTab === "material"
                  ? "Material Title"
                  : activeTab === "mindmap"
                    ? "Mind Map Title"
                    : activeTab === "pyq"
                      ? "Year (e.g., 2023)"
                      : activeTab === "sprint"
                        ? "Sprint Title"
                        : "Quiz Title"}
              </label>
              <input
                type="text"
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={activeTab === "pyq" ? "2023" : "e.g., Quantum Mechanics Overview"}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the content..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {(activeTab === "material" || activeTab === "mindmap" || activeTab === "sprint" || activeTab === "pyq") ? "Upload Resource" : "Resource URL (Optional)"}
              </label>
              {(activeTab === "material" ||
                activeTab === "mindmap" ||
                activeTab === "sprint" ||
                activeTab === "pyq") ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500"}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={
                      activeTab === "mindmap"
                        ? "image/*,application/pdf"
                        : "application/pdf"
                    }
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600 dark:text-indigo-400">
                      {activeTab === "mindmap" ? <ImageIcon className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {url ? "File selected for upload" : `Click or drag and drop to upload ${activeTab === "mindmap" ? "Image/PDF" : "PDF"}`}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {url ? "Click or drag and drop to replace file" : "Max file size: 50MB"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={url || ""}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {activeTab === "quiz" && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Quiz Questions
                  </h3>
                  <button
                    onClick={handleAddQuestion}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                <AnimatePresence>
                  {questions.map((q, qIndex) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                            Question {qIndex + 1}
                          </label>
                          <input
                            type="text"
                            value={q.question || ""}
                            onChange={(e) =>
                              handleQuestionChange(qIndex, e.target.value)
                            }
                            placeholder="Enter your question here..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                            Difficulty
                          </label>
                          <select
                            value={q.difficulty || "medium"}
                            onChange={(e) =>
                              handleDifficultyChange(
                                qIndex,
                                e.target.value as "easy" | "medium" | "hard",
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-5"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Options (Select the correct one)
                        </label>
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-option-${q.id}`}
                              checked={q.correctOptionIndex === oIndex}
                              onChange={() =>
                                handleCorrectOptionChange(qIndex, oIndex)
                              }
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-full"
                            />
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={opt || ""}
                                onChange={(e) =>
                                  handleOptionChange(
                                    qIndex,
                                    oIndex,
                                    e.target.value,
                                  )
                                }
                                placeholder={`Option ${oIndex + 1}`}
                                className={`flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  q.correctOptionIndex === oIndex
                                    ? "border-emerald-500 dark:border-emerald-500/50 shadow-sm"
                                    : "border-slate-200 dark:border-slate-700"
                                }`}
                              />
                              <button
                                onClick={() =>
                                  handleRemoveOption(qIndex, oIndex)
                                }
                                disabled={q.options.length <= 2}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                title="Remove Option"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddOption(qIndex)}
                          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mt-2 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Option
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {questions.length === 0 && (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      No questions added yet.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click the "Add Question" button to start building your
                      quiz.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Successfully saved to module!
              </motion.div>
            ) : (
              <div />
            )}

            <button
              onClick={handleSave}
              disabled={
                (!selectedModule && activeTab !== "sprint" && activeTab !== "pyq") ||
                !title ||
                !description ||
                !selectedSubject
              }
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-5 h-5" />
              Save{" "}
              {activeTab === "material"
                ? "Material"
                : activeTab === "mindmap"
                  ? "Mind Map"
                  : activeTab === "sprint"
                    ? "Content"
                    : activeTab === "pyq"
                      ? "PYQ"
                      : "Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
