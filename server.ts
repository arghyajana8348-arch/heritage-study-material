import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const getGeminiAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API route for generating AI quiz feedback for wrong answers
  app.post("/api/quiz/explain", async (req, res) => {
    try {
      const {
        questionText,
        options,
        selectedAnswer,
        correctAnswer,
        subjectName,
        moduleName,
      } = req.body;

      if (!questionText || !selectedAnswer || !correctAnswer) {
        return res.status(400).json({
          error: "Missing required fields for explanation generation.",
        });
      }

      const ai = getGeminiAI();
      if (!ai) {
        return res.status(500).json({
          error:
            "GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.",
        });
      }

      const prompt = `
Subject: ${subjectName || "General"}
Module: ${moduleName || "Study Material"}
Question: ${questionText}
Options: ${Array.isArray(options) ? options.join("; ") : "N/A"}

The student answered incorrectly.
Student's Chosen (Incorrect) Answer: "${selectedAnswer}"
Correct Answer: "${correctAnswer}"

Please provide a concise, friendly, and tailored explanation (maximum 3-4 sentences) explaining:
1. Why "${selectedAnswer}" is incorrect or a common misconception.
2. Why "${correctAnswer}" is the correct answer based on key concepts.
Keep the tone encouraging, clear, and direct for a university student.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an encouraging and expert professor helping engineering/college students understand quiz concepts.",
          temperature: 0.7,
        },
      });

      const explanation = response.text || "No explanation could be generated.";
      return res.json({ explanation });
    } catch (error: any) {
      console.error("Error generating Gemini quiz explanation:", error);
      return res.status(500).json({
        error:
          error?.message ||
          "Failed to generate explanation. Please try again later.",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
