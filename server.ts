import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();
console.log("Environment check:", { 
  hasUrl: !!process.env.TURSO_DATABASE_URL, 
  hasToken: !!process.env.TURSO_AUTH_TOKEN 
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple ping endpoint (zero dependencies)
app.get("/api/ping", (req, res) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

// Turso client setup
let dbInitError: string | null = null;
let initPromise: Promise<void> | null = null;
let db: any = null;

async function getDb() {
  if (!db) {
    const dbUrl = process.env.TURSO_DATABASE_URL || process.env.URL_DO_BANCO_DE_DADOS_TURSO;
    const dbToken = process.env.TURSO_AUTH_TOKEN;
    
    const isVercel = !!process.env.VERCEL;
    // For Vercel without URL, use dummy so build/function doesn't crash immediately
    const defaultDbUrl = isVercel ? "libsql://dummy-url-to-prevent-crash.turso.io" : "file:local.db";
    
    if (!dbUrl && isVercel) {
      console.error("❌ CRITICAL: No database URL provided in Vercel environment.");
    }

    try {
      db = createClient({
        url: dbUrl || defaultDbUrl,
        authToken: dbToken || "",
      });
    } catch (e: any) {
      console.error("Failed to create Turso client:", e);
      throw new Error(`Failed to create database client: ${e.message}`);
    }
  }
  return db;
}

// Function to initialize database
async function initDb() {
  try {
    console.log("Checking/Initializing database...");
    const database = await getDb();
    
    // Categories table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);
    
    // Assets table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Geral',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Users table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Leads table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed defaults if needed
    const settingsCheck = await database.execute("SELECT count(*) as count FROM settings");
    if (Number(settingsCheck.rows[0].count) === 0) {
      await database.execute({
        sql: "INSERT INTO settings (key, value) VALUES (?, ?)",
        args: ["whatsapp", "5585987582159"]
      });
      await database.execute({
        sql: "INSERT INTO settings (key, value) VALUES (?, ?)",
        args: ["logo_url", "/logo-horizontal.png"]
      });
    }

    const usersCheck = await database.execute("SELECT count(*) as count FROM users");
    if (Number(usersCheck.rows[0].count) === 0) {
      await database.execute({
        sql: "INSERT INTO users (email, password) VALUES (?, ?)",
        args: ["admin@admin.com", "admin123"]
      });
    }

    console.log("Database initialized successfully");
    dbInitError = null;
  } catch (error: any) {
    console.error("Failed to initialize database:", error);
    dbInitError = error.message;
    // Reset promise so we can retry on next request if it was a transient error
    initPromise = null; 
    throw error;
  }
}

async function ensureDb() {
  if (!initPromise) {
    initPromise = initDb();
  }
  return initPromise;
}

// API routes go here FIRST
app.get("/api/health", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const result = await database.execute("SELECT 1 as ok");
    res.json({ status: "ok", database: "connected", result: result.rows[0], initError: dbInitError });
  } catch (error: any) {
    res.status(500).json({ status: "error", database: "disconnected", error: error.message, initError: dbInitError });
  }
});

// Auth Endpoints
app.post("/api/login", async (req, res) => {
  console.log("Login attempt:", req.body.email);
  try {
    await ensureDb();
    const database = await getDb();
    const { email, password } = req.body;
    const result = await database.execute({
      sql: "SELECT * FROM users WHERE email = ? AND password = ?",
      args: [email, password]
    });
    if (result.rows.length > 0) {
      res.json({ success: true, email: result.rows[0].email });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Erro no login", details: error.message });
  }
});

app.post("/api/users/password", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const { email, newPassword, currentPassword } = req.body;
    // Verify current password first
    const verify = await database.execute({
      sql: "SELECT * FROM users WHERE email = ? AND password = ?",
      args: [email, currentPassword]
    });
    
    if (verify.rows.length === 0) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    await database.execute({
      sql: "UPDATE users SET password = ? WHERE email = ?",
      args: [newPassword, email]
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao trocar de senha" });
  }
});

// Settings Endpoints
app.get("/api/settings", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const result = await database.execute("SELECT * FROM settings");
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  } catch (error: any) {
    console.error("Fetch Settings Error:", error);
    res.status(500).json({ error: "Failed to fetch settings", details: error.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const { whatsapp, logo_url } = req.body;
    if (whatsapp) {
      await database.execute({ sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('whatsapp', ?)", args: [whatsapp] });
    }
    if (logo_url) {
      await database.execute({ sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('logo_url', ?)", args: [logo_url] });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Categories Endpoints
app.get("/api/categories", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const result = await database.execute("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const { name } = req.body;
    await database.execute({ sql: "INSERT INTO categories (name) VALUES (?)", args: [name] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    await database.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Assets Endpoints
app.get("/api/assets", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const result = await database.execute("SELECT * FROM assets ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

app.post("/api/assets", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const { type, url, title, category } = req.body;
    await database.execute({
      sql: "INSERT INTO assets (type, url, title, category) VALUES (?, ?, ?, ?)",
      args: [type, url, title, category]
    });
    // Ensure category exists
    try {
      await database.execute({ sql: "INSERT OR IGNORE INTO categories (name) VALUES (?)", args: [category] });
    } catch(e) {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create asset" });
  }
});

app.delete("/api/assets/:id", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    await database.execute({ sql: "DELETE FROM assets WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

// Leads Endpoints
app.post("/api/leads", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const { name, contact } = req.body;
    await database.execute({
      sql: "INSERT INTO leads (name, contact) VALUES (?, ?)",
      args: [name, contact]
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit lead" });
  }
});

app.get("/api/leads", async (req, res) => {
  try {
    await ensureDb();
    const database = await getDb();
    const result = await database.execute("SELECT * FROM leads ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// Final server startup
async function startServer() {
  console.log("Starting server process...");
  const isVercel = !!process.env.VERCEL;
  const isProd = process.env.NODE_ENV === "production";
  
  console.log(`Environment: Vercel=${isVercel}, Prod=${isProd}`);

  // Initialize DB
  initDb().then(() => {
    console.log("Database initialization check complete.");
  }).catch(err => {
    console.error("Database initialization CRITICAL FAILURE:", err);
    dbInitError = err.message;
  });

  if (!isProd && !isVercel) {
    console.log("Setting up Vite middleware for development...");
    try {
      const moduleName = "vite";
      const viteModule = await import(/* @vite-ignore */ moduleName);
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e: any) {
      console.error("Vite startup failed:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Setting up static serving from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: "Endpoint não encontrado" });
      }
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath);
    });
  }

  if (!isVercel) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

// Only auto-start server if not on Vercel
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Failed to start server:", err);
  });
}

export default app;
