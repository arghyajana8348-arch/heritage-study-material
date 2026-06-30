import { Subject, Module } from "./types";

const generateModules = (subjectId: string, subjectName: string): Module[] => {
  const moduleNames: Record<string, string[]> = {
    // Semester 1
    PHY1001: ["Mechanics", "Oscillation and Optics", "Quantum Mechanics"],
    MTH1101: [
      "Matrix",
      "Vector Calculus & Infinite Series",
      "ODE & Higher Order ODE",
      "Calculus of several variables & Multiple Integration",
    ],
    ECE1001: [
      "Basic Semiconductor Physics & Diode Circuits",
      "Bipolar Junction Transistors (BJT)",
      "Field Effect Transistors (FET)",
      "Feedback in amplifiers & Operational Amplifier",
    ],
    HUM1002: [
      "Introduction to Value Education",
      "Harmony in the Family and Society",
      "Professional Ethics",
      "Harmony in the Nature/Existence",
    ],

    // Semester 2
    CHM1001: [
      "Thermodynamics & Electrochemical Cell",
      "Molecular Structure & Periodic Properties",
      "Atomic structure, Wave Mechanics & Spectroscopy",
      "Stereochemistry & Organic reactions",
    ],
    MTH1201: [
      "Basic Probability",
      "Basic Numerical Methods",
      "Basic Graph Theory",
      "Laplace Transformation",
    ],
    CSE1001: [
      "Fundamentals of Computer",
      "Basic Concepts of C",
      "Program Structures in C",
      "Data Handling in C",
    ],
    ELE1001: [
      "DC Network Theorem & Electromagnetism",
      "AC single phase system",
      "Three phase system & DC Machines",
      "Transformer & Three-phase induction motor",
    ],
    HUM1001: [
      "Introduction to Phonology and Morphology",
      "Communication Skills",
      "Organizational Communication",
      "Principles for professional writing",
    ],
  };

  const names = moduleNames[subjectId] || [
    "Module 1",
    "Module 2",
    "Module 3",
    "Module 4",
  ];

  return names.map((name, index) => {
    // Make the first module usually available, some others unavailable to show empty states
    const isAvailable = index < 2;

    return {
      id: `${subjectId}-m${index + 1}`,
      subjectId,
      name,
      number: index + 1,
      content: {
        studyMaterial: {
          title: "Comprehensive Notes",
          description: `Detailed PDF notes for ${name}`,
          available: true, // Study material always available for this mockup
        },
        quiz: {
          title: "Quick Knowledge Check",
          description: "10 multiple-choice questions",
          available: isAvailable,
        },
        mindMap: {
          title: "Visual Concept Map",
          description: "Interconnected concepts and formulas",
          available: index === 0, // Mind maps only for the first module for now
        },
      },
    };
  });
};

const generateSubjects = (semesterId: number): Subject[] => {
  if (semesterId === 1) {
    return [
      {
        id: "PHY1001",
        name: "Physics-I",
        code: "PHY1001",
        progress: 0,
        modules: generateModules("PHY1001", "Physics-I"),
      },
      {
        id: "MTH1101",
        name: "Mathematics-I",
        code: "MTH1101",
        progress: 0,
        modules: generateModules("MTH1101", "Mathematics-I"),
      },
      {
        id: "ECE1001",
        name: "Introduction to Electronics Devices & Circuits",
        code: "ECE1001",
        progress: 0,
        modules: generateModules(
          "ECE1001",
          "Introduction to Electronics Devices & Circuits",
        ),
      },
      {
        id: "HUM1002",
        name: "Universal Human Values and Professional Ethics",
        code: "HUM1002",
        progress: 0,
        modules: generateModules(
          "HUM1002",
          "Universal Human Values and Professional Ethics",
        ),
      },
    ];
  } else if (semesterId === 2) {
    return [
      {
        id: "CHM1001",
        name: "Chemistry I",
        code: "CHM1001",
        progress: 0,
        modules: generateModules("CHM1001", "Chemistry I"),
      },
      {
        id: "MTH1201",
        name: "Mathematics II",
        code: "MTH1201",
        progress: 0,
        modules: generateModules("MTH1201", "Mathematics II"),
      },
      {
        id: "CSE1001",
        name: "Programming for Problem Solving",
        code: "CSE1001",
        progress: 0,
        modules: generateModules("CSE1001", "Programming for Problem Solving"),
      },
      {
        id: "ELE1001",
        name: "Basic Electrical Engineering",
        code: "ELE1001",
        progress: 0,
        modules: generateModules("ELE1001", "Basic Electrical Engineering"),
      },
      {
        id: "HUM1001",
        name: "English for Technical Writing",
        code: "HUM1001",
        progress: 0,
        modules: generateModules("HUM1001", "English for Technical Writing"),
      },
    ];
  }
  return [];
};

const allSemestersSubjects = [
  ...generateSubjects(1),
  ...generateSubjects(2)
];

export const subjects: Subject[] = allSemestersSubjects;

export const getSubject = (subjectId: string) =>
  subjects.find((s) => s.id === subjectId);
export const getModule = (subjectId: string, moduleId: string) => {
  const sub = subjects.find((s) => s.id === subjectId);
  if (sub) {
    return sub.modules.find((m) => m.id === moduleId);
  }
  return undefined;
};
