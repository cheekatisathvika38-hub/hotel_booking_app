import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// Protects a route: only requests with a valid JWT get through
export const protect = (req, res, next) => {
  // 1. Read the Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Not authorized, no token provided", 401));
  }

  //  Extract the token
  const token = authHeader.split(" ")[1];

  try {
    //  Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Attach identity to the request for later handlers
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Token expired, please log in again"
        : "Invalid token";
    next(new AppError(message, 401));
  }
};