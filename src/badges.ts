export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  category: "quiz" | "subject" | "material" | "ai" | "sprint";
  color: string; // TailWind color code for badge styling
}

export const BADGES: Badge[] = [
  {
    id: "first_quiz",
    title: "Quiz Initiate",
    description: "Completed your first practice quiz.",
    icon: "Target",
    category: "quiz",
    color: "#88D3E6", // Light Blue
  },
  {
    id: "perfect_quiz",
    title: "Quiz Master",
    description: "Scored 100% on any module quiz!",
    icon: "Trophy",
    category: "quiz",
    color: "#FFD54F", // Yellow
  },
  {
    id: "scholar_notes",
    title: "Dedicated Scholar",
    description: "Read or downloaded your first study material PDF.",
    icon: "BookOpen",
    category: "material",
    color: "#FFD3B6", // Peach
  },
  {
    id: "ai_learner",
    title: "AI Explorer",
    description: "Used Gemini AI to get tailored feedback on a quiz answer.",
    icon: "Sparkles",
    category: "ai",
    color: "#C19BF5", // Purple
  },
  {
    id: "subject_conqueror",
    title: "Subject Conqueror",
    description: "Finished 100% of all tasks in a subject.",
    icon: "Award",
    category: "subject",
    color: "#A8E6CF", // Mint
  },
  {
    id: "sprint_warrior",
    title: "Sprint Warrior",
    description: "Explored Exam Sprint and previous year question resources.",
    icon: "Zap",
    category: "sprint",
    color: "#FF603D", // Coral
  },
  {
    id: "task_master",
    title: "Task Master",
    description: "Completed at least 5 study tasks or quizzes.",
    icon: "CheckCheck",
    category: "material",
    color: "#88D3E6", // Blue
  },
  {
    id: "academic_legend",
    title: "Academic Legend",
    description: "Completed every single module across all available courses!",
    icon: "Crown",
    category: "subject",
    color: "#FFD54F", // Gold
  },
];

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string;
}

export function getUnlockedBadges(userId?: string): Record<string, string> {
  try {
    const key = userId ? `unlocked_badges_${userId}` : "unlocked_badges";
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading badges from localStorage", e);
  }
  return {};
}

export function saveAllUnlockedBadges(
  badges: Record<string, string>,
  userId?: string
): void {
  try {
    const key = userId ? `unlocked_badges_${userId}` : "unlocked_badges";
    localStorage.setItem(key, JSON.stringify(badges));
  } catch (e) {
    console.error("Error saving all badges to localStorage", e);
  }
}

export function saveUnlockedBadge(badgeId: string, userId?: string): boolean {
  try {
    const current = getUnlockedBadges(userId);
    if (!current[badgeId]) {
      current[badgeId] = new Date().toISOString();
      saveAllUnlockedBadges(current, userId);
      return true; // Newly unlocked!
    }
  } catch (e) {
    console.error("Error saving badge to localStorage", e);
  }
  return false; // Already unlocked
}
