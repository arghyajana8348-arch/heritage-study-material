import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from "recharts";
import { PieChart as PieChartIcon, CheckCircle2, BookOpen, Layers } from "lucide-react";
import { motion } from "motion/react";
import { subjects } from "../data";

interface SubjectPieChartProps {
  completedItems: string[];
  onNavigate?: (view: any) => void;
}

const PALETTE = [
  "#FFD54F", // Vibrant Yellow
  "#88D3E6", // Soft Blue
  "#C19BF5", // Purple
  "#A8E6CF", // Mint Green
  "#FFD3B6", // Peach
  "#FF603D", // Coral Red
  "#4ECDC4", // Teal
  "#BDB2FF", // Soft Lavender
  "#FFC6FF", // Pink
];

export default function SubjectPieChart({
  completedItems,
  onNavigate,
}: SubjectPieChartProps) {
  const [semesterFilter, setSemesterFilter] = useState<"all" | 1 | 2>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate subject progress metrics based on completedItems
  const subjectStats = useMemo(() => {
    // Filter subjects by semester if needed
    const filteredSubjects =
      semesterFilter === "all"
        ? subjects
        : subjects.filter((s) => s.semester === semesterFilter);

    let globalTotalCompletedModules = 0;

    const stats = filteredSubjects.map((sub, idx) => {
      let totalModules = sub.modules.length;
      let completedModules = 0;
      let totalTasks = 0;
      let completedTasks = 0;

      sub.modules.forEach((m) => {
        let moduleTasks = 0;
        let moduleCompletedTasks = 0;

        if (m.content.studyMaterial.available) {
          moduleTasks++;
          if (completedItems.includes(`${m.id}-material`)) {
            moduleCompletedTasks++;
          }
          if (m.content.studyMaterial.materials) {
            m.content.studyMaterial.materials.forEach((mat) => {
              moduleTasks++;
              if (completedItems.includes(`${m.id}-material-${mat.id}`)) {
                moduleCompletedTasks++;
              }
            });
          }
        }

        if (m.content.quiz.available) {
          moduleTasks++;
          if (completedItems.includes(`${m.id}-quiz`)) {
            moduleCompletedTasks++;
          }
        }

        totalTasks += moduleTasks;
        completedTasks += moduleCompletedTasks;

        if (moduleCompletedTasks === moduleTasks && moduleTasks > 0) {
          completedModules++;
        }
      });

      globalTotalCompletedModules += completedModules;

      const completionPercentage =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;

      const taskCompletionPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code || sub.id,
        semester: sub.semester,
        totalModules,
        completedModules,
        completionPercentage,
        totalTasks,
        completedTasks,
        taskCompletionPercentage,
        color: PALETTE[idx % PALETTE.length],
      };
    });

    return {
      stats,
      globalTotalCompletedModules,
    };
  }, [completedItems, semesterFilter]);

  const { stats, globalTotalCompletedModules } = subjectStats;

  // Pie chart data preparation
  // If no modules are completed yet in any subject, use equal weight slices so pie chart renders visually with 0% labels
  const pieData = useMemo(() => {
    return stats.map((s) => ({
      name: s.code,
      fullName: s.name,
      value:
        globalTotalCompletedModules === 0
          ? 100 / (stats.length || 1)
          : s.completedModules > 0
          ? s.completedModules
          : s.completionPercentage > 0
          ? s.completionPercentage
          : 0.1, // tiny non-zero slice so legend & pie arc remains interactive
      realCompletedModules: s.completedModules,
      realPercentage: s.completionPercentage,
      totalModules: s.totalModules,
      color: s.color,
      subjectId: s.id,
    }));
  }, [stats, globalTotalCompletedModules]);

  // Active shape custom renderer for Recharts Pie hover state
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#0f172a"
          strokeWidth={3}
        />
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius - 6}
          fill="white"
          className="dark:fill-slate-900"
          stroke="#0f172a"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-slate-950 dark:fill-white font-black text-sm uppercase tracking-wider"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          className="fill-slate-700 dark:fill-slate-300 font-extrabold text-xs"
        >
          {payload.realCompletedModules} / {payload.totalModules} Modules
        </text>
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          className="fill-slate-950 dark:fill-white font-black text-xs"
        >
          {payload.realPercentage}% Done
        </text>
      </g>
    );
  };

  // Custom Tooltip for Pie Chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-3 rounded-xl border-2 border-white shadow-[4px_4px_0px_0px_#FFD54F] font-sans max-w-xs z-50">
          <p
            className="font-black text-xs uppercase tracking-wider mb-1"
            style={{ color: data.color }}
          >
            {data.name} - {data.fullName}
          </p>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <CheckCircle2 className="w-4 h-4 text-[#A8E6CF]" />
            <span>
              {data.realCompletedModules} of {data.totalModules} Modules
              Completed
            </span>
          </div>
          <p className="text-xs text-slate-300 font-bold mt-1">
            Overall Completion Rate: {data.realPercentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#C19BF5] border-2 border-slate-950 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
            <PieChartIcon className="w-6 h-6 text-slate-950 stroke-[2.5px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide text-slate-950 dark:text-white">
                Subject Module Completion
              </h3>
              <span className="text-[10px] font-black uppercase bg-[#FFD54F] text-slate-950 px-2 py-0.5 rounded border border-slate-950 shadow-[1px_1px_0px_0px_#000]">
                Recharts Pie
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Visualizing module completion percentages across subjects
            </p>
          </div>
        </div>

        {/* Semester Filter */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border-2 border-slate-950 dark:border-slate-700 w-fit">
          <button
            onClick={() => setSemesterFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all cursor-pointer ${
              semesterFilter === "all"
                ? "bg-[#FFD54F] text-slate-950 border border-slate-950 shadow-[1px_1px_0px_0px_#000]"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-950"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSemesterFilter(1)}
            className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all cursor-pointer ${
              semesterFilter === 1
                ? "bg-[#FFD54F] text-slate-950 border border-slate-950 shadow-[1px_1px_0px_0px_#000]"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-950"
            }`}
          >
            Sem 1
          </button>
          <button
            onClick={() => setSemesterFilter(2)}
            className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase transition-all cursor-pointer ${
              semesterFilter === 2
                ? "bg-[#FFD54F] text-slate-950 border border-slate-950 shadow-[1px_1px_0px_0px_#000]"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-950"
            }`}
          >
            Sem 2
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Recharts Pie Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="h-72 w-full max-w-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#0f172a"
                  strokeWidth={2}
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="cursor-pointer transition-all hover:opacity-90"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Default Center Badge when no slice is hovered */}
            {activeIndex === null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-slate-950 dark:text-white uppercase italic">
                  {globalTotalCompletedModules}
                </span>
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Modules Done
                </span>
              </div>
            )}
          </div>

          {globalTotalCompletedModules === 0 && (
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center mt-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700">
              💡 Complete modules in any subject to see slice progress grow!
            </p>
          )}
        </div>

        {/* Right: Detailed Subject Breakdown Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {stats.map((s, idx) => (
            <div
              key={s.id}
              onClick={() =>
                onNavigate &&
                onNavigate({
                  view: "modules",
                  subjectId: s.id,
                  subjectName: s.name,
                })
              }
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`p-3.5 rounded-xl border-2 border-slate-950 dark:border-slate-700 transition-all cursor-pointer flex flex-col justify-between ${
                activeIndex === idx
                  ? "bg-slate-100 dark:bg-slate-800 -translate-y-0.5 shadow-[3px_3px_0px_0px_#000]"
                  : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-md border border-slate-950 shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-black text-xs uppercase text-slate-950 dark:text-white truncate" title={s.name}>
                    {s.code}
                  </span>
                </div>
                <span className="font-black text-xs text-slate-950 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-950 dark:border-slate-700 shrink-0">
                  {s.completionPercentage}%
                </span>
              </div>

              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 line-clamp-1 mb-2">
                {s.name}
              </p>

              <div>
                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  <span>{s.completedModules} / {s.totalModules} modules</span>
                  <span>Sem {s.semester}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full border border-slate-950 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${s.completionPercentage}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
