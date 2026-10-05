import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/AppError.js";
import { parseStayDates, getBookedRoomIds } from "../utils/bookingHelpers.js";

// "hotel" is deliberately NOT in this list: it comes from the URL on create
// and can never be changed afterwards.
const ALLOWED_FIELDS = [
  "roomNumber", "roomType", "pricePerNight",
  "capacity", "amenities", "images", "description",
];

const pickRoomFields = (body) => {
  const data = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
};

// Friendly 409 if this hotel already has a room with this number.
// (The unique index in the Room model is the final safety net.)
const ensureRoomNumberIsFree = async (hotelId, roomNumber, excludeRoomId = null) => {
  const existingRoom = await Room.findOne({
    hotel: hotelId,
    roomNumber,
    _id: { $ne: excludeRoomId },
  });
  if (existingRoom) {
    throw new AppError("Room number already exists in this hotel", 409);
  }
};


// GET /api/hotels/:hotelId/rooms?checkIn=2026-12-10&checkOut=2026-12-13   (public)
// Without dates: all rooms. With dates: only rooms free for that period.
export const getRoomsByHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      throw new AppError("Hotel not found", 404);
    }

    const { checkIn, checkOut } = req.query;
    const filter = { hotel: hotel._id };

    if (checkIn !== undefined || checkOut !== undefined) {
      const { checkInDate, checkOutDate } = parseStayDates(checkIn, checkOut);
      const bookedRoomIds = await getBookedRoomIds(hotel._id, checkInDate, checkOutDate);
      filter._id = { $nin: bookedRoomIds };
    }

    const rooms = await Room.find(filter).sort({ pricePerNight: 1 });

    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
};

// POST /api/hotels/:hotelId/rooms   (admin)
export const createRoom = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      throw new AppError("Hotel not found", 404);
    }

    const roomData = pickRoomFields(req.body);
    if (roomData.roomNumber) {
      await ensureRoomNumberIsFree(hotel._id, roomData.roomNumber);
    }
    const room = await Room.create({ ...roomData, hotel: hotel._id });

    res.status(201).json({ success: true, message: "Room created", room });
  } catch (error) {
    next(error);
  }
};

// PUT /api/rooms/:id   (admin)
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const updates = pickRoomFields(req.body);
    if (updates.roomNumber && updates.roomNumber !== room.roomNumber) {
      await ensureRoomNumberIsFree(room.hotel, updates.roomNumber, room._id);
    }

    room.set(updates);
    await room.save(); // runs all schema validators

    res.status(200).json({ success: true, message: "Room updated", room });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/rooms/:id   (admin)
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const upcomingBooking = await Booking.findOne({
      room: room._id,
      status: "confirmed",
      checkOutDate: { $gte: new Date() },
    });
    if (upcomingBooking) {
      throw new AppError("Cannot delete a room with upcoming confirmed bookings", 409);
    }

    await room.deleteOne();

    res.status(200).json({ success: true, message: "Room deleted" });
  } catch (error) {
    next(error);
  }
};