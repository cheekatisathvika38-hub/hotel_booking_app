import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // payload
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      throw new AppError("Name, email and password are required", 400);
    }
    if (!isValidEmail(email)) {
      throw new AppError("Please provide a valid email address", 400);
    }
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    // Reject duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    // Hash the password (10 = salt rounds / cost factor)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save. Role is NOT taken from req.body, so everyone registers as "user".
    const user = await User.create({ name, email, password: hashedPassword });

    //  Respond (never include the password)
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // password has select:false in the schema, so we ask for it explicitly
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // Same message for "no such user" and "wrong password" on purpose
    const passwordMatches = user && (await bcrypt.compare(password, user.password));
    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError("User no longer exists", 404);
    }

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};