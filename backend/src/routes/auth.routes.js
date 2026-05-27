const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateTokenQuery,
} = require("../validators/request.validators");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/verify-email", validateTokenQuery, authController.verifyEmail);
router.post("/forgot-password", validateForgotPassword, authController.forgotPassword);
router.post("/reset-password", validateResetPassword, authController.resetPassword);

module.exports = router;
