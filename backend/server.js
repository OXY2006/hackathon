const express = require("express");
const path = require("path");
const { cors, jsonHeaders } = require("./middleware/headers");

const facultyRoutes  = require("./routes/faculty");
const projectRoutes  = require("./routes/projects");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors);
app.use(express.json());

// ── Serve frontend static files ───────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/faculty",   jsonHeaders, facultyRoutes);
app.use("/api/projects",  jsonHeaders, projectRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Fallback: serve index.html for any non-API route ─────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Scholar Suite running at http://localhost:${PORT}`);
  console.log(`  API: http://localhost:${PORT}/api/faculty`);
  console.log(`  API: http://localhost:${PORT}/api/projects\n`);
});
