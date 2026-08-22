import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createApp } from "./backend/src/app.js";

async function startServer() {
  // Use the modular backend Express application factory from backend/
  const app = createApp();
  const PORT = 3000;

  // Serve static assets from public folder
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Serve Vite in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MAGADH TYRES Full-Stack server running at http://localhost:${PORT}`);
  });
}

startServer();
