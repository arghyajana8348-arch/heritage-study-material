import { useState, useRef, useEffect, ReactNode } from "react";
import { ViewState } from "../types";
import {
  ChevronLeft,
  Moon,
  Sun,
  LayoutDashboard,
  Library,
  BookOpen,
  Search,
  X,
  ChevronRight,
  Layers,
  FileText,
  Zap,
  LogOut,
  Settings,
  Info,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { subjects } from "../data";

interface LayoutProps {
  currentView: ViewState;
  onPop: () => void;
  onNavigate: (view: ViewState) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  children: ReactNode;
}

function GlobalSearch({
  onNavigate,
}: {
  onNavigate: (view: ViewState) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const getResults = () => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const results: any[] = [];

    subjects.forEach((subject) => {
      if (
        subject.name.toLowerCase().includes(lowerQuery) ||
        subject.code.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ type: "subject", subject });
      }
      subject.modules.forEach((module) => {
        if (module.name.toLowerCase().includes(lowerQuery)) {
          results.push({ type: "module", subject, module });
        }
      });
    });

    return results.slice(0, 5); // Limit to 5 results
  };

  const results = getResults();

  return (
    <div
      className="relative z-50 flex-1 max-w-md ml-4 mr-4 md:mr-8"
      ref={searchRef}
    >
      <div className="relative flex items-center w-full h-10 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 dark:focus-within:border-indigo-500/50 transition-all">
        <Search className="w-4 h-4 ml-3 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search subjects, modules..."
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm px-3 text-slate-900 dark:text-white placeholder:text-slate-500"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="mr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                      if (result.type === "subject") {
                        onNavigate({
                          view: "modules",
                          subjectId: result.subject.id,
                          subjectName: result.subject.name,
                        });
                      } else {
                        onNavigate({
                          view: "moduleDetail",
                          moduleId: result.module.id,
                          moduleName: result.module.name,
                          subjectName: result.subject.name,
                        });
                      }
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 transition-colors"
                  >
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                      {result.type === "subject" ? (
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {result.type === "subject"
                          ? result.subject.name
                          : result.module.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {result.type === "subject"
                          ? ""
                          : `${result.subject.name} • Module ${result.module.number}`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 mt-2 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Layout({
  currentView,
  onPop,
  onNavigate,
  darkMode,
  onToggleDarkMode,
  onLogout,
  isAdmin,
  children,
}: LayoutProps) {
  const isLogin = currentView.view === "login";

  let headerTitle = "";
  let showBack =
    currentView.view !== "dashboard" &&
    currentView.view !== "adminDashboard" &&
    currentView.view !== "account";

  if (currentView.view === "dashboard") headerTitle = "Overview";
  if (currentView.view === "adminDashboard") headerTitle = "Admin Dashboard";
  if (currentView.view === "account") headerTitle = "Account Settings";
  if (currentView.view === "subjects") headerTitle = "All Subjects";
  if (currentView.view === "modules") headerTitle = currentView.subjectName;
  if (currentView.view === "moduleDetail")
    headerTitle = `Module ${currentView.moduleId.split("-m")[1]}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 flex">
      {!isLogin && (
        <aside className="hidden md:flex flex-col w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 transition-colors duration-300">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Heritage Study
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => onNavigate({ view: "dashboard" })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView.view === "dashboard" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => onNavigate({ view: "subjects" })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${["subjects", "modules", "moduleDetail"].includes(currentView.view) ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              <Library className="w-5 h-5" />
              Library
            </button>
            <button
              onClick={() => onNavigate({ view: "examSprint" })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${["examSprint", "sprintContent"].includes(currentView.view) ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              <Zap className="w-5 h-5" />
              Exam Sprint
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate({ view: "adminDashboard" })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView.view === "adminDashboard" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                <Settings className="w-5 h-5" />
                Admin Panel
              </button>
            )}
            <button
              onClick={() => onNavigate({ view: "about" })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView.view === "about" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              <Info className="w-5 h-5" />
              About Us
            </button>
            <button
              onClick={() => onNavigate({ view: "account" })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView.view === "account" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              <User className="w-5 h-5" />
              Account
            </button>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={onToggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            )}
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {isLogin && (
          <div className="absolute top-6 right-6 z-10 md:hidden">
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
        {isLogin && (
          <div className="absolute top-6 right-6 z-10 hidden md:block">
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm font-medium text-sm"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        )}

        {!isLogin && (
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4 md:py-6 md:px-8 flex items-center shrink-0 z-10 h-16 md:h-24 transition-colors duration-300">
            <div className="w-10 md:w-auto md:min-w-[80px]">
              {showBack && (
                <button
                  onClick={onPop}
                  className="p-2 -ml-2 md:ml-0 md:px-4 md:py-2.5 rounded-full md:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-2 md:border border-transparent md:border-slate-200 dark:md:border-slate-700"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="hidden md:inline font-medium text-sm">
                    Back
                  </span>
                </button>
              )}
            </div>

            <h1 className="hidden md:block font-bold text-slate-800 dark:text-slate-100 text-2xl truncate px-6">
              {headerTitle}
            </h1>

            <GlobalSearch onNavigate={onNavigate} />

            <div className="w-20 md:hidden flex justify-end gap-1">
              <button
                onClick={onToggleDarkMode}
                className="p-2 -mr-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 -mr-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <div
            className={`max-w-7xl mx-auto w-full ${isLogin ? "h-full" : "p-0 md:p-8"}`}
          >
            {children}
          </div>
        </main>

        {!isLogin && (
          <nav className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-around shrink-0 pb-safe transition-colors duration-300 z-10">
            <button
              onClick={() => onNavigate({ view: "dashboard" })}
              className={`flex flex-col items-center gap-1 ${currentView.view === "dashboard" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
            >
              <div
                className={`p-1.5 rounded-xl ${currentView.view === "dashboard" ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-transparent"}`}
              >
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "subjects" })}
              className={`flex flex-col items-center gap-1 ${["subjects", "modules", "moduleDetail"].includes(currentView.view) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
            >
              <div
                className={`p-1.5 rounded-xl ${["subjects", "modules", "moduleDetail"].includes(currentView.view) ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-transparent"}`}
              >
                <Library className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">Library</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "examSprint" })}
              className={`flex flex-col items-center gap-1 ${["examSprint", "sprintContent"].includes(currentView.view) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}
            >
              <div
                className={`p-1.5 rounded-xl ${["examSprint", "sprintContent"].includes(currentView.view) ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-transparent"}`}
              >
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">Sprint</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "about" })}
              className={`flex flex-col items-center gap-1 ${currentView.view === "about" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
            >
              <div
                className={`p-1.5 rounded-xl ${currentView.view === "about" ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-transparent"}`}
              >
                <Info className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">About</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "account" })}
              className={`flex flex-col items-center gap-1 ${currentView.view === "account" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
            >
              <div
                className={`p-1.5 rounded-xl ${currentView.view === "account" ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-transparent"}`}
              >
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium">Account</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate({ view: "adminDashboard" })}
                className={`flex flex-col items-center gap-1 ${currentView.view === "adminDashboard" ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`}
              >
                <div
                  className={`p-1.5 rounded-xl ${currentView.view === "adminDashboard" ? "bg-amber-50 dark:bg-amber-500/10" : "bg-transparent"}`}
                >
                  <Settings className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium">Admin</span>
              </button>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
