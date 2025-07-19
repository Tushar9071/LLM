import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyOtp,
} from "../controller/auth.controller.js";
const route = express.Router();

route.post("/signup", registerUser);
route.post("/verify-otp", verifyOtp);
route.post("/login", loginUser);
route.post("/req-reset-password", requestPasswordReset);
route.post("/reset-password", resetPassword);
route.post("/logout", logoutUser);

export default route;
