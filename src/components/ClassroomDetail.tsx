import { useState, useEffect } from "react";
import { getAccessToken } from "../lib/firebase";
import {
  MessageSquare,
  FileText,
  Calendar,
  Award,
  ExternalLink,
  ChevronLeft,
  RefreshCw,
  Clock,
  Link as LinkIcon,
  Play,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Download,
} from "lucide-react";
import { motion } from "motion/react";

interface Announcement {
  id: string;
  text: string;
  creationTime: string;
  alternateLink: string;
  materials?: any[];
}

interface CourseWork {
  id: string;
  title: string;
  description?: string;
  state: string;
  alternateLink: string;
  creationTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  materials?: any[];
}

interface CourseWorkMaterial {
  id: string;
  title: string;
  description?: string;
  alternateLink: string;
  creationTime: string;
  materials?: any[];
}

interface StudentSubmission {
  id: string;
  courseWorkId: string;
  state: string; // NEW, CREATED, TURNED_IN, RETURNED, RECLAIMED_BY_STUDENT
  assignedGrade?: number;
  draftGrade?: number;
}

interface ClassroomDetailProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

type TabType = "stream" | "classwork" | "materials";

export default function ClassroomDetail({
  courseId,
  courseName,
  onBack,
}: ClassroomDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courseWorks, setCourseWorks] = useState<CourseWork[]>([]);
  const [courseWorkMaterials, setCourseWorkMaterials] = useState<CourseWorkMaterial[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmission>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    const token = await getAccessToken();
    if (!token) {
      setError("Not authenticated. Please go back and connect.");
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Stream (Announcements)
      const streamRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/announcements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const streamData = await streamRes.json();
      setAnnouncements(streamData.announcements || []);

      // 2. Fetch Classwork (Assignments)
      const cwRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const cwData = await cwRes.json();
      const loadedCw = cwData.courseWork || [];
      setCourseWorks(loadedCw);

      // 3. Fetch CourseWork Materials
      const materialsRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWorkMaterials`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const materialsData = await materialsRes.json();
      setCourseWorkMaterials(materialsData.courseWorkMaterials || []);

      // 4. Fetch Submissions
      try {
        const subRes = await fetch(
          `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/-/studentSubmissions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          const subMap: Record<string, StudentSubmission> = {};
          if (subData.studentSubmissions) {
            subData.studentSubmissions.forEach((sub: StudentSubmission) => {
              subMap[sub.courseWorkId] = sub;
            });
          }
          setSubmissions(subMap);
        }
      } catch (subErr) {
        console.error("Failed to load submissions:", subErr);
        // Silently catch to not break other tabs
      }
    } catch (err: any) {
      console.error("Error loading course details:", err);
      setError("Failed to load course details. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDueDate = (cw: CourseWork) => {
    if (!cw.dueDate) return "No due date";
    const { year, month, day } = cw.dueDate;
    const dateObj = new Date(year, month - 1, day);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (cw.dueTime) {
      const { hours, minutes } = cw.dueTime;
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${dateStr} at ${displayHours}:${displayMinutes} ${ampm}`;
    }
    return dateStr;
  };

  // Render attachment helper
  const renderAttachments = (materials?: any[]) => {
    if (!materials || materials.length === 0) return null;

    return (
      <div className="mt-4 space-y-2 border-t border-slate-950/10 dark:border-slate-800/80 pt-3">
        <h5 className="text-[11px] font-black tracking-wider uppercase text-slate-500 mb-2">
          Attachments ({materials.length})
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {materials.map((m, i) => {
            let title = "Attachment";
            let url = "#";
            let icon = <LinkIcon className="w-4 h-4 text-slate-650" />;

            if (m.driveFile) {
              title = m.driveFile.driveFile.title;
              url = m.driveFile.driveFile.alternateLink;
              icon = <FileText className="w-4 h-4 text-blue-500" />;
            } else if (m.youtubeVideo) {
              title = m.youtubeVideo.title;
              url = m.youtubeVideo.alternateLink;
              icon = <Play className="w-4 h-4 text-red-500 fill-red-500" />;
            } else if (m.link) {
              title = m.link.title || m.link.url;
              url = m.link.url;
              icon = <LinkIcon className="w-4 h-4 text-emerald-500" />;
            } else if (m.form) {
              title = m.form.title || "Google Form";
              url = m.form.formUrl;
              icon = <FileSpreadsheet className="w-4 h-4 text-purple-500" />;
            }

            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors truncate text-left"
              >
                <div className="shrink-0 p-1 bg-white dark:bg-slate-900 border border-slate-950 rounded-lg shadow-[1px_1px_0px_0px_#000]">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {title}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStream = () => {
    if (announcements.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-center">
          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3 stroke-[2.5px]" />
          <h4 className="text-lg font-black uppercase italic text-slate-955 dark:text-white mb-1">
            Stream is Empty
          </h4>
          <p className="text-xs font-semibold text-slate-650 dark:text-slate-400">
            There are no announcements or updates on the course stream.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-[#FFD54F] border-2 border-slate-950 rounded-xl shadow-[1.5px_1.5px_0px_0px_#000]">
                <MessageSquare className="w-4 h-4 text-slate-955" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-slate-500 block">
                  Announcement
                </span>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {formatDate(ann.creationTime)}
                </span>
              </div>
              <a
                href={ann.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 border-2 border-slate-950 text-slate-950 dark:text-white shadow-[1.5px_1.5px_0px_0px_#000] active:translate-y-0.5 transition-all flex items-center gap-1 text-[10px] font-black"
              >
                STREAM <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {ann.text}
            </p>

            {renderAttachments(ann.materials)}
          </div>
        ))}
      </div>
    );
  };

  const renderClasswork = () => {
    if (courseWorks.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-center">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3 stroke-[2.5px]" />
          <h4 className="text-lg font-black uppercase italic text-slate-955 dark:text-white mb-1">
            No Assignments
          </h4>
          <p className="text-xs font-semibold text-slate-650 dark:text-slate-400">
            No coursework or homework assignments have been assigned yet.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {courseWorks.map((cw) => {
          const sub = submissions[cw.id];
          let statusBadge = (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-[#FFD54F]/30 border border-amber-600 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
              <Clock className="w-3.5 h-3.5" /> Assigned
            </span>
          );

          if (sub) {
            if (sub.state === "TURNED_IN") {
              statusBadge = (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-[#A8E6CF]/30 border border-emerald-600 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Handed In
                </span>
              );
            } else if (sub.state === "RETURNED") {
              statusBadge = (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-[#88D3E6]/30 border border-blue-600 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                  <Award className="w-3.5 h-3.5" /> Graded: {sub.assignedGrade}/{cw.maxPoints}
                </span>
              );
            } else if (sub.state === "NEW" || sub.state === "CREATED") {
              statusBadge = (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-[#FFD54F]/30 border border-amber-600 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                  <Clock className="w-3.5 h-3.5" /> Assigned
                </span>
              );
            }
          }

          return (
            <div
              key={cw.id}
              className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#FF603D] border-2 border-slate-950 rounded-xl shadow-[1.5px_1.5px_0px_0px_#000]">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                      {cw.title}
                    </h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Assignment • Posted {formatDate(cw.creationTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {statusBadge}
                  <a
                    href={cw.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 border-2 border-slate-950 text-slate-955 dark:text-white shadow-[1.5px_1.5px_0px_0px_#000] active:translate-y-0.5 transition-all"
                    title="Open Assignment"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {cw.description && (
                <p className="text-sm font-semibold text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950/60 p-4 border-2 border-slate-950 rounded-xl mb-4">
                  {cw.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 items-center justify-between text-xs font-black uppercase text-slate-500 pt-1">
                <div className="flex items-center gap-1.5 text-red-500">
                  <Clock className="w-4 h-4" />
                  Due: {formatDueDate(cw)}
                </div>

                {cw.maxPoints && (
                  <div className="flex items-center gap-1 text-[#88D3E6] dark:text-cyan-400">
                    <Award className="w-4 h-4" />
                    Points: {cw.maxPoints} Max
                  </div>
                )}
              </div>

              {renderAttachments(cw.materials)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMaterials = () => {
    if (courseWorkMaterials.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-center">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3 stroke-[2.5px]" />
          <h4 className="text-lg font-black uppercase italic text-slate-955 dark:text-white mb-1">
            No Materials
          </h4>
          <p className="text-xs font-semibold text-slate-650 dark:text-slate-400">
            No course materials or syllabus resources have been uploaded yet.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {courseWorkMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#C19BF5] border-2 border-slate-950 rounded-xl shadow-[1.5px_1.5px_0px_0px_#000]">
                  <Download className="w-4 h-4 text-slate-955" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                    {mat.title}
                  </h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-tight">
                    Study Material • Shared {formatDate(mat.creationTime)}
                  </span>
                </div>
              </div>

              <a
                href={mat.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 border-2 border-slate-950 text-slate-955 dark:text-white shadow-[1.5px_1.5px_0px_0px_#000] active:translate-y-0.5 transition-all"
                title="Open Material"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {mat.description && (
              <p className="text-sm font-semibold text-slate-650 dark:text-slate-350 leading-relaxed mb-4">
                {mat.description}
              </p>
            )}

            {renderAttachments(mat.materials)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back & Refresh Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFD54F] border-[3px] border-slate-950 text-slate-950 font-black shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all text-sm cursor-pointer rounded-xl"
        >
          <ChevronLeft className="w-4.5 h-4.5 stroke-[3px]" />
          ALL COURSES
        </button>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 bg-white dark:bg-slate-900 text-slate-955 dark:text-white border-[3px] border-slate-950 dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-all rounded-xl cursor-pointer"
          title="Refresh Current Data"
        >
          <RefreshCw className={`w-4.5 h-4.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Course Info Display */}
      <div className="bg-[#88D3E6] border-[3px] border-slate-950 p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-slate-950">
        <span className="text-[10px] font-black tracking-widest uppercase bg-white/40 border border-slate-950 px-2.5 py-0.5 rounded w-fit block mb-2">
          Heritage Classroom Sync
        </span>
        <h2 className="text-3xl font-black uppercase italic leading-none truncate mb-1">
          {courseName}
        </h2>
        <p className="text-xs font-bold text-slate-800 tracking-wide mt-2">
          Keep track of class announcements, coursework submissions, grading points, and reference files securely.
        </p>
      </div>

      {/* Course Navigation Tabs */}
      <div className="flex gap-2 border-b-4 border-slate-950/20 dark:border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab("stream")}
          className={`px-4 py-2.5 font-black text-xs uppercase tracking-wider border-[3px] border-slate-950 transition-all rounded-xl cursor-pointer ${
            activeTab === "stream"
              ? "bg-[#FFD54F] text-slate-955 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
              : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          Stream & Posts
        </button>
        <button
          onClick={() => setActiveTab("classwork")}
          className={`px-4 py-2.5 font-black text-xs uppercase tracking-wider border-[3px] border-slate-950 transition-all rounded-xl cursor-pointer ${
            activeTab === "classwork"
              ? "bg-[#FF603D] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
              : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          Classwork & Grades
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2.5 font-black text-xs uppercase tracking-wider border-[3px] border-slate-950 transition-all rounded-xl cursor-pointer ${
            activeTab === "materials"
              ? "bg-[#C19BF5] text-slate-955 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
              : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800"
          }`}
        >
          Syllabus & Materials
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-2xl text-sm font-bold text-red-650 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Render selected tab content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-950 dark:text-white mb-3" />
          <p className="text-xs font-bold text-slate-500">Retrieving stream updates...</p>
        </div>
      ) : (
        <div className="mt-4">
          {activeTab === "stream" && renderStream()}
          {activeTab === "classwork" && renderClasswork()}
          {activeTab === "materials" && renderMaterials()}
        </div>
      )}
    </div>
  );
}
