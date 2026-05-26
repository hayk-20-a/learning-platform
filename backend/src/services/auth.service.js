const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email");

const normalizeSignupRole = (role) => {
  const normalized = role ? String(role).toUpperCase() : "STUDENT";
  if (normalized === "STUDENT" || normalized === "TEACHER") {
    return normalized;
  }

  const error = new Error("Invalid role selected");
  error.status = 400;
  throw error;
};

const register = async ({ name, email, password, role }) => {
  const signupRole = normalizeSignupRole(role);
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error("Email already in use");
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Generate email verification token
  const emailVerifyToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: signupRole,
      emailVerifyToken,
      isEmailVerified: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // Send verification email
  try {
    await sendVerificationEmail({
      to: email,
      name,
      token: emailVerifyToken,
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    // Don't block registration if email fails
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  const invalidError = new Error("Invalid email or password");
  invalidError.status = 401;

  if (!user) throw invalidError;

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) throw invalidError;

  // Warn if email not verified but don't block login
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const {
    passwordHash,
    emailVerifyToken,
    passwordResetToken,
    passwordResetExpires,
    ...userWithoutSensitive
  } = user;

  return {
    user: userWithoutSensitive,
    token,
    emailVerified: user.isEmailVerified,
  };
};

const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    const error = new Error("Invalid or expired verification link");
    error.status = 400;
    throw error;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
    },
  });

  return { message: "Email verified successfully" };
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success even if email doesn't exist
  // This prevents attackers from knowing which emails are registered
  if (!user) return { message: "If that email exists, a reset link was sent" };

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

  try {
    await sendPasswordResetEmail({
      to: email,
      name: user.name,
      token: resetToken,
    });
  } catch (emailError) {
    console.error("Failed to send reset email:", emailError);
  }

  return { message: "If that email exists, a reset link was sent" };
};

const resetPassword = async ({ token, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired reset link");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { message: "Password reset successfully" };
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
