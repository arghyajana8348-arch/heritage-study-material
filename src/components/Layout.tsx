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
  BellOff,
  Shield,
  Menu,
  GraduationCap,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { getUserDisplayName, getUserInitials } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { subjects } from "../data";
import { AppNotification } from "../types";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../lib/notifications";

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
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const getResults = () => {
    if (!query.trim()) {
      // Return popular recommendations when query is empty
      const defaultRecs: any[] = [];
      subjects.slice(0, 4).forEach((subject) => {
        defaultRecs.push({ type: "subject", subject, isRecommended: true });
      });
      if (subjects[0]?.modules[0]) {
        defaultRecs.push({
          type: "module",
          subject: subjects[0],
          module: subjects[0].modules[0],
          isRecommended: true,
        });
      }
      if (subjects[2]?.modules[1]) {
        defaultRecs.push({
          type: "module",
          subject: subjects[2],
          module: subjects[2].modules[1],
          isRecommended: true,
        });
      }
      return defaultRecs;
    }

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
        if (
          module.name.toLowerCase().includes(lowerQuery) ||
          module.id.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ type: "module", subject, module });
        }
      });
    });

    return results.slice(0, 8); // Allow up to 8 search results
  };

  const results = getResults();
  const isQueryEmpty = !query.trim();

  return (
    <div
      className="relative z-50 flex-1 min-w-[130px] sm:min-w-[160px] max-w-xs md:max-w-sm lg:max-w-md mx-2 md:mx-3 lg:mx-6"
      ref={searchRef}
    >
      {/* Mobile Backdrop overlay when search dropdown is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center w-full h-11 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] rounded-xl transition-all z-50">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 ml-2.5 sm:ml-3 text-slate-900 dark:text-white shrink-0" />
        <input
          type="text"
          placeholder="Search subjects, modules..."
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs sm:text-sm px-2 sm:px-3 text-slate-900 dark:text-white placeholder:text-slate-500 font-semibold"
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
            className="mr-2 sm:mr-3 text-slate-900 dark:text-white hover:scale-110 transition-transform p-1"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3px]" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed left-3 right-3 top-[68px] md:absolute md:top-full md:left-0 md:right-0 md:mt-3 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"
          >
            {isQueryEmpty && (
              <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/50">
                <span className="text-xs font-black uppercase italic tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF603D]" />
                  Recommended & Popular
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Quick Access</span>
              </div>
            )}

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
                    className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 transition-colors border-b-2 border-slate-150 dark:border-slate-800 last:border-b-0 cursor-pointer active:bg-slate-200 dark:active:bg-slate-700"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-[#C19BF5] border-2 border-slate-950 flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                      {result.type === "subject" ? (
                        <Layers className="w-4 h-4 text-slate-950" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-950" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {result.type === "subject"
                            ? result.subject.name
                            : result.module.name}
                        </h4>
                        {result.isRecommended && (
                          <span className="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FFD54F] text-slate-950 border border-slate-950">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {result.type === "subject"
                          ? `${result.subject.code} • ${result.subject.modules?.length || 4} Modules`
                          : `${result.subject.name} • Module ${result.module.number}`}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-900 dark:text-white shrink-0 stroke-[3px]" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center font-bold text-sm text-slate-650 dark:text-slate-400">
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
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Notifications State & Ref
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync notifications across tabs and custom events
  useEffect(() => {
    const syncNotifs = () => setNotifications(getNotifications());
    syncNotifs();
    window.addEventListener("heritage_notifications_updated", syncNotifs);
    window.addEventListener("storage", syncNotifs);
    return () => {
      window.removeEventListener("heritage_notifications_updated", syncNotifs);
      window.removeEventListener("storage", syncNotifs);
    };
  }, []);

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

  const accountName = getUserDisplayName(user);
  const userEmail = user?.email || "student@heritageit.edu";
  const emailHandle = user?.email ? `@${user.email.split("@")[0]}` : "@student";
  const userInitials = getUserInitials(user);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
              ? "w-72 sm:w-80 translate-x-0" 
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
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 bg-[#FFD54F] border-[3px] border-slate-955 rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] rotate-[-2deg] shrink-0">
                  <BookOpen className="w-5 h-5 text-slate-955 stroke-[3px]" />
                </div>
                {isSidebarExpanded && (
                  <span className="font-black text-xl tracking-tight text-white uppercase italic truncate pe-2.5 min-w-0">
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
                      ? "justify-start px-3.5 py-3 gap-3.5" 
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
                    <span className="font-black text-sm uppercase italic tracking-wide truncate pe-2.5 min-w-0 text-left">
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
                      ? "justify-start px-3.5 py-3 gap-3.5" 
                      : "justify-center p-2.5"
                  }`}
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 stroke-[2.5px] shrink-0" />
                  {isSidebarExpanded && (
                    <span className="font-black text-sm uppercase italic tracking-wide truncate pe-2.5 min-w-0 text-left">
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
            className={`absolute z-45 bg-[#FFD54F] border-[3px] border-slate-955 text-slate-955 p-2 rounded-xl shadow-[3px_3px_0px_0px_#000] hover:bg-[#ebc238] transition-all cursor-pointer flex items-center justify-center top-3.5 sm:top-4 md:top-5 lg:top-6.5 left-3 sm:left-4`}
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
              <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 stroke-[2.5px] text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 stroke-[2.5px] text-indigo-600" />
                )}
              </motion.div>
            </button>
          </div>
        )}
        {isLogin && (
          <div className="absolute top-6 right-6 z-10 hidden md:block">
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white text-slate-950 dark:text-white hover:scale-105 active:scale-95 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] font-extrabold text-sm cursor-pointer"
            >
              <motion.div
                key={darkMode ? "dark" : "light"}
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 stroke-[3px] text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 stroke-[3px] text-indigo-600" />
                )}
              </motion.div>
              {darkMode ? "LIGHT MODE" : "DARK MODE"}
            </button>
          </div>
        )}

        {!isLogin && (
          <header className="bg-white dark:bg-slate-950 border-b-[3px] border-slate-950 dark:border-white pl-14 sm:pl-16 md:pl-18 lg:pl-20 pr-3 sm:pr-4 md:pr-6 lg:pr-8 flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3 shrink-0 z-40 h-16 sm:h-18 md:h-20 lg:h-24 py-3 md:py-4 transition-colors duration-300 overflow-visible">
            <div className="shrink-0">
              {showBack && (
                <button
                  onClick={onPop}
                  className="p-2 md:px-3 lg:px-4 md:py-2 rounded-xl bg-[#FFD54F] border-[3px] border-slate-950 dark:border-white text-slate-950 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-1.5 shrink-0"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3px]" />
                  <span className="hidden lg:inline font-bold text-sm tracking-wide">
                    BACK
                  </span>
                </button>
              )}
            </div>

            <h1 className="hidden lg:block font-black text-slate-950 dark:text-white text-xl xl:text-2xl truncate px-2 lg:px-4 xl:px-6 uppercase italic tracking-wide">
              {headerTitle}
            </h1>

            <GlobalSearch onNavigate={onNavigate} />

            <div ref={profileDropdownRef} className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 ml-auto shrink-0 relative">
              {/* Theme Toggle */}
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white text-slate-955 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer overflow-hidden"
                aria-label="Toggle dark/light theme"
              >
                <motion.div
                  key={darkMode ? "dark" : "light"}
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 stroke-[2.5px] text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 stroke-[2.5px] text-indigo-600" />
                  )}
                </motion.div>
              </button>

              {/* Notification Bell with Dropdown */}
              <div ref={notifDropdownRef} className="relative shrink-0">
                <button
                  onClick={() => {
                    setIsNotifDropdownOpen(!isNotifDropdownOpen);
                    setIsProfileDropdownOpen(false);
                  }}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white text-slate-950 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-all relative shrink-0 cursor-pointer flex items-center justify-center"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 stroke-[2.5px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-[#FF603D] text-white font-black text-[10px] rounded-full border-2 border-slate-950 flex items-center justify-center animate-pulse shadow-[1px_1px_0px_0px_#000]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifDropdownOpen && (
                    <>
                      {/* Mobile & Tablet Backdrop Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsNotifDropdownOpen(false)}
                        className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-40 lg:hidden"
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed left-1/2 -translate-x-1/2 top-20 sm:top-24 lg:absolute lg:top-[calc(100%+12px)] lg:left-auto lg:right-0 lg:translate-x-0 z-50 w-[calc(100vw-32px)] max-w-md lg:w-96 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] overflow-hidden text-slate-950 dark:text-white"
                      >
                        {/* Dropdown Header */}
                      <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b-2 border-slate-950 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#FF603D]" />
                          <span className="font-black text-sm uppercase tracking-wide">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-black bg-[#FF603D] text-white px-2 py-0.5 rounded-full border border-slate-950">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={() => markAllNotificationsAsRead()}
                                className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white underline cursor-pointer"
                              >
                                Read all
                              </button>
                            )}
                            <button
                              onClick={() => clearAllNotifications()}
                              className="text-[11px] font-extrabold text-[#FF603D] hover:underline cursor-pointer"
                            >
                              Clear all
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Dropdown Body */}
                      <div className="max-h-80 overflow-y-auto divide-y-2 divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-950 dark:border-slate-700 mx-auto flex items-center justify-center mb-3 text-slate-400">
                              <BellOff className="w-6 h-6 stroke-[2px]" />
                            </div>
                            <h4 className="font-black text-sm uppercase text-slate-950 dark:text-white">
                              No Notifications Right Now
                            </h4>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                              When an admin pushes an exam notice or study update, it will appear here.
                            </p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-4 transition-colors relative cursor-pointer ${
                                !notif.read
                                  ? "bg-amber-50/90 dark:bg-amber-950/30 hover:bg-amber-100/90 dark:hover:bg-amber-950/50"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {!notif.read && (
                                    <span className="w-2 h-2 rounded-full bg-[#FF603D] shrink-0" />
                                  )}
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FFD54F] text-slate-950 border border-slate-950">
                                    {notif.type || "Admin"}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {new Date(notif.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  className="text-slate-400 hover:text-red-500 p-0.5 shrink-0"
                                  title="Delete"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[3px]" />
                                </button>
                              </div>
                              <h5 className="font-extrabold text-sm text-slate-950 dark:text-white leading-tight">
                                {notif.title}
                              </h5>
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-snug">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              </div>

              {/* Profile Card */}
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 lg:pr-3 bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-xl shadow-[2px_2px_0px_0px_#000] md:shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-left shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-[#C19BF5] border-2 border-slate-950 flex items-center justify-center font-black shadow-[1.5px_1.5px_0px_0px_#000] text-slate-955 shrink-0 uppercase text-xs">
                  {userInitials}
                </div>
                <div className="hidden lg:block min-w-0 pr-1 select-none leading-none max-w-[110px] xl:max-w-none">
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
