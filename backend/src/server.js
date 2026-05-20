// console.log("SERVER FILE STARTED");

// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");

// // Load environment variables from .env file into process.env
// // Must be called before anything else that uses env vars
// dotenv.config();

// const app = express();

// // ─── Middleware ────────────────────────────────────────────────
// // Tell Express to accept JSON request bodies
// // Without this, req.body is always undefined
// app.use(express.json());

// // Allow requests from our frontend origin
// // In production this will be your Vercel URL
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true, // allow cookies/auth headers
//   }),
// );

// // ─── Routes ────────────────────────────────────────────────────
// // We'll plug in routes here as we build them
// app.use(express.json());
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/courses", require("./routes/course.routes"));

// // ─── Health check ──────────────────────────────────────────────
// // A simple endpoint to confirm the server is running
// // Used by deployment platforms to verify your server is alive
// app.get("/health", (req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// // ─── Global error handler ──────────────────────────────────────
// // Any error thrown anywhere in the app lands here
// // The 4-parameter signature (err, req, res, next) is how Express
// // recognizes this as an error handler — all four params are required
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal server error",
//   });
// });

// // ─── Start server ──────────────────────────────────────────────
// const PORT = process.env.PORT || 5002;

// app.listen(PORT, "127.0.0.1", () => {
//   console.log(`Server running on http://127.0.0.1:${PORT}`);
// });

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
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
