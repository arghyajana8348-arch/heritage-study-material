import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to retrieve and clean the Gemini API Key
  const getGeminiApiKey = () => {
    let rawKey = process.env.GEMINI_API_KEY || "";
    rawKey = rawKey.trim().replace(/^["']|["']$/g, "");
    if (!rawKey || rawKey === "MY_GEMINI_API_KEY" || rawKey === "your_gemini_api_key") {
      return null;
    }
    return rawKey;
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

      if (!questionText || selectedAnswer === undefined || correctAnswer === undefined) {
        return res.status(400).json({
          error: "Missing required fields for explanation generation.",
        });
      }

      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(500).json({
          error:
            "GEMINI_API_KEY environment variable is missing or invalid. Please configure it in Settings > Secrets.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

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

      // Candidate models list using valid Google GenAI SDK models
      const candidateModels = [
        "gemini-3.6-flash",
        "gemini-flash-latest",
      ];

      let explanation: string | null = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction:
                "You are an encouraging and expert professor helping engineering/college students understand quiz concepts.",
              temperature: 0.7,
            },
          });

          if (response && response.text) {
            explanation = response.text;
            break; // Success! Exit model loop
          }
        } catch (err: any) {
          console.warn(`Gemini generation with ${modelName} failed:`, err?.message || err);
          lastError = err;
        }
      }

      if (explanation) {
        return res.json({ explanation });
      }

      throw lastError || new Error("Failed to generate content with available Gemini models.");
    } catch (error: any) {
      console.error("Error generating Gemini quiz explanation:", error);
      const errMsg = error?.message || String(error);

      if (errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("unauthorized") || errMsg.toLowerCase().includes("invalid")) {
        return res.status(401).json({
          error: "Invalid Gemini API key. Please verify your API key in Settings > Secrets.",
        });
      }

      return res.status(500).json({
        error: "Failed to generate explanation. Please try again later.",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Catch-all for API endpoints to ensure JSON response instead of HTML index fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found.` });
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
