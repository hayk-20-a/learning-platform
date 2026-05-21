const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

//  Middleware FIRST — before any routes
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Routes AFTER middleware
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/courses", require("./routes/course.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/enrollments", require("./routes/enrollment.routes"));
app.use("/api", require("./routes/section.routes"));
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/progress", require("./routes/progress.routes"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
