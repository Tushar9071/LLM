import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
  verifyOtp,
  updateAccountDetails,
} from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/middleware.js";

const route = express.Router();

route.post("/signup", registerUser);
route.post("/verify-otp", verifyOtp);
route.post("/login", loginUser);
route.post("/req-reset-password", requestPasswordReset);
route.post("/reset-password", resetPassword);
route.post("/logout", logoutUser);
route.post("/get-current-user", getCurrentUser);
route.post("/update-Account-Details", verifyJWT, updateAccountDetails);

export default route;
