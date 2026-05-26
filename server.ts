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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Function to initialize database
async function initDb() {
  try {
    // Categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);

    // Assets table
    await db.execute(`
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
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Leads table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed defaults if needed
    const settingsCheck = await db.execute("SELECT count(*) as count FROM settings");
    if (Number(settingsCheck.rows[0].count) === 0) {
      await db.execute({
        sql: "INSERT INTO settings (key, value) VALUES (?, ?)",
        args: ["whatsapp", "5585987582159"]
      });
      await db.execute({
        sql: "INSERT INTO settings (key, value) VALUES (?, ?)",
        args: ["logo_url", "/logo-horizontal.png"]
      });
    }

    const usersCheck = await db.execute("SELECT count(*) as count FROM users");
    if (Number(usersCheck.rows[0].count) === 0) {
      await db.execute({
        sql: "INSERT INTO users (email, password) VALUES (?, ?)",
        args: ["admin@admin.com", "admin123"]
      });
    }

    console.log("Database initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

// Auth Endpoints
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ? AND password = ?",
      args: [email, password]
    });
    if (result.rows.length > 0) {
      res.json({ success: true, email: result.rows[0].email });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no login" });
  }
});

app.post("/api/users/password", async (req, res) => {
  try {
    const { email, newPassword, currentPassword } = req.body;
    // Verify current password first
    const verify = await db.execute({
      sql: "SELECT * FROM users WHERE email = ? AND password = ?",
      args: [email, currentPassword]
    });
    
    if (verify.rows.length === 0) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    await db.execute({
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
    const result = await db.execute("SELECT * FROM settings");
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const { whatsapp, logo_url } = req.body;
    if (whatsapp) {
      await db.execute({ sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('whatsapp', ?)", args: [whatsapp] });
    }
    if (logo_url) {
      await db.execute({ sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('logo_url', ?)", args: [logo_url] });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Categories Endpoints
app.get("/api/categories", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;
    await db.execute({ sql: "INSERT INTO categories (name) VALUES (?)", args: [name] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Assets Endpoints
app.get("/api/assets", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM assets ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

app.post("/api/assets", async (req, res) => {
  try {
    const { type, url, title, category } = req.body;
    await db.execute({
      sql: "INSERT INTO assets (type, url, title, category) VALUES (?, ?, ?, ?)",
      args: [type, url, title, category]
    });
    // Ensure category exists
    try {
      await db.execute({ sql: "INSERT OR IGNORE INTO categories (name) VALUES (?)", args: [category] });
    } catch(e) {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create asset" });
  }
});

app.delete("/api/assets/:id", async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM assets WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

// Leads Endpoints
app.post("/api/leads", async (req, res) => {
  try {
    const { name, contact } = req.body;
    await db.execute({
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
    const result = await db.execute("SELECT * FROM leads ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leads" });
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
