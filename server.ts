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

    // Seed with the provided assets if empty
    const check = await db.execute("SELECT count(*) as count FROM assets");
    if (Number(check.rows[0].count) !== 6) { // Force re-seed for the 6 items
      await db.execute("DELETE FROM assets");
      
      const seedAssets = [
        ["photo", "https://storage.googleapis.com/static.ai.studio/attachments/4fcb8b20-1df3-4c90-880c-e2f494a8677f/input_file_0.png", "PDV Versão Mobile", "PDV Mobile"],
        ["photo", "https://storage.googleapis.com/static.ai.studio/attachments/4fcb8b20-1df3-4c90-880c-e2f494a8677f/input_file_1.png", "Mapa de Mesas", "Painel Atendente"],
        ["photo", "https://storage.googleapis.com/static.ai.studio/attachments/4fcb8b20-1df3-4c90-880c-e2f494a8677f/input_file_2.png", "Pedidos Ativos", "Painel Atendente"],
        ["photo", "https://storage.googleapis.com/static.ai.studio/attachments/4fcb8b20-1df3-4c90-880c-e2f494a8677f/input_file_3.png", "Gestão de Comanda", "Painel Atendente"],
        ["photo", "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&q=80&w=800", "Portal do Entregador - Dashboard", "Portal do Entregador"],
        ["video", "https://storage.googleapis.com/static.ai.studio/attachments/ecbd09a5-a0ca-4766-9ab5-d6ca8e1c6af3/input_file_0.mp4", "Menu Digital DevARO", "Menu Digital"],
      ];

      for (const asset of seedAssets) {
        await db.execute({
          sql: "INSERT INTO assets (type, url, title, category) VALUES (?, ?, ?, ?)",
          args: asset
        });
      }
      console.log("Database seeded with gallery assets.");
    }

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
