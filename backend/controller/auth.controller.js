import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponce.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Username/email and password are required.");
  }

  const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(identifier);

  const user = isEmail
    ? await prisma.users.findUnique({
        where: { email: identifier },
        include: { userInfo: true },
      })
    : await prisma.users.findFirst({
        where: {
          userInfo: {
            Username: identifier,
          },
        },
        include: { userInfo: true },
      });

  if (!user) {
    throw new ApiError(401, "Invalid credentials.");
  }

  // Ensure user.password is not null before comparing
  if (!user.password) {
    throw new ApiError(500, "User account has no password set."); // Or handle social login differently
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials.");
  }

  // Payload for JWTs. Use user.id (from Prisma Int) directly.
  const payload = {
    id: user.id, // Use 'id' as per your Prisma schema
    username: user.userInfo?.Username,
    role: user.role || "user",
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calculate refresh token expiry date
  const refreshTokenExpiry = new Date();
  // Set refresh token expiry based on environment variable or default to 7 days
  const refreshTokenExpiryDays = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY_DAYS || "7",
    10
  );
  refreshTokenExpiry.setDate(
    refreshTokenExpiry.getDate() + refreshTokenExpiryDays
  );

  // Store/Update the refresh token in the database
  // Using upsert to either create a new session or update an existing one for the user
  try {
    await prisma.session.upsert({
      where: { userId: user.id }, // Find session by userId
      update: {
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
      },
      create: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });
  } catch (dbError) {
    console.error("Error saving refresh token to database:", dbError);
    // You might want to throw a specific error or just log it and proceed,
    // as the user is still logged in via cookies.
    throw new ApiError(500, "Failed to manage user session.");
  }

  // Set accessToken cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: refreshTokenExpiryDays * 24 * 60 * 60 * 1000, // 15 minutes
  });

  // Set refreshToken cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: refreshTokenExpiryDays * 24 * 60 * 60 * 1000, // Match database expiry (e.g., 7 days)
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        email: user.email,
        username: user.userInfo?.Username,
        role: user.role || "user",
        // You might want to return the tokens in the response body as well,
        // especially for mobile clients that don't handle cookies automatically.
        // accessToken: accessToken,
        // refreshToken: refreshToken,
      },
      "Login successful"
    )
  );
});

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Enforce minimum password length
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }

  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [{ email }, { userInfo: { Username: username } }],
    },
    include: { userInfo: true },
  });

  if (existingUser) {
    throw new ApiError(409, "Email or Username already in use");
  }

  const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  await prisma.otp.upsert({
    where: { email },
    update: { otp: otpValue, expiresAt: expiresAt },
    create: { email, otp: otpValue, expiresAt: expiresAt },
  });

  await sendOTPEmail(email, otpValue);

  res.status(200).json(new ApiResponse(200, { email }, "OTP sent to email"));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, username, password } = req.body;

  if (!email || !otp || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const record = await prisma.otp.findUnique({ where: { email } });
  if (!record || record.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      userInfo: {
        create: { Username: username, gender: "Other" },
      },
    },
    include: { userInfo: true },
  });

  await prisma.otp.delete({ where: { email } });

  const payload = {
    _id: user.id,
    username: user.userInfo?.Username,
    role: user.role || "user",
  };

  const accessToken = generateAccessToken(payload);
  res.cookie("accessToken", accessToken);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        id: user.id,
        email: user.email,
        username: user.userInfo?.Username,
        token: accessToken,
      },
      "User created"
    )
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // Clear the accessToken cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Clear the refreshToken cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Send a success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required to reset password.");
  }

  // Find the user by email
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    // For security reasons, do not reveal if the email exists or not.
    // Just send a generic success message if the email is not found,
    // or indicate that an email will be sent if the user exists.
    // This prevents enumeration attacks.
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account with that email exists, a password reset OTP has been sent."
        )
      );
  }

  // Generate a new OTP
  const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
  // Set OTP expiry (e.g., 10 minutes from now)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store/Update the OTP in the database with an expiry
  await prisma.otp.upsert({
    where: { email },
    update: { otp: otpValue, expiresAt: expiresAt },
    create: { email, otp: otpValue, expiresAt: expiresAt },
  });

  // Send the OTP to the user's email
  // You need to ensure sendOTPEmail function is properly implemented
  // and configured to send actual emails.
  await sendOTPEmail(email, otpValue, "password_reset"); // Added a type for context in email

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email, otpValue },
        "Password reset OTP sent to your email."
      )
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP, and new password are required.");
  }

  // Find the OTP record for the given email
  const otpRecord = await prisma.otp.findUnique({
    where: { email },
  });

  // Check if OTP record exists
  if (!otpRecord) {
    throw new ApiError(
      400,
      "Invalid or expired OTP. Please request a new one."
    );
  }

  // Verify the provided OTP
  if (otpRecord.otp !== otp) {
    throw new ApiError(400, "Incorrect OTP. Please try again.");
  }

  // Check if the OTP has expired
  if (otpRecord.expiresAt < new Date()) {
    // Delete the expired OTP record to clean up
    await prisma.otp.delete({
      where: { email },
    });
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

  // Update the user's password in the database
  const updatedUser = await prisma.users.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Delete the OTP record after successful password reset to prevent reuse
  await prisma.otp.delete({
    where: { email },
  });

  // Send a success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully."));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  // Ensure the user is authenticated.
  // The `req.user` object is expected to be populated by an authentication middleware.
  if (!req.user || !req.user.id) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  // Fetch the user from the database using the ID from the authenticated request.
  // We include `userInfo` to get all associated profile details.
  const user = await prisma.users.findUnique({
    where: {
      id: req.user.id, // Assuming req.user.id holds the user's unique ID
    },
    include: {
      userInfo: true, // Include related user information
    },
  });

  // If for some reason the user is not found (e.g., deleted after authentication),
  // though this should ideally be caught by middleware.
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Return the user details, excluding sensitive information like the hashed password.
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        email: user.email,
        role: user.role,
        // Spread userInfo directly if it exists, otherwise provide default or null
        ...(user.userInfo && {
          username: user.userInfo.Username, // Assuming 'Username' field in userInfo
          displayName: user.userInfo.displayName,
          avatar: user.userInfo.avatar,
          nativeLanguage: user.userInfo.nativeLanguage,
          targetLanguage: user.userInfo.targetLanguage,
          proficiencyLevel: user.userInfo.proficiencyLevel,
          learningGoals: user.userInfo.learningGoals,
          // Add other userInfo fields as per your schema
        }),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      "Current user details fetched successfully."
    )
  );
});
