const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "FRONTEND_URL"];

const missingRequiredEnv = () =>
  REQUIRED_ENV.filter((key) => !process.env[key] || !process.env[key].trim());

const assertRequiredEnv = () => {
  const missing = missingRequiredEnv();
  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    const error = new Error("JWT_SECRET is not configured");
    error.status = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

module.exports = { assertRequiredEnv, getJwtSecret, missingRequiredEnv };
