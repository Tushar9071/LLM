import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const prisma = new PrismaClient();

/**
 * JWT verification middleware
 *
 * Checks for a valid JWT in cookies or Authorization header.
 * Attaches the user object to `req.user` if valid.
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  // 🔷 1️⃣ Extract the token
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    throw new ApiError(401, "Unauthorized: Access token is missing.");
  }

  let decoded;

  try {
    // 🔷 2️⃣ Verify the token
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Access token expired. Please log in again.");
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid access token.");
    } else {
      console.error("Unexpected JWT error:", err);
      throw new ApiError(500, "Internal server error during authentication.");
    }
  }

  // 🔷 3️⃣ Fetch the user from the database
  const user = await prisma.users.findUnique({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      userInfo: {
        select: {
          Username: true,
          firstname: true,
          lastname: true,
          phone: true,
          gender: true,
          dob: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(401, "User not found. Token may be invalid or stale.");
  }

  // 🔷 4️⃣ Attach user to request
  req.user = user;

  next();
});
