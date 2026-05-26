import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Turso client setup
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

app.use(express.json());

// Function to initialize database
async function initDb() {
  try {
    // Check if category column exists, if not add it (simple migration)
    const tableInfo = await db.execute("PRAGMA table_info(assets)");
    const hasCategory = tableInfo.rows.some((row: any) => row.name === "category");
    
    if (tableInfo.rows.length === 0) {
      await db.execute(`
        CREATE TABLE assets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          url TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'Geral',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else if (!hasCategory) {
      await db.execute("ALTER TABLE assets ADD COLUMN category TEXT NOT NULL DEFAULT 'Geral'");
    }

    // Seed with current context IDs
    const currentIdContext = "a380962b-6569-42b7-a36f-e3acb40fc3c1";
    
    // Always re-seed with clean URLs (no extensions for better proxy compatibility)
    await db.execute("DELETE FROM assets");
    
    const seedAssets = [
      ["photo", `https://storage.googleapis.com/static.ai.studio/attachments/${currentIdContext}/input_file_4`, "PDV Versão Mobile", "PDV Mobile"],
      ["photo", `https://storage.googleapis.com/static.ai.studio/attachments/${currentIdContext}/input_file_3`, "Mapa de Mesas", "Painel Atendente"],
      ["photo", `https://storage.googleapis.com/static.ai.studio/attachments/${currentIdContext}/input_file_0`, "Pedidos Ativos", "Painel Atendente"],
      ["photo", `https://storage.googleapis.com/static.ai.studio/attachments/${currentIdContext}/input_file_1`, "Gestão de Comanda", "Controle de Mesa"],
      ["photo", `https://storage.googleapis.com/static.ai.studio/attachments/${currentIdContext}/input_file_2`, "Painel Administrativo", "Gestão"],
      ["video", `https://storage.googleapis.com/static.ai.studio/attachments/${currentIdContext}/input_file_5`, "Demonstração Menu Digital", "Menu Digital"],
    ];

    for (const asset of seedAssets) {
      await db.execute({
        sql: "INSERT INTO assets (type, url, title, category) VALUES (?, ?, ?, ?)",
        args: asset
      });
    }
    console.log("Database seeded with clean attachment URLs.");

    console.log("Database initialized (assets table ready)");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// API route to fetch assets (photos and videos)
app.get("/api/assets", async (req, res) => {
  try {
    // Ensure table exists (best effort)
    await initDb();
    
    const result = await db.execute("SELECT * FROM assets ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error: any) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// Middleware for development/production
async function setupVite() {
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
}

setupVite().then(() => {
  initDb(); // Proactively create table
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
