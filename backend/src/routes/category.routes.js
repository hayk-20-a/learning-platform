const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");

// GET /api/categories — public, no auth needed
router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
