export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface ModuleContent {
  studyMaterial: {
    title: string;
    available: boolean;
    url?: string;
    description: string;
    materials?: {
      id: string;
      title: string;
      description: string;
      url: string;
    }[];
  };
  quiz: {
    title: string;
    available: boolean;
    url?: string;
    description: string;
    questions?: QuizQuestion[];
  };
  mindMap: {
    title: string;
    available: boolean;
    url?: string;
    description: string;
  };
}

export interface Module {
  id: string;
  subjectId: string;
  name: string;
  number: number;
  content: ModuleContent;
}

export interface SprintItem {
  id: string;
  title: string;
  type: "pdf" | "handwritten" | "suggestions";
  url: string;
}

export interface PYQItem {
  id: string;
  year: string;
  url: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  modules: Module[];
  progress: number; // 0-4
  sprint?: SprintItem[];
  pyqs?: PYQItem[];
}

export interface Bookmark {
  id: string; // subjectId or moduleId
  type: "subject" | "module";
  title: string;
  subtitle: string;
  // context for navigation
  subjectId?: string;
  subjectName?: string;
}

export type ViewState =
  | { view: "login" }
  | { view: "dashboard" }
  | { view: "subjects" }
  | {
      view: "modules";
      subjectId: string;
      subjectName: string;
    }
  | {
      view: "moduleDetail";
      moduleId: string;
      moduleName: string;
      subjectName: string;
    }
  | { view: "examSprint" }
  | { view: "sprintContent"; subjectId: string; subjectName: string }
  | { view: "quiz"; moduleId: string; moduleName: string; subjectName: string }
  | { view: "adminDashboard" }
  | { view: "about" }
  | { view: "account" };
