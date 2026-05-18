const authService = require("../services/auth.service");

// Controllers are thin — they only handle HTTP concerns
// (reading request body, sending response)
// All logic lives in the service

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error); // passes error to the global error handler in server.js
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

module.exports = { register, login };
