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
  const { email, username, password,otp } = req.body;

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
  console.log(`Generated OTP for ${email}: ${otpValue}`); // For debugging purposes
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
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No user ID found.",
    });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      userInfo: true,
      gamePoints: true,
      userLanguage: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const {
    id,
    email,
    role,
    createdAt,
    updatedAt,
    userInfo,
    gamePoints,
    userLanguage,
  } = user;

  const response = {
    id,
    email,
    role,
    createdAt,
    updatedAt,

    // userInfo fields
    username: userInfo?.Username ?? null,
    displayName: userInfo?.displayName ?? null,
    avatar: userInfo?.avatar ?? "https://avatar.iran.liara.run/public/boy",
    phone: userInfo?.phone ?? null,
    gender: userInfo?.gender ?? null,
    dob: userInfo?.dob ?? null,
    proficiencyLevel: userInfo?.proficiencyLevel ?? null,
    learningGoals: userInfo?.learningGoals ?? null,
    learningFocus: userInfo?.learningFocus ?? [],
    bio: userInfo?.bio ?? null,
    country: userInfo?.country ?? null,
    nativeLanguage: userInfo?.nativeLanguage ?? null,
    timeZone: userInfo?.timeZone ?? null,

    // Notification Preferences
    notificationPreferences: {
      dailyReminders: userInfo?.dailyReminders ?? true,
      weeklyProgressReports: userInfo?.weeklyProgressReports ?? true,
      achievementNotifications: userInfo?.achievementNotifications ?? true,
      newFeatureAnnouncements: userInfo?.newFeatureAnnouncements ?? true,
    },

    // Languages
    languages: userLanguage ?? [],
  };

  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully.",
    data: response,
  });
});


export const updateAccountDetails = asyncHandler(async (req, res) => {

  if (!req.user || !req.user.id) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  const userId = req.user.id;

  const {
    firstname,
    lastname,
    Username,
    phone,
    gender,
    dob,
    proficiencyLevel,
    learningGoals,
    dailyXPGoal, // moved to gamePoints
    learningFocus,
    dailyReminders,
    weeklyProgressReports,
    achievementNotifications,
    newFeatureAnnouncements,
    } = req.body;

   // Prevent updates to sensitive fields
   if (req.body.email || req.body.password) {
    throw new ApiError(400, "Email and password cannot be updated through this endpoint.");
   }

   if (req.body.avatar) {
    throw new ApiError(400, "Profile picture (avatar) cannot be updated through this endpoint.");
   }

   const existingUserInfo = await prisma.userInfo.findUnique({
    where: { userId: userId },
   });

    if (!existingUserInfo) {
      throw new ApiError(404, "User profile not found. Please ensure your account is fully registered.");
    }

    const userInfoUpdateData = {};

  // Username uniqueness check
  if (Username !== undefined && Username !== existingUserInfo.Username) {
    const usernameExists = await prisma.userInfo.findFirst({
      where: { Username },
    });
    if (usernameExists && usernameExists.userId !== userId) {
      throw new ApiError(409, "Username already taken.");
    }
    userInfoUpdateData.Username = Username;
  }

  // Phone uniqueness check
  if (phone !== undefined && phone !== existingUserInfo.phone) {
    const phoneExists = await prisma.userInfo.findFirst({
      where: { phone },
    });
    if (phoneExists && phoneExists.userId !== userId) {
      throw new ApiError(409, "Phone number already in use.");
    }
    userInfoUpdateData.phone = phone;
  }

  // Optional fields
  if (firstname !== undefined) userInfoUpdateData.firstname = firstname;
  if (lastname !== undefined) userInfoUpdateData.lastname = lastname;
  if (gender !== undefined) userInfoUpdateData.gender = gender;

  // DOB validation
  if (dob !== undefined) {
    const parsedDate = new Date(dob);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Invalid date of birth.");
    }
    userInfoUpdateData.dob = parsedDate;
  }

  if (proficiencyLevel !== undefined) userInfoUpdateData.proficiencyLevel = proficiencyLevel;
  if (learningGoals !== undefined) userInfoUpdateData.learningGoals = learningGoals;

  // learningFocus must be an array
  if (learningFocus !== undefined) {
    if (!Array.isArray(learningFocus)) {
      throw new ApiError(400, "learningFocus must be an array.");
    }
    userInfoUpdateData.learningFocus = learningFocus;
  }

  // Notification preferences
  if (dailyReminders !== undefined) userInfoUpdateData.dailyReminders = dailyReminders;
  if (weeklyProgressReports !== undefined) userInfoUpdateData.weeklyProgressReports = weeklyProgressReports;
  if (achievementNotifications !== undefined) userInfoUpdateData.achievementNotifications = achievementNotifications;
  if (newFeatureAnnouncements !== undefined) userInfoUpdateData.newFeatureAnnouncements = newFeatureAnnouncements;

  // Return current data if nothing to update in userInfo
  if (Object.keys(userInfoUpdateData).length === 0 && dailyXPGoal === undefined) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { userInfo: true },
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          id: user.id,
          email: user.email,
          role: user.role,
          ...user.userInfo,
        },
        "No profile changes submitted."
      )
    );
  }

  // Update userInfo if fields provided
  if (Object.keys(userInfoUpdateData).length > 0) {
    try {
      console.log("🟡 Updating userInfo with:", userInfoUpdateData);
      await prisma.userInfo.update({
        where: { userId: userId },
        data: userInfoUpdateData,
      });
    } catch (dbError) {
      console.error("❌ Prisma userInfo update error:", dbError);
      throw new ApiError(500, "Failed to update profile details. Please try again.");
    }
  }

  // Update gamePoints.dailyXPGoal if provided
  if (dailyXPGoal !== undefined) {
    try {
await prisma.gamePoints.upsert({
  where: { userId: userId },
  update: { dailyXPGoal: dailyXPGoal },
  create: {
    userId: userId,
    dailyXPGoal: dailyXPGoal,
    // default values required for creation
    points: 0,
    xp: 0,
    streak: 0
  },
});

    } catch (err) {
      console.error("❌ Failed to update dailyXPGoal in gamePoints:", err);
      throw new ApiError(500, "Failed to update daily XP goal.");
    }
  }

  // Return updated profile
  const updatedUser = await prisma.users.findUnique({
    where: { id: userId },
    include: { userInfo: true },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        ...updatedUser.userInfo,
      },
      "Account details updated successfully."
    )
  );
});

