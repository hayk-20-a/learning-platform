const jwt = require("jsonwebtoken");

// This middleware runs BEFORE protected route handlers
// It checks if the request carries a valid JWT token
// If valid — attaches the user info to req.user and calls next()
// If invalid — immediately returns 401 Unauthorized

const authenticate = (req, res, next) => {
  // JWT is sent in the Authorization header as: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role } — now available in all route handlers
    next(); // proceed to the actual route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Role-based authorization — used after authenticate
// Usage: router.delete('/course/:id', authenticate, authorize('TEACHER', 'ADMIN'), ...)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
