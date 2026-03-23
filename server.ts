import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// In-memory analytics for demo
let analysisCount = 0;
const errorLogs: any[] = [];

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// API Routes
app.get("/api/stats", (req, res) => {
  res.json({
    analysisCount,
    errorCount: errorLogs.length,
    uptime: process.uptime()
  });
});

app.get("/api/logs", (req, res) => {
  res.json(errorLogs.slice(-10)); // Last 10 errors
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
