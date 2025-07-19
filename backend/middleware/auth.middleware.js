// middlewares/auth.middleware.js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../db/index.js"; // Assuming your Prisma client is initialized here
import jwt from "jsonwebtoken"; // For JWT verification

// This middleware is responsible for verifying the access token from cookies
// and attaching the authenticated user's details to the request object.
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. Extract Access Token:
    // Prioritize the 'accessToken' cookie. If not found, check the Authorization header
    // (commonly used for API calls from non-browser clients or for fallback).
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // If no token is found, the user is unauthorized.
      throw new ApiError(401, "Unauthorized request: Access token missing.");
    }

    // 2. Verify Access Token:
    // Use jsonwebtoken to verify the token with your ACCESS_TOKEN_SECRET.
    // Ensure process.env.ACCESS_TOKEN_SECRET is correctly set in your .env file.
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Find User:
    // Find the user in the database using the 'id' (Int) from the decoded token.
    // We explicitly select fields to exclude sensitive information like the password.
    const user = await prisma.users.findUnique({
      where: {
        id: decodedToken.id, // Use 'id' as per your Prisma users model
      },
      select: {
        // Select only necessary fields to avoid sending sensitive data
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        userInfo: {
          // Include userInfo details
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
      // If the user associated with the token is not found (e.g., user deleted after token issuance),
      // consider the token invalid and unauthorized.
      // Optionally, you might want to clear the cookies here as well to invalidate client-side state.
      // res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      // res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      throw new ApiError(
        401,
        "Invalid Access Token: User not found or token tampered."
      );
    }

    // 4. Attach User to Request:
    // Attach the fetched user object to the request for subsequent middleware/controllers.
    // This allows controllers like `getCurrentUser` or `updateAccountDetails` to access `req.user.id`.
    req.user = user;
    next(); // Proceed to the next middleware or controller in the chain
  } catch (error) {
    // Handle various JWT verification specific errors
    if (error instanceof jwt.TokenExpiredError) {
      // Custom status code 440 often used for "Login Timeout" / "Session Expired"
      throw new ApiError(
        440,
        "Access Token Expired. Please re-authenticate or refresh token."
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      // Catches errors like 'invalid token', 'malformed token', 'signature verification failed'
      throw new ApiError(
        401,
        "Invalid Access Token: Token is malformed or invalid."
      );
    } else if (error instanceof ApiError) {
      // Re-throw if it's already an ApiError from our checks (e.g., token missing)
      throw error;
    } else {
      // Catch any other unexpected errors during the process
      console.error("Error in verifyJWT middleware:", error);
      throw new ApiError(
        500,
        "Internal server error during authentication process."
      );
    }
  }
});
