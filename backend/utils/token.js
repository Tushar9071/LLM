import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const generateAccessToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY_DAYS}d` }
  );
  return token;
};

export const generateRefreshToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY_DAYS}d` }
  );
  return token;
};

export const verifyToken = (token, secret) => jwt.verify(token, secret);
