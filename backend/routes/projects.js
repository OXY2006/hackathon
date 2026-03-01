const express = require("express");
const router = express.Router();
const projects = require("../data/projects");
const faculty = require("../data/faculty");

// GET /api/projects — all projects across all faculty
router.get("/", (req, res) => {
  const all = [];
  Object.entries(projects).forEach(([facultyId, projs]) => {
    const member = faculty.find((f) => f.id === parseInt(facultyId));
    projs.forEach((p) => {
      all.push({
        ...p,
        facultyId: parseInt(facultyId),
        facultyName: member ? member.name : "Unknown",
        dept: member ? member.dept : null,
      });
    });
  });

  // Optional filter by status
  const { status } = req.query;
  const result = status ? all.filter((p) => p.status === status) : all;

  res.json({ count: result.length, data: result });
});

// GET /api/projects/faculty/:id — all projects for a specific faculty member
router.get("/faculty/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const member = faculty.find((f) => f.id === id);
  if (!member) return res.status(404).json({ error: "Faculty not found" });

  const result = projects[id] || [];
  res.json({
    faculty: member,
    count: result.length,
    data: result,
  });
});

// GET /api/projects/:projectId — single project by its id string
router.get("/:projectId", (req, res) => {
  const { projectId } = req.params;
  for (const projs of Object.values(projects)) {
    const found = projs.find((p) => p.id === projectId);
    if (found) return res.json(found);
  }
  res.status(404).json({ error: "Project not found" });
});

module.exports = router;
