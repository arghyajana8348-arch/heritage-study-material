import { useState, useEffect } from "react";
import { Bookmark, ViewState } from "./types";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SubjectList from "./components/SubjectList";
import ModuleList from "./components/ModuleList";
import ModuleDetail from "./components/ModuleDetail";
import Quiz from "./components/Quiz";
import ExamSprint from "./components/ExamSprint";
import SprintContent from "./components/SprintContent";
import AdminDashboard from "./components/AdminDashboard";
import AboutUs from "./components/AboutUs";
import Account from "./components/Account";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [viewStack, setViewStack] = useState<ViewState[]>([{ view: "login" }]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleBookmark = (bookmark: Bookmark) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === bookmark.id);
      if (exists) {
        return prev.filter((b) => b.id !== bookmark.id);
      }
      return [...prev, bookmark];
    });
  };

  const toggleCompletedItem = (itemId: string) => {
    setCompletedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      return [...prev, itemId];
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentView = viewStack[viewStack.length - 1];

  const handleLogin = (email: string) => {
    setUser({ email });
    if (email.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in") {
      setViewStack([{ view: "adminDashboard" }]);
    } else {
      setViewStack([{ view: "dashboard" }]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setViewStack([{ view: "login" }]);
  };

  const pushView = (view: ViewState) => {
    // Prevent pushing the same view type if it's a top level nav
    if (
      view.view === "dashboard" ||
      view.view === "subjects" ||
      view.view === "examSprint" ||
      view.view === "adminDashboard"
    ) {
      setViewStack([view]);
    } else {
      setViewStack((prev) => [...prev, view]);
    }
  };

  const popView = () => {
    setViewStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Resolve current active IDs for deeper views
  let activeSubjectId = "";

  for (const v of [...viewStack].reverse()) {
    if (
      v.view === "subjects" ||
      v.view === "modules" ||
      v.view === "moduleDetail" ||
      v.view === "sprintContent"
    ) {
      if ("subjectId" in v && v.subjectId) activeSubjectId = v.subjectId;
    }
  }

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  const isAdmin =
    user?.email.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in";

  const renderView = () => {
    switch (currentView.view) {
      case "login":
        return <Login onLogin={handleLogin} />;
      case "dashboard":
        return (
          <Dashboard
            user={user}
            onNavigate={pushView}
            hasPaid={hasPaid || isAdmin}
            setHasPaid={setHasPaid}
            bookmarks={bookmarks}
            completedItems={completedItems}
          />
        );
      case "subjects":
        return (
          <SubjectList
            onNavigate={pushView}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
          />
        );
      case "modules":
        return (
          <ModuleList
            subjectId={currentView.subjectId}
            onNavigate={pushView}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
          />
        );
      case "moduleDetail":
        return (
          <ModuleDetail
            subjectId={activeSubjectId || currentView.moduleId.split("-m")[0]} // fallback inference
            moduleId={currentView.moduleId}
            subjectName={currentView.subjectName}
            onNavigate={pushView}
            completedItems={completedItems}
            onToggleCompleted={toggleCompletedItem}
          />
        );
      case "quiz":
        return (
          <Quiz
            moduleId={currentView.moduleId}
            moduleName={currentView.moduleName}
            subjectName={currentView.subjectName}
            onNavigate={pushView}
          />
        );
      case "examSprint":
        return (
          <ExamSprint
            hasPaid={hasPaid || isAdmin}
            onNavigate={pushView}
            onPay={() => {
              // Usually handled by Dashboard, but if they click from sidebar
              // and are not paid, they can trigger payment here
              setHasPaid(true);
            }}
          />
        );
      case "sprintContent":
        return (
          <SprintContent
            subjectId={currentView.subjectId}
            subjectName={currentView.subjectName}
          />
        );
      case "adminDashboard":
        return <AdminDashboard />;
      case "about":
        return <AboutUs />;
      case "account":
        return <Account onLogout={handleLogout} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onPop={popView}
      onNavigate={pushView}
      darkMode={darkMode}
      onToggleDarkMode={toggleDarkMode}
      onLogout={handleLogout}
      isAdmin={
        user?.email?.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in"
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={
            currentView.view +
            ("moduleId" in currentView ? currentView.moduleId : "")
          }
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
