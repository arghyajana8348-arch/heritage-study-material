import { useState, useEffect } from "react";
import { ViewState } from "../types";
import { googleSignIn, getAccessToken, logout } from "../lib/firebase";
import {
  GraduationCap,
  Search,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BookOpen,
  User,
  Info,
} from "lucide-react";
import { motion } from "motion/react";

interface Course {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  alternateLink: string;
  courseState: string;
  teacherFolder?: {
    id: string;
    title: string;
  };
}

interface ClassroomProps {
  onNavigate: (view: ViewState) => void;
}

export default function Classroom({ onNavigate }: ClassroomProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string; photoUrl?: string } | null>(null);

  // Check auth on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      if (token) {
        setIsAuthenticated(true);
        fetchCourses(token);
      }
    };
    checkAuth();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await googleSignIn();
      if (result) {
        setIsAuthenticated(true);
        setUserProfile({
          name: result.user.displayName || undefined,
          email: result.user.email || undefined,
          photoUrl: result.user.photoURL || undefined,
        });
        fetchCourses(result.accessToken);
      }
    } catch (err: any) {
      const isPopupClosed =
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request" ||
        err?.message?.includes("closed") ||
        err?.message?.includes("popup") ||
        window.self !== window.top;

      if (isPopupClosed) {
        console.warn("Sign-in popup was closed or cancelled:", err);
        setError("popup_blocked_by_iframe");
      } else {
        console.error("Sign-in failed with unexpected error:", err);
        setError(err.message || "Failed to authenticate with Google. Make sure you grant the required Classroom permissions.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logout();
      setIsAuthenticated(false);
      setCourses([]);
      setFilteredCourses([]);
      setUserProfile(null);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          setIsAuthenticated(false);
          setError("Session expired. Please sign in again.");
          return;
        }
        throw new Error("Failed to fetch Google Classroom courses.");
      }

      const data = await response.json();
      const fetchedCourses = data.courses || [];
      setCourses(fetchedCourses);
      setFilteredCourses(fetchedCourses);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.message || "An error occurred while loading your courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const token = await getAccessToken();
    if (token) {
      fetchCourses(token);
    } else {
      setIsAuthenticated(false);
    }
  };

  // Filter courses by search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(
        courses.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            (c.section && c.section.toLowerCase().includes(query)) ||
            (c.description && c.description.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, courses]);

  // Card background color rotation
  const getCardColor = (index: number) => {
    const colors = [
      "bg-[#FFD54F]", // Yellow
      "bg-[#C19BF5]", // Purple
      "bg-[#FF603D]", // Orange/Red
      "bg-[#88D3E6]", // Blue
      "bg-[#A8E6CF]", // Green
    ];
    return colors[index % colors.length];
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
        >
          <div className="w-16 h-16 bg-[#A8E6CF] border-[3px] border-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_#000] rotate-[-3deg]">
            <GraduationCap className="w-9 h-9 text-slate-955 stroke-[3px]" />
          </div>

          <h2 className="text-2xl font-black text-slate-950 dark:text-white uppercase italic tracking-wide mb-3">
            Google Classroom
          </h2>
          <p className="text-sm font-semibold text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
            Link your college Google Classroom account to access your announcements, coursework, syllabus materials, and assignment submission grades directly in the Study Portal.
          </p>

          {error && error === "popup_blocked_by_iframe" ? (
            <div className="mb-6 p-4 bg-[#FFD54F] border-[3px] border-slate-950 rounded-xl text-xs font-bold text-slate-950 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-sm uppercase mb-1.5 flex items-center gap-1.5 text-slate-950">
                ⚠️ Connection Blocked
              </p>
              <p className="leading-relaxed mb-3 text-slate-900 font-semibold">
                Since this portal is running inside a secure preview iframe, browsers block Google's login popups and session credentials by default.
              </p>
              <button
                onClick={() => window.open(window.location.origin, "_blank")}
                className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-2.5 px-3 rounded-lg border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all text-center block text-[11px] cursor-pointer"
              >
                OPEN PORTAL IN NEW TAB 🚀
              </button>
            </div>
          ) : error ? (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 text-left">
              ⚠️ {error}
            </div>
          ) : window.self !== window.top ? (
            <div className="mb-6 p-3.5 bg-slate-100 dark:bg-slate-950 border-[3px] border-slate-950 dark:border-white rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 text-left">
              <span className="font-extrabold text-slate-950 dark:text-white uppercase block mb-1">💡 Iframe Mode Notice</span>
              Google Classroom authentication may require opening the portal in a new tab to bypass iframe security constraints.
              <button
                onClick={() => window.open(window.location.origin, "_blank")}
                className="mt-2 text-slate-950 dark:text-white font-black hover:underline text-[11px] block text-left"
              >
                Open Study Portal in new tab &rarr;
              </button>
            </div>
          ) : null}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-[#A8E6CF] border-[3px] border-slate-950 text-slate-950 font-black py-4 px-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                CONNECT CLASSROOM
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Classroom courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-[3px] border-slate-950 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl focus:outline-none font-bold placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-950 text-slate-950 dark:text-white border-[3px] border-slate-950 dark:border-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-black text-sm cursor-pointer"
            title="Refresh Courses"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            REFRESH
          </button>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-3 bg-red-100 text-red-655 border-[3px] border-slate-950 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-black text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            DISCONNECT
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-2xl text-sm font-bold text-red-650 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      {loading && courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-10 h-10 animate-spin text-slate-950 dark:text-white mb-4 stroke-[3px]" />
          <p className="font-bold text-slate-650 dark:text-slate-400">Loading your Google Classroom courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-center">
          <Info className="w-12 h-12 text-slate-500 mx-auto mb-4 stroke-[2.5px]" />
          <h3 className="text-xl font-black uppercase italic text-slate-955 dark:text-white mb-1">
            No Courses Found
          </h3>
          <p className="text-sm font-semibold text-slate-650 dark:text-slate-400 leading-relaxed">
            {courses.length === 0
              ? "We couldn't find any active courses in your Google Classroom account."
              : "No courses match your search criteria. Try a different query!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course, index) => {
            const cardBg = getCardColor(index);
            return (
              <div
                key={course.id}
                onClick={() =>
                  onNavigate({
                    view: "classroomDetail",
                    courseId: course.id,
                    courseName: course.name,
                  })
                }
                className={`${cardBg} p-6 rounded-2xl border-[3px] border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between cursor-pointer group text-slate-950`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-black tracking-widest text-slate-950 uppercase bg-white/40 border border-slate-950 px-2.5 py-0.5 rounded">
                      {course.section || "General"}
                    </span>
                    <a
                      href={course.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-white/40 hover:bg-white border border-slate-950 text-slate-950 shadow-[1px_1px_0px_0px_#000] active:translate-y-0.5 transition-all"
                      title="Open in Google Classroom"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <h3 className="text-2xl font-black leading-tight uppercase italic group-hover:underline mb-2">
                    {course.name}
                  </h3>

                  {course.room && (
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                      <User className="w-3.5 h-3.5" /> Room: {course.room}
                    </p>
                  )}

                  {course.descriptionHeading && (
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed line-clamp-2 mt-2 italic">
                      {course.descriptionHeading}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-950/20 pt-4 mt-6">
                  <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> View Stream
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-950 stroke-[3px]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
