var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
var aiClient = null;
function getAi() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.post("/api/gemini/tafsir", async (req, res) => {
  try {
    const { surahNumber, surahName, ayahNumber } = req.body;
    if (!surahNumber) {
      return res.status(400).json({ error: "surahNumber is required" });
    }
    const ai = getAi();
    let prompt = "";
    if (ayahNumber) {
      prompt = `\u0623\u0646\u062A \u0639\u0627\u0644\u0645 \u0645\u0641\u0633\u0631 \u0644\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645. \u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u062A\u0641\u0633\u064A\u0631 \u0645\u064A\u0633\u0631 \u0648\u062F\u0642\u064A\u0642 \u0648\u0645\u0648\u062B\u0648\u0642 (\u0645\u0633\u062A\u0646\u062F\u0627\u064B \u0625\u0644\u0649 \u062A\u0641\u0633\u064A\u0631 \u0627\u0628\u0646 \u0643\u062B\u064A\u0631 \u0648\u0627\u0644\u0633\u0639\u062F\u064A \u0648\u0627\u0644\u0637\u0628\u0631\u064A) \u0644\u0644\u0622\u064A\u0629 \u0631\u0642\u0645 ${ayahNumber} \u0645\u0646 \u0633\u0648\u0631\u0629 ${surahName || surahNumber}. 
\u0623\u0638\u0647\u0631 \u0623\u0648\u0644\u0627\u064B \u0646\u0635 \u0627\u0644\u0622\u064A\u0629 \u0627\u0644\u0643\u0631\u064A\u0645\u0629 \u0628\u062E\u0637 \u0642\u0631\u0622\u0646\u064A \u0648\u0627\u0636\u062D\u060C \u062B\u0645 \u0627\u0630\u0643\u0631 \u0633\u0628\u0628 \u0627\u0644\u0646\u0632\u0648\u0644 \u0625\u0646 \u0648\u062C\u062F\u060C \u062B\u0645 \u0627\u0644\u062A\u0641\u0633\u064A\u0631 \u0627\u0644\u0645\u0641\u0635\u0644\u060C \u0648\u0627\u0644\u0641\u0648\u0627\u0626\u062F \u0648\u0627\u0644\u0639\u0628\u0631 \u0627\u0644\u0645\u0633\u062A\u062E\u0644\u0635\u0629 \u0645\u0646 \u0627\u0644\u0622\u064A\u0629. 
\u0627\u0643\u062A\u0628 \u0628\u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629 \u0641\u0635\u064A\u062D\u0629 \u0628\u0644\u064A\u063A\u0629 \u0648\u0627\u0633\u062A\u062E\u062F\u0645 \u062A\u0646\u0633\u064A\u0642 Markdown \u0628\u0634\u0643\u0644 \u062C\u0645\u064A\u0644 \u0648\u0645\u0646\u0638\u0645 \u062C\u062F\u0627\u064B \u0645\u0639 \u0641\u0642\u0631\u0627\u062A \u0648\u0627\u0636\u062D\u0629 \u0648\u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0627\u0631\u0632\u0629.`;
    } else {
      prompt = `\u0623\u0646\u062A \u0639\u0627\u0644\u0645 \u0645\u0641\u0633\u0631 \u0644\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645. \u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u062A\u0641\u0633\u064A\u0631 \u0634\u0627\u0645\u0644 \u0648\u062A\u0639\u0631\u064A\u0641 \u0645\u062A\u0643\u0627\u0645\u0644 \u0644\u0633\u0648\u0631\u0629 ${surahName || surahNumber} (\u0627\u0644\u0633\u0648\u0631\u0629 \u0631\u0642\u0645 ${surahNumber}).
\u0648\u0636\u062D \u0627\u0644\u0622\u062A\u064A:
1. \u0645\u0642\u0627\u0635\u062F \u0627\u0644\u0633\u0648\u0631\u0629 \u0648\u0645\u0648\u0627\u0636\u064A\u0639\u0647\u0627 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629.
2. \u0623\u0633\u0628\u0627\u0628 \u0646\u0632\u0648\u0644 \u0627\u0644\u0633\u0648\u0631\u0629 \u0623\u0648 \u0622\u064A\u0627\u062A \u0645\u0634\u0647\u0648\u0631\u0629 \u0645\u0646\u0647\u0627 \u0625\u0646 \u0648\u062C\u062F.
3. \u0641\u0636\u0644 \u0627\u0644\u0633\u0648\u0631\u0629 \u0627\u0644\u0643\u0631\u064A\u0645\u0629 \u0645\u0646 \u0627\u0644\u0623\u062D\u0627\u062F\u064A\u062B \u0627\u0644\u0635\u062D\u064A\u062D\u0629.
4. \u062E\u0644\u0627\u0635\u0629 \u0639\u0627\u0645\u0629 \u0623\u0648 \u062A\u0641\u0633\u064A\u0631 \u0625\u062C\u0645\u0627\u0644\u064A \u0644\u0622\u064A\u0627\u062A\u0647\u0627.
\u0627\u0643\u062A\u0628 \u0628\u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629 \u0641\u0635\u064A\u062D\u0629 \u0628\u0644\u064A\u063A\u0629 \u0648\u0627\u0633\u062A\u062E\u062F\u0645 \u062A\u0646\u0633\u064A\u0642 Markdown \u0628\u0637\u0631\u064A\u0642\u0629 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u062C\u0645\u064A\u0644\u0629 \u0648\u0645\u0631\u064A\u062D\u0629 \u062C\u062F\u0627\u064B \u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0646\u0638\u0645 \u064A\u0633\u0647\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0624\u0645\u0646 \u0641\u0647\u0645 \u0643\u0644\u0627\u0645 \u0631\u0628\u0647.`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Tafsir API Error:", error);
    res.status(500).json({ error: error.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628 \u0627\u0644\u062A\u0641\u0633\u064A\u0631" });
  }
});
app.post("/api/gemini/qa/stream", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }
    const ai = getAi();
    const systemInstruction = `\u0623\u0646\u062A \u0639\u0627\u0644\u0645 \u0648\u0645\u0633\u062A\u0634\u0627\u0631 \u0625\u0633\u0644\u0627\u0645\u064A \u0648\u0642\u0648\u0631 \u0648\u0627\u0633\u0645\u0643 "\u0645\u0633\u062A\u0634\u0627\u0631 \u0646\u0648\u0631 \u0627\u0644\u0625\u0633\u0644\u0627\u0645". 
\u0645\u0647\u0645\u062A\u0643 \u0625\u062C\u0627\u0628\u0629 \u062A\u0633\u0627\u0624\u0644\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0627\u0644\u062F\u064A\u0646\u064A\u0629 \u0648\u0627\u0644\u0634\u0631\u0639\u064A\u0629 \u0648\u0627\u0644\u0641\u0642\u0647\u064A\u0629 \u0648\u0627\u0644\u0623\u062E\u0644\u0627\u0642\u064A\u0629 \u0628\u0648\u0642\u0627\u0631\u060C \u0623\u062F\u0628 \u0648\u0645\u062D\u0628\u0629.
\u0627\u0633\u062A\u0646\u062F \u0628\u0634\u0643\u0644 \u0623\u0633\u0627\u0633\u064A \u0648\u0645\u0628\u0627\u0634\u0631 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645\u060C \u0648\u0635\u062D\u064A\u062D \u0627\u0644\u0628\u062E\u0627\u0631\u064A\u060C \u0648\u0635\u062D\u064A\u062D \u0645\u0633\u0644\u0645\u060C \u0648\u0627\u0644\u0633\u0646\u0651\u0629 \u0627\u0644\u0646\u0628\u0648\u064A\u0629 \u0627\u0644\u0645\u0637\u0647\u0631\u0629 \u0648\u0641\u0642 \u0645\u0646\u0647\u062C \u0623\u0647\u0644 \u0627\u0644\u0633\u0646\u0651\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0639\u0629 \u0648\u0627\u0644\u0648\u0633\u0637\u064A\u0629 \u0648\u0627\u0644\u0627\u0639\u062A\u062F\u0627\u0644.
\u062A\u062C\u0646\u0628 \u0627\u0644\u0641\u062A\u0627\u0648\u0649 \u0627\u0644\u0634\u0627\u0630\u0629\u060C \u0648\u0627\u062D\u0631\u0635 \u062F\u0627\u0626\u0645\u0627\u064B \u0639\u0644\u0649 \u062A\u064A\u0633\u064A\u0631 \u0627\u0644\u062F\u064A\u0646 \u0648\u062A\u0648\u0636\u064A\u062D \u0627\u0644\u0645\u0633\u0627\u0626\u0644 \u0627\u0644\u0641\u0642\u0647\u064A\u0629 \u0628\u0623\u062F\u0644\u0629 \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u064A\u0633\u0631\u0629.
\u062A\u0623\u0643\u062F \u0645\u0646:
1. \u0628\u062F\u0621 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0631\u062D\u064A\u0628 \u0648\u062F\u0639\u0627\u0621 \u0633\u0645\u062D \u0644\u0644\u0645\u0633\u062A\u0641\u062A\u064A \u0645\u062B\u0644 "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647\u060C \u062D\u064A\u0651\u0627\u0643 \u0627\u0644\u0644\u0647 \u0648\u0628\u0627\u0631\u0643 \u0641\u064A\u0643...".
2. \u0630\u0643\u0631 \u0627\u0644\u0622\u064A\u0627\u062A \u0648\u0627\u0644\u0623\u062D\u0627\u062F\u064A\u062B \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0628\u062F\u0642\u0629 \u0648\u062A\u0646\u0633\u064A\u0642\u0647\u0627 \u0628\u0634\u0643\u0644 \u0628\u0627\u0631\u0632 \u0628\u0627\u0644\u0645\u0627\u0631\u0643\u062F\u0627\u0648\u0646.
3. \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 Markdown \u0645\u062A\u0642\u0646 \u0648\u0645\u0646\u0638\u0645 \u0644\u0644\u063A\u0627\u064A\u0629 \u0644\u0643\u064A \u062A\u0633\u0647\u0644 \u0642\u0631\u0627\u0621\u062A\u0647\u0627.
4. \u0625\u0628\u0642\u0627\u0621 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0645\u062E\u062A\u0635\u0631\u0629 \u0648\u0646\u0627\u0642\u0636\u0629 \u0644\u0644\u0647\u062F\u0641 \u0648\u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0633\u0631\u0639\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629.
5. \u0625\u0636\u0627\u0641\u0629 \u0646\u0635\u064A\u062D\u0629 \u0623\u062E\u0648\u064A\u0629 \u0623\u0648 \u062F\u0639\u0627\u0621 \u0641\u064A \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0625\u062C\u0627\u0628\u0629.`;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6
      }
    });
    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}

