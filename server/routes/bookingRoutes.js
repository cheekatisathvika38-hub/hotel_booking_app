import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // every booking route requires a logged-in user

router.post("/", createBooking);
router.get("/my-bookings", getMyBookings); // must come BEFORE "/:id"
router.get("/:id", getBookingById);
router.put("/:id/cancel", cancelBooking);

export default router;