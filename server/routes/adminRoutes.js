import express from "express";
import { getAllBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/bookings", protect, adminOnly, getAllBookings);

export default router;