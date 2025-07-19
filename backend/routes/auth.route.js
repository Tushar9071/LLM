import express from "express";
import {
  loginUser,
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
export default route;
