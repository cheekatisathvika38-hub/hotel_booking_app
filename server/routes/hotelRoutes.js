import express from "express";
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import { getRoomsByHotel, createRoom } from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.get("/", getHotels);
router.get("/:id", getHotelById);
router.get("/:hotelId/rooms", getRoomsByHotel);

// Admin only
router.post("/", protect, adminOnly, createHotel);
router.post("/:hotelId/rooms", protect, adminOnly, createRoom);
router.put("/:id", protect, adminOnly, updateHotel);
router.delete("/:id", protect, adminOnly, deleteHotel);

export default router;