const cors = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
};

const jsonHeaders = (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
};

module.exports = { cors, jsonHeaders };
