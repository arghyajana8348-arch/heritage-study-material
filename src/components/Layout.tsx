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
  Bell,
  Shield,
  Menu,
  GraduationCap,
} from "lucide-react";
import { supabase } from "../lib/supabase";
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
      <div className="relative flex items-center w-full h-11 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] rounded-xl transition-all">
        <Search className="w-5 h-5 ml-3 text-slate-900 dark:text-white shrink-0" />
        <input
          type="text"
          placeholder="Search subjects, modules..."
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm px-3 text-slate-900 dark:text-white placeholder:text-slate-500 font-semibold"
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
            className="mr-3 text-slate-900 dark:text-white hover:scale-110 transition-transform"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] overflow-hidden"
          >
            {results.length > 0 ? (
              <div className="py-1">
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
                    className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-start gap-3 transition-colors border-b-2 border-slate-150 dark:border-slate-800 last:border-b-0"
                  >
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-[#C19BF5] border-2 border-slate-950 flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                      {result.type === "subject" ? (
                        <Layers className="w-4 h-4 text-slate-950" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-950" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {result.type === "subject"
                          ? result.subject.name
                          : result.module.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {result.type === "subject"
                          ? ""
                          : `${result.subject.name} • Module ${result.module.number}`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-900 dark:text-white mt-2 shrink-0 stroke-[3px]" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center font-bold text-sm text-slate-650 dark:text-slate-400">
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error fetching user in layout:", error);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const accountName = user?.user_metadata?.full_name || "Student User";
  const userEmail = user?.email || "student@heritageit.edu";
  const emailHandle = user?.email ? `@${user.email.split("@")[0]}` : "@student";
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)
    : "AJ";

  const sidebarItems = [
    {
      id: "dashboard",
      icon: <LayoutDashboard className="w-6 h-6 stroke-[2.5px]" />,
      label: "Dashboard",
      color: "bg-[#FFD54F]",
      active: currentView.view === "dashboard",
      onClick: () => onNavigate({ view: "dashboard" }),
    },
    {
      id: "library",
      icon: <BookOpen className="w-6 h-6 stroke-[2.5px]" />,
      label: "Library",
      color: "bg-[#C19BF5]",
      active: ["subjects", "modules", "moduleDetail"].includes(currentView.view),
      onClick: () => onNavigate({ view: "subjects" }),
    },
    {
      id: "classroom",
      icon: <GraduationCap className="w-6 h-6 stroke-[2.5px]" />,
      label: "Google Classroom",
      color: "bg-[#A8E6CF]",
      active: ["classroom", "classroomDetail"].includes(currentView.view),
      onClick: () => onNavigate({ view: "classroom" }),
    },
    {
      id: "sprint",
      icon: <Zap className="w-6 h-6 stroke-[2.5px]" />,
      label: "Exam Sprint",
      color: "bg-[#FF603D]",
      active: ["examSprint", "sprintContent"].includes(currentView.view),
      onClick: () => onNavigate({ view: "examSprint" }),
    },
    ...(isAdmin
      ? [
          {
            id: "admin",
            icon: <Shield className="w-6 h-6 stroke-[2.5px]" />,
            label: "Admin Panel",
            color: "bg-[#88D3E6]",
            active: currentView.view === "adminDashboard",
            onClick: () => onNavigate({ view: "adminDashboard" }),
          },
        ]
      : []),
    {
      id: "about",
      icon: <Info className="w-6 h-6 stroke-[2.5px]" />,
      label: "About Us",
      color: "bg-[#E8F0F2]",
      active: currentView.view === "about",
      onClick: () => onNavigate({ view: "about" }),
    },
    {
      id: "account",
      icon: <User className="w-6 h-6 stroke-[2.5px]" />,
      label: "Account",
      color: "bg-[#FFD3B6]",
      active: currentView.view === "account",
      onClick: () => onNavigate({ view: "account" }),
    },
  ];

  let headerTitle = "";
  let showBack =
    currentView.view !== "dashboard" &&
    currentView.view !== "adminDashboard" &&
    currentView.view !== "classroom" &&
    currentView.view !== "account";

  if (currentView.view === "dashboard") headerTitle = "Overview";
  if (currentView.view === "classroom") headerTitle = "Google Classroom";
  if (currentView.view === "classroomDetail") headerTitle = currentView.courseName;
  if (currentView.view === "adminDashboard") headerTitle = "Admin Dashboard";
  if (currentView.view === "account") headerTitle = "Account Settings";
  if (currentView.view === "subjects") headerTitle = "All Subjects";
  if (currentView.view === "modules") headerTitle = currentView.subjectName;
  if (currentView.view === "moduleDetail")
    headerTitle = `Module ${currentView.moduleId.split("-m")[1]}`;

  return (
    <div className="min-h-screen bg-[#BACED6] dark:bg-[#12161A] font-sans text-slate-950 dark:text-white transition-colors duration-300 flex overflow-hidden">
      {!isLogin && (
        <>
          {isSidebarExpanded && (
            <div 
              onClick={() => setIsSidebarExpanded(false)}
              className="md:hidden fixed inset-0 bg-slate-955/40 backdrop-blur-sm z-40 transition-opacity"
            />
          )}
          <aside className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 border-r-[3px] border-slate-950 dark:border-white bg-slate-900 dark:bg-slate-955 flex flex-col justify-between py-6 transition-all duration-300 shrink-0 ${
            isSidebarExpanded 
              ? "w-72 translate-x-0" 
              : "w-20 -translate-x-full md:translate-x-0 md:items-center"
          }`}>
            {/* Logo */}
            <div 
              onClick={() => onNavigate({ view: "dashboard" })}
              className={`flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all px-4 w-full ${
                isSidebarExpanded ? "justify-between" : "justify-center"
              }`}
              title="Heritage Study"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 bg-[#FFD54F] border-[3px] border-slate-955 rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] rotate-[-2deg] shrink-0">
                  <BookOpen className="w-5 h-5 text-slate-955 stroke-[3px]" />
                </div>
                {isSidebarExpanded && (
                  <span className="font-black text-xl tracking-tight text-white uppercase italic truncate">
                    Heritage Study
                  </span>
                )}
              </div>

              {/* Mobile Close Button */}
              {isSidebarExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidebarExpanded(false);
                  }}
                  className="md:hidden p-1.5 rounded-lg bg-white text-slate-955 border-2 border-slate-950 shadow-[1.5px_1.5px_0px_0px_#000] shrink-0 active:translate-y-0.5 transition-transform"
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              )}
            </div>

            {/* Navigation Icons/Buttons */}
            <nav className="flex-1 flex flex-col gap-3 w-full px-3 pt-10">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    if (window.innerWidth < 768) {
                      setIsSidebarExpanded(false);
                    }
                  }}
                  className={`w-full flex items-center border-[3px] border-slate-950 dark:border-white transition-all cursor-pointer rounded-xl ${
                    isSidebarExpanded 
                      ? "justify-start px-4 py-3 gap-3.5" 
                      : "justify-center p-2.5"
                  } ${
                    item.active 
                      ? `${item.color} text-slate-955 border-slate-955 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` 
                      : "bg-transparent text-slate-400 hover:text-white border-transparent"
                  }`}
                  title={item.label}
                >
                  <div className="shrink-0">{item.icon}</div>
                  {isSidebarExpanded && (
                    <span className="font-black text-sm uppercase italic tracking-wide truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Logout at bottom */}
            {onLogout && (
              <div className="w-full px-3">
                <button
                  onClick={onLogout}
                  className={`w-full flex items-center border-[3px] border-slate-950 bg-red-100 text-red-600 shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer rounded-xl ${
                    isSidebarExpanded 
                      ? "justify-start px-4 py-3 gap-3.5" 
                      : "justify-center p-2.5"
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 stroke-[2.5px] shrink-0" />
                  {isSidebarExpanded && (
                    <span className="font-black text-sm uppercase italic tracking-wide truncate">
                      Sign Out
                    </span>
                  )}
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {!isLogin && (
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`absolute z-45 bg-[#FFD54F] border-[3px] border-slate-955 text-slate-955 p-2 rounded-xl shadow-[3px_3px_0px_0px_#000] hover:bg-[#ebc238] transition-all cursor-pointer flex items-center justify-center top-3.5 md:top-6.5 left-4`}
            title={isSidebarExpanded ? "Collapse Menu" : "Expand Menu"}
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="w-4.5 h-4.5 stroke-[3px]" />
            ) : (
              <Menu className="w-4.5 h-4.5 stroke-[3px]" />
            )}
          </button>
        )}
        {isLogin && (
          <div className="absolute top-6 right-6 z-10 md:hidden">
            <button
              onClick={onToggleDarkMode}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white text-slate-950 dark:text-white hover:scale-105 active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 stroke-[2.5px]" />
              ) : (
                <Moon className="w-5 h-5 stroke-[2.5px]" />
              )}
            </button>
          </div>
        )}
        {isLogin && (
          <div className="absolute top-6 right-6 z-10 hidden md:block">
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white text-slate-950 dark:text-white hover:scale-105 active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] font-extrabold text-sm"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 stroke-[3px]" />
              ) : (
                <Moon className="w-4 h-4 stroke-[3px]" />
              )}
              {darkMode ? "LIGHT MODE" : "DARK MODE"}
            </button>
          </div>
        )}

        {!isLogin && (
          <header className="bg-white dark:bg-slate-950 border-b-[3px] border-slate-950 dark:border-white pl-16 pr-4 md:pl-20 md:pr-8 flex items-center shrink-0 z-40 h-18 py-4 md:h-24 md:py-6 overflow-visible transition-colors duration-300">
            <div className="w-10 md:w-auto md:min-w-[80px]">
              {showBack && (
                <button
                  onClick={onPop}
                  className="p-2 -ml-2 md:ml-0 md:px-4 md:py-2.5 rounded-xl bg-[#FFD54F] border-[3px] border-slate-950 dark:border-white text-slate-950 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-2"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3px]" />
                  <span className="hidden md:inline font-bold text-sm tracking-wide">
                    BACK
                  </span>
                </button>
              )}
            </div>

            <h1 className="hidden md:block font-black text-slate-950 dark:text-white text-2xl truncate px-6 uppercase italic tracking-wide">
              {headerTitle}
            </h1>

            <GlobalSearch onNavigate={onNavigate} />            <div className="flex items-center gap-3 ml-auto relative">
              {/* Theme Toggle */}
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white text-slate-955 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:scale-105 transition-all shrink-0 cursor-pointer"
                aria-label="Toggle dark/light theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 stroke-[2.5px]" />
                ) : (
                  <Moon className="w-5 h-5 stroke-[2.5px]" />
                )}
              </button>

              {/* Notification Bell */}
              <button
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white text-slate-950 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-all relative shrink-0"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[2.5px]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF603D] rounded-full border-2 border-slate-950"></span>
              </button>

              {/* Profile Card */}
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 md:pr-3 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-xl shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-left shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-[#C19BF5] border-2 border-slate-950 flex items-center justify-center font-black shadow-[1.5px_1.5px_0px_0px_#000] text-slate-955 shrink-0 uppercase text-xs">
                  {userInitials}
                </div>
                <div className="hidden md:block min-w-0 pr-1 select-none leading-none">
                  <h4 className="font-black text-xs text-slate-950 dark:text-white truncate uppercase mb-0.5">{accountName}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">{emailHandle}</p>
                </div>
              </button>

              {/* Account Dropdown Panel */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] p-5 text-slate-950 dark:text-white"
                  >
                    <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 rounded-xl bg-[#C19BF5] border-2 border-slate-950 flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_#000] text-slate-955 uppercase">
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-slate-955 dark:text-white truncate uppercase leading-tight">{accountName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold truncate mt-0.5">{userEmail}</p>
                      </div>
                    </div>
                    <div className="py-4 space-y-2">
                      <button
                        onClick={() => {
                          onNavigate({ view: "account" });
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left text-sm text-slate-700 dark:text-slate-350"
                      >
                        <User className="w-4 h-4 stroke-[2px]" />
                        Account Settings
                      </button>
                      <button
                        onClick={onToggleDarkMode}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left text-sm text-slate-700 dark:text-slate-350"
                      >
                        {darkMode ? <Sun className="w-4 h-4 stroke-[2px]" /> : <Moon className="w-4 h-4 stroke-[2px]" />}
                        {darkMode ? "Light Mode" : "Dark Mode"}
                      </button>
                    </div>
                    <div className="pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                      {onLogout && (
                        <button
                          onClick={() => {
                            onLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-black bg-red-50 hover:bg-red-100 text-red-655 border-2 border-red-500/30 transition-all text-left text-sm cursor-pointer shadow-[2px_2px_0px_0px_rgba(239,68,68,0.2)]"
                        >
                          <LogOut className="w-4 h-4 stroke-[2.5px]" />
                          Sign Out
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto relative bg-[#BACED6] dark:bg-[#12161A] transition-colors duration-300">
          <div
            className={`max-w-7xl mx-auto w-full ${isLogin ? "h-full" : "p-4 md:p-8"}`}
          >
            {children}
          </div>
        </main>

        {!isLogin && (
          <nav className="md:hidden bg-white dark:bg-slate-950 border-t-[3px] border-slate-950 dark:border-white px-4 py-3 flex justify-around shrink-0 pb-safe transition-colors duration-300 z-10 shadow-[0_-4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_-4px_0_0_rgba(255,255,255,1)]">
            <button
              onClick={() => onNavigate({ view: "dashboard" })}
              className={`flex flex-col items-center gap-1 font-bold ${
                currentView.view === "dashboard" ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl border-2 transition-all ${
                  currentView.view === "dashboard"
                    ? "bg-[#FFD54F] border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-transparent border-transparent"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-wide">Home</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "subjects" })}
              className={`flex flex-col items-center gap-1 font-bold ${
                ["subjects", "modules", "moduleDetail"].includes(currentView.view)
                  ? "text-slate-950 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl border-2 transition-all ${
                  ["subjects", "modules", "moduleDetail"].includes(currentView.view)
                    ? "bg-[#C19BF5] border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-transparent border-transparent"
                }`}
              >
                <Library className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-wide">Library</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "examSprint" })}
              className={`flex flex-col items-center gap-1 font-bold ${
                ["examSprint", "sprintContent"].includes(currentView.view)
                  ? "text-slate-950 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl border-2 transition-all ${
                  ["examSprint", "sprintContent"].includes(currentView.view)
                    ? "bg-[#FF603D] border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-transparent border-transparent"
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-wide">Sprint</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "classroom" })}
              className={`flex flex-col items-center gap-1 font-bold ${
                ["classroom", "classroomDetail"].includes(currentView.view) ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl border-2 transition-all ${
                  ["classroom", "classroomDetail"].includes(currentView.view)
                    ? "bg-[#A8E6CF] border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-transparent border-transparent"
                }`}
              >
                <GraduationCap className="w-5 h-5 text-slate-950 dark:text-white" />
              </div>
              <span className="text-[10px] tracking-wide">Classroom</span>
            </button>
            <button
              onClick={() => onNavigate({ view: "account" })}
              className={`flex flex-col items-center gap-1 font-bold ${
                currentView.view === "account" ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl border-2 transition-all ${
                  currentView.view === "account"
                    ? "bg-[#FFD3B6] border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-transparent border-transparent"
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-wide">Account</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
