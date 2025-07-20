import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import aiRoutes from "./routes/ai.route.js";
import gameRoutes from "./routes/game.route.js";
dotenv.config(); // ✅ Load environment variables early

const app = express();
const port = process.env.PORT || 5000; // fallback if PORT is not set

// Middlewares
app.use(
  cors({
    origin: true, // allow actual origin, or replace with specific frontend origin
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Required for reading cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/game", gameRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
