import AppError from "../utils/AppError.js";

// Must be used AFTER protect, because it relies on req.user
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Access denied: admin privileges required", 403));
  }
  next();
};