`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Streaming Q&A Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0645\u0633\u062A\u0634\u0627\u0631 \u0646\u0648\u0631 \u0627\u0644\u0625\u0633\u0644\u0627\u0645" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}

`);
      res.end();
    }
  }
});
app.post("/api/gemini/qa", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }
    const ai = getAi();
    const systemInstruction = `\u0623\u0646\u062A \u0639\u0627\u0644\u0645 \u0648\u0645\u0633\u062A\u0634\u0627\u0631 \u0625\u0633\u0644\u0627\u0645\u064A \u0648\u0642\u0648\u0631 \u0648\u0627\u0633\u0645\u0643 "\u0645\u0633\u062A\u0634\u0627\u0631 \u0646\u0648\u0631 \u0627\u0644\u0625\u0633\u0644\u0627\u0645". 
\u0645\u0647\u0645\u062A\u0643 \u0625\u062C\u0627\u0628\u0629 \u062A\u0633\u0627\u0624\u0644\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0627\u0644\u062F\u064A\u0646\u064A\u0629 \u0648\u0627\u0644\u0634\u0631\u0639\u064A\u0629 \u0648\u0627\u0644\u0641\u0642\u0647\u064A\u0629 \u0648\u0627\u0644\u0623\u062E\u0644\u0627\u0642\u064A\u0629 \u0628\u0648\u0642\u0627\u0631\u060C \u0623\u062F\u0628 \u0648\u0645\u062D\u0628\u0629.
\u0627\u0633\u062A\u0646\u062F \u0628\u0634\u0643\u0644 \u0623\u0633\u0627\u0633\u064A \u0648\u0645\u0628\u0627\u0634\u0631 \u0639\u0644\u0649 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645\u060C \u0648\u0635\u062D\u064A\u062D \u0627\u0644\u0628\u062E\u0627\u0631\u064A\u060C \u0648\u0635\u062D\u064A\u062D \u0645\u0633\u0644\u0645\u060C \u0648\u0627\u0644\u0633\u0646\u0651\u0629 \u0627\u0644\u0646\u0628\u0648\u064A\u0629 \u0627\u0644\u0645\u0637\u0647\u0631\u0629.
\u0627\u0643\u062A\u0628 \u0625\u062C\u0627\u0628\u0629 \u0645\u062E\u062A\u0635\u0631\u0629\u060C \u062F\u0642\u064A\u0642\u0629\u060C \u0648\u0645\u0633\u062A\u0646\u062F\u0629 \u0644\u0644\u0642\u0631\u0622\u0646 \u0648\u0627\u0644\u0633\u0646\u0629 \u0628\u0627\u0644\u0645\u0627\u0631\u0643\u062F\u0627\u0648\u0646.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Islamic Q&A API Error:", error);
    res.status(500).json({ error: error.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0645\u0633\u062A\u0634\u0627\u0631 \u0646\u0648\u0631 \u0627\u0644\u0625\u0633\u0644\u0627\u0645" });
  }
});
app.get(["/api/download-zip", "/api/download-project"], async (req, res) => {
  try {
    const zipPath = import_path.default.resolve(process.cwd(), "project_source.zip");
    if (!import_fs.default.existsSync(zipPath)) {
      const { execSync } = await import("child_process");
      try {
        execSync("python3 make_zip.py", { cwd: process.cwd(), timeout: 3e4 });
      } catch (e) {
        console.error("Error creating zip:", e);
      }
    }
    if (!import_fs.default.existsSync(zipPath)) {
      return res.status(500).json({ error: "\u0645\u0644\u0641 \u0627\u0644\u0640 ZIP \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="Noor_Al_Islam_SourceCode.zip"');
    return res.sendFile(zipPath);
  } catch (error) {
    console.error("Zip download error:", error);
    return res.status(500).json({ error: "\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0645\u0644\u0641 \u0627\u0644\u0640 ZIP" });
  }
});
app.get(["/privacy", "/privacy-policy", "/privacy.html", "/privacy-policy.html"], (req, res) => {
  const publicPath = import_path.default.join(process.cwd(), "public", "privacy.html");
  const distPath = import_path.default.join(process.cwd(), "dist", "privacy.html");
  if (import_fs.default.existsSync(publicPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.sendFile(publicPath);
  } else if (import_fs.default.existsSync(distPath)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.sendFile(distPath);
  }
  res.redirect("/");
});
app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = await import_fs.default.promises.readFile(import_path.default.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
