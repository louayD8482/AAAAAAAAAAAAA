/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check endpoint for Cloud Run
app.get(["/api/health", "/healthz", "/_health"], (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Lazy-initialize Gemini client to avoid startup crashes if key is initially empty
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. API route for dynamic Tafsir
app.post("/api/gemini/tafsir", async (req, res) => {
  try {
    const { surahNumber, surahName, ayahNumber } = req.body;
    if (!surahNumber) {
      return res.status(400).json({ error: "surahNumber is required" });
    }

    const ai = getAi();
    let prompt = "";
    if (ayahNumber) {
      prompt = `أنت عالم مفسر للقرآن الكريم. يرجى تقديم تفسير ميسر ودقيق وموثوق (مستنداً إلى تفسير ابن كثير والسعدي والطبري) للآية رقم ${ayahNumber} من سورة ${surahName || surahNumber}. 
أظهر أولاً نص الآية الكريمة بخط قرآني واضح، ثم اذكر سبب النزول إن وجد، ثم التفسير المفصل، والفوائد والعبر المستخلصة من الآية. 
اكتب بلغة عربية فصيحة بليغة واستخدم تنسيق Markdown بشكل جميل ومنظم جداً مع فقرات واضحة وعناوين بارزة.`;
    } else {
      prompt = `أنت عالم مفسر للقرآن الكريم. يرجى تقديم تفسير شامل وتعريف متكامل لسورة ${surahName || surahNumber} (السورة رقم ${surahNumber}).
وضح الآتي:
1. مقاصد السورة ومواضيعها الرئيسية.
2. أسباب نزول السورة أو آيات مشهورة منها إن وجد.
3. فضل السورة الكريمة من الأحاديث الصحيحة.
4. خلاصة عامة أو تفسير إجمالي لآياتها.
اكتب بلغة عربية فصيحة بليغة واستخدم تنسيق Markdown بطريقة احترافية وجميلة ومريحة جداً للقراءة وبأسلوب منظم يسهل على المؤمن فهم كلام ربه.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Tafsir API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة طلب التفسير" });
  }
});

// 2. API route for Islamic Q&A Companion (Streaming for real-time speed)
app.post("/api/gemini/qa/stream", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const ai = getAi();
    
    const systemInstruction = `أنت عالم ومستشار إسلامي وقور واسمك "مستشار نور الإسلام". 
مهمتك إجابة تساؤلات المستخدمين الدينية والشرعية والفقهية والأخلاقية بوقار، أدب ومحبة.
استند بشكل أساسي ومباشر على القرآن الكريم، وصحيح البخاري، وصحيح مسلم، والسنّة النبوية المطهرة وفق منهج أهل السنّة والجماعة والوسطية والاعتدال.
تجنب الفتاوى الشاذة، واحرص دائماً على تيسير الدين وتوضيح المسائل الفقهية بأدلة واضحة وميسرة.
تأكد من:
1. بدء الإجابة بترحيب ودعاء سمح للمستفتي مثل "السلام عليكم ورحمة الله وبركاته، حيّاك الله وبارك فيك...".
2. ذكر الآيات والأحاديث الصحيحة بدقة وتنسيقها بشكل بارز بالماركداون.
3. كتابة الإجابة بتنسيق Markdown متقن ومنظم للغاية لكي تسهل قراءتها.
4. إبقاء الإجابة مختصرة وناقضة للهدف ومباشرة لسرعة القراءة.
5. إضافة نصيحة أخوية أو دعاء في نهاية الإجابة.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Streaming Q&A Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بمستشار نور الإسلام" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// 2b. Standard fallback API route for Islamic Q&A
app.post("/api/gemini/qa", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const ai = getAi();
    
    const systemInstruction = `أنت عالم ومستشار إسلامي وقور واسمك "مستشار نور الإسلام". 
مهمتك إجابة تساؤلات المستخدمين الدينية والشرعية والفقهية والأخلاقية بوقار، أدب ومحبة.
استند بشكل أساسي ومباشر على القرآن الكريم، وصحيح البخاري، وصحيح مسلم، والسنّة النبوية المطهرة.
اكتب إجابة مختصرة، دقيقة، ومستندة للقرآن والسنة بالماركداون.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Islamic Q&A API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بمستشار نور الإسلام" });
  }
});

// Standalone Privacy Policy web page for App Store Connect submission
app.get(["/privacy", "/privacy-policy", "/privacy.html", "/privacy-policy.html"], (req, res) => {
  const publicPath = path.join(process.cwd(), "public", "privacy.html");
  const distPath = path.join(process.cwd(), "dist", "privacy.html");
  if (fs.existsSync(publicPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.sendFile(publicPath);
  } else if (fs.existsSync(distPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.sendFile(distPath);
  }
  res.redirect("/");
});

// Serve static assets from public folder directly
app.use(express.static(path.join(process.cwd(), "public")));

// Serve static files / Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development mode
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = await fs.promises.readFile(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexPath = path.join(distPath, "index.html");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.sendFile(path.join(process.cwd(), "index.html"));
      }
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
