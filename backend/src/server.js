const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { assertRequiredEnv } = require("./utils/env");

dotenv.config();
assertRequiredEnv();

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

const getErrorResponse = (err) => {
  if (err.type === "entity.parse.failed") {
    return { status: 400, message: "Invalid JSON body" };
  }

  if (err.code === "P2002") {
    return { status: 409, message: "A record with this value already exists" };
  }

  if (err.code === "P2003") {
    return { status: 400, message: "Related record does not exist" };
  }

  if (err.code === "P2025") {
    return { status: 404, message: "Record not found" };
  }

  const status = err.status || 500;
  return {
    status,
    message:
      status >= 500 ? "Internal server error" : err.message || "Request failed",
  };
};

app.use((err, req, res, next) => {
  const { status, message } = getErrorResponse(err);

  console.error(err.stack || err);
  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
