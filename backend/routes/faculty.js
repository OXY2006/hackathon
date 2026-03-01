const express = require("express");
const router = express.Router();
const faculty = require("../data/faculty");

// GET /api/faculty — all faculty, supports ?dept= and ?q= filters
router.get("/", (req, res) => {
  let result = [...faculty];

  const { dept, q } = req.query;

  if (dept) {
    const depts = dept.toUpperCase().split(",");
    result = result.filter((f) => depts.includes(f.dept));
  }

  if (q) {
    const query = q.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.dept.toLowerCase().includes(query) ||
        f.deptLabel.toLowerCase().includes(query) ||
        f.title.toLowerCase().includes(query)
    );
  }

  res.json({ count: result.length, data: result });
});

// GET /api/faculty/:id — single faculty member
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const member = faculty.find((f) => f.id === id);
  if (!member) return res.status(404).json({ error: "Faculty not found" });
  res.json(member);
});

module.exports = router;
