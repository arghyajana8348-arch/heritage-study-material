import { useState, useEffect } from "react";
import { Bookmark, ViewState } from "./types";
import { subjects } from "./data";
import { getUnlockedBadges, saveUnlockedBadge } from "./badges";
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
import BadgeUnlockModal from "./components/BadgeUnlockModal";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [viewStack, setViewStack] = useState<ViewState[]>([{ view: "login" }]);
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Badge System State
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, string>>(
    () => getUnlockedBadges()
  );
  const [activeBadgeModal, setActiveBadgeModal] = useState<string | null>(null);

  const unlockBadge = (badgeId: string) => {
    const newlyUnlocked = saveUnlockedBadge(badgeId);
    if (newlyUnlocked) {
      setUnlockedBadges(getUnlockedBadges());
      setActiveBadgeModal(badgeId);
    }
  };

  // Session check and auth listener on mount
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then((res) => {
      if (!isMounted) return;
      const sessionUser = res?.data?.session?.user;
      if (sessionUser) {
        setUser(sessionUser);
        const email = sessionUser.email || "";
        if (email.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in") {
          setViewStack([{ view: "adminDashboard" }]);
        } else {
          setViewStack([{ view: "dashboard" }]);
        }
      }
    });

    const subRes = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        const email = session.user.email || "";
        if (email.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in") {
          setViewStack([{ view: "adminDashboard" }]);
        } else {
          setViewStack((prev) =>
            prev.length === 1 && prev[0].view === "login"
              ? [{ view: "dashboard" }]
              : prev
          );
        }
      } else {
        setUser(null);
        setViewStack([{ view: "login" }]);
      }
    });

    return () => {
      isMounted = false;
      subRes?.data?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch bookmarks & completed items when user changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setBookmarks([]);
        setCompletedItems([]);
        return;
      }

      const user_id = user.id || user.email;
      if (!user_id) return;

      try {
        // Fetch Bookmarks
        const { data: bookmarksData } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user_id);

        if (bookmarksData && Array.isArray(bookmarksData)) {
          setBookmarks(
            bookmarksData.map((b: any) => ({
              id: b.item_id,
              type: b.type,
              title: b.title,
              subtitle: b.subtitle,
              subjectId: b.subject_id,
              subjectName: b.subject_name,
            }))
          );
        }

        // Fetch Completed Items
        const { data: completedData } = await supabase
          .from("completed_items")
          .select("*")
          .eq("user_id", user_id);

        if (completedData && Array.isArray(completedData)) {
          setCompletedItems(completedData.map((c: any) => c.item_id));
        }
      } catch (err) {
        console.warn("Failed to fetch user data:", err);
      }
    };

    fetchData();
  }, [user]);

  const toggleBookmark = async (bookmark: Bookmark) => {
    const exists = bookmarks.find((b) => b.id === bookmark.id);
    const user_id = user?.id || user?.email;
    if (!user_id) return;

    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id));
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user_id)
        .eq("item_id", bookmark.id);
    } else {
      setBookmarks((prev) => [...prev, bookmark]);
      await supabase.from("bookmarks").insert({
        user_id,
        item_id: bookmark.id,
        type: bookmark.type,
        title: bookmark.title,
        subtitle: bookmark.subtitle,
        subject_id: bookmark.subjectId,
        subject_name: bookmark.subjectName,
      });
    }
  };

  const toggleCompletedItem = async (itemId: string) => {
    const isCompleted = completedItems.includes(itemId);
    const user_id = user?.id || user?.email;
    if (!user_id) return;

    if (isCompleted) {
      setCompletedItems((prev) => prev.filter((id) => id !== itemId));
      await supabase
        .from("completed_items")
        .delete()
        .eq("user_id", user_id)
        .eq("item_id", itemId);
    } else {
      setCompletedItems((prev) => [...prev, itemId]);
      await supabase.from("completed_items").insert({
        user_id,
        item_id: itemId,
      });
    }
  };

  // Automatic Milestone & Badge Evaluation
  useEffect(() => {
    if (completedItems.length > 0) {
      if (completedItems.some((id) => id.endsWith("-material"))) {
        unlockBadge("scholar_notes");
      }
      if (completedItems.some((id) => id.endsWith("-quiz"))) {
        unlockBadge("first_quiz");
      }
      if (completedItems.length >= 5) {
        unlockBadge("task_master");
      }

      let finishedSubjects = 0;
      subjects.forEach((sub) => {
        let subTotal = 0;
        let subDone = 0;
        sub.modules.forEach((m) => {
          if (m.content.studyMaterial.available) {
            subTotal++;
            if (completedItems.includes(`${m.id}-material`)) subDone++;
          }
          if (m.content.quiz.available) {
            subTotal++;
            if (completedItems.includes(`${m.id}-quiz`)) subDone++;
          }
        });
        if (subTotal > 0 && subDone === subTotal) {
          finishedSubjects++;
          unlockBadge("subject_conqueror");
        }
      });

      if (finishedSubjects === subjects.length && subjects.length > 0) {
        unlockBadge("academic_legend");
      }
    }
  }, [completedItems]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentView = viewStack[viewStack.length - 1];

  const handleLogin = (userOrEmail: any) => {
    if (typeof userOrEmail === "string") {
      const u = { email: userOrEmail };
      setUser(u);
      if (userOrEmail.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in") {
        setViewStack([{ view: "adminDashboard" }]);
      } else {
        setViewStack([{ view: "dashboard" }]);
      }
    } else if (userOrEmail && typeof userOrEmail === "object") {
      setUser(userOrEmail);
      const email = userOrEmail.email || "";
      if (email.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in") {
        setViewStack([{ view: "adminDashboard" }]);
      } else {
        setViewStack([{ view: "dashboard" }]);
      }
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
    user?.email?.toLowerCase() === "arghya.jana.cse29@heritageit.edu.in";

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
            onToggleBookmark={toggleBookmark}
            unlockedBadges={unlockedBadges}
          />
        );
      case "subjects":
        return (
          <SubjectList
            onNavigate={pushView}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            completedItems={completedItems}
          />
        );
      case "modules":
        return (
          <ModuleList
            subjectId={currentView.subjectId}
            onNavigate={pushView}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            completedItems={completedItems}
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
            onUnlockBadge={unlockBadge}
          />
        );
      case "quiz":
        return (
          <Quiz
            moduleId={currentView.moduleId}
            moduleName={currentView.moduleName}
            subjectName={currentView.subjectName}
            onNavigate={pushView}
            completedItems={completedItems}
            onToggleCompleted={toggleCompletedItem}
            onUnlockBadge={unlockBadge}
          />
        );
      case "examSprint":
        return (
          <ExamSprint
            hasPaid={hasPaid || isAdmin}
            onNavigate={pushView}
            isAdmin={isAdmin}
            onPay={() => {
              setHasPaid(true);
            }}
          />
        );
      case "sprintContent":
        return (
          <SprintContent
            subjectId={currentView.subjectId}
            subjectName={currentView.subjectName}
            onUnlockBadge={unlockBadge}
          />
        );

      case "adminDashboard":
        return <AdminDashboard />;
      case "about":
        return <AboutUs />;
      case "account":
        return <Account onLogout={handleLogout} unlockedBadges={unlockedBadges} />;
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

      {/* Badge Unlock Celebration Modal */}
      <BadgeUnlockModal
        badgeId={activeBadgeModal}
        onClose={() => setActiveBadgeModal(null)}
      />
    </Layout>
  );
}
