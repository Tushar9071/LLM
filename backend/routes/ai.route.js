import express from "express";
import { aichat } from "../controller/ai.controller.js";
import { verifyJWT } from "../middleware/middleware.js";
const route = express.Router();

route.post("/aichat", verifyJWT, aichat);

export default route;
