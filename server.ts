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

  // API route for generating Gemini AI overall Quiz Performance Rating & Detailed Review
  app.post("/api/quiz/rate-performance", async (req, res) => {
    try {
      const {
        subjectName,
        moduleName,
        score,
        total,
        percentage,
        questionsSummary,
      } = req.body;

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
Act as an expert academic mentor analyzing a student's performance on a quiz.
Subject: ${subjectName || "Engineering / Science"}
Module: ${moduleName || "General"}
Score: ${score} / ${total} (${percentage}%)

Summary of Questions:
${JSON.stringify(questionsSummary || [], null, 2)}

Provide a structured assessment JSON object with the following fields EXACTLY:
{
  "ratingTitle": "Short catchy title (e.g. 'A+ Concept Mastery', 'B+ Strong Concept Foundation', 'C Concept Brushup Needed')",
  "stars": <number between 1 and 5 based on percentage: 90-100% -> 5, 75-89% -> 4, 60-74% -> 3, 40-59% -> 2, below 40% -> 1>,
  "summary": "2-3 sentences summarizing the overall performance and core takeaways.",
  "strengths": ["1-2 key areas where student demonstrated good understanding"],
  "areasToImprove": ["1-2 specific conceptual topics or question types where student lost points"],
  "actionableTip": "1 practical study tip to master this module before exams"
}

Return ONLY valid raw JSON. No markdown blocks or extra text around it.
`;

      const candidateModels = ["gemini-3.6-flash", "gemini-flash-latest"];
      let rawJson: string | null = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction:
                "You are an encouraging academic evaluation AI that outputs clean, valid JSON performance ratings.",
              temperature: 0.5,
              responseMimeType: "application/json",
            },
          });

          if (response && response.text) {
            rawJson = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini rating with ${modelName} failed:`, err?.message || err);
          lastError = err;
        }
      }

      if (!rawJson) {
        throw lastError || new Error("Failed to get rating from Gemini AI.");
      }

      let parsedRating;
      try {
        const cleanStr = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedRating = JSON.parse(cleanStr);
      } catch (parseErr) {
        console.error("Failed to parse Gemini JSON output:", rawJson);
        parsedRating = {
          ratingTitle: percentage >= 80 ? "A - Concept Master" : percentage >= 60 ? "B - Solid Performance" : "C - Study Needed",
          stars: Math.max(1, Math.min(5, Math.ceil(percentage / 20))),
          summary: `You scored ${score}/${total} (${percentage}%) on ${moduleName}.`,
          strengths: [percentage >= 50 ? "Good engagement with core questions" : "Attempted all module questions"],
          areasToImprove: [percentage < 100 ? "Review incorrect options carefully" : "Maintain consistency across modules"],
          actionableTip: "Re-read the study module PDF and take practice notes on missed topics.",
        };
      }

      return res.json({ rating: parsedRating });
    } catch (error: any) {
      console.error("Error generating Gemini AI performance rating:", error);
      return res.status(500).json({
        error: error?.message || "Failed to generate AI performance rating.",
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
