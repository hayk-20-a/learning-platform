const authService = require("../services/auth.service");

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    await authService.verifyEmail(token);
    // Redirect to frontend with success message
    res.redirect(`${getFrontendUrl()}/verify-email/success`);
  } catch (error) {
    res.redirect(`${getFrontendUrl()}/verify-email/error`);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword({ token, password });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
