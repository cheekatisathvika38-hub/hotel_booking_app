import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import AppError from "../utils/AppError.js";
import {
  parseStayDates,
  calculateNights,
  findOverlappingBooking,
} from "../utils/bookingHelpers.js";

const HOTEL_FIELDS = "name city address";
const ROOM_FIELDS = "roomNumber roomType pricePerNight";
const BOOKING_STATUSES = ["confirmed", "cancelled", "completed"];

// Owners can access their own bookings; admins can access any
const ensureOwnerOrAdmin = (booking, user) => {
  const isOwner = booking.user.toString() === user.id;
  if (!isOwner && user.role !== "admin") {
    throw new AppError("You are not allowed to access this booking", 403);
  }
};

// POST /api/bookings   (logged-in users)
export const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkInDate: checkIn, checkOutDate: checkOut, numberOfGuests } = req.body;

    //  Validate the room
    if (typeof roomId !== "string" || !roomId) {
      throw new AppError("Room is required", 400);
    }
    const room = await Room.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    //  Validate guests
    const guests = Number(numberOfGuests);
    if (!Number.isInteger(guests) || guests < 1) {
      throw new AppError("Number of guests must be a whole number, at least 1", 400);
    }
    if (guests > room.capacity) {
      throw new AppError(`This room allows a maximum of ${room.capacity} guests`, 400);
    }

    //  Validate dates (format, not in the past, check-out after check-in)
    const { checkInDate, checkOutDate } = parseStayDates(checkIn, checkOut);

    //  Availability: reject if a confirmed booking overlaps
    const clash = await findOverlappingBooking(room._id, checkInDate, checkOutDate);
    if (clash) {
      throw new AppError("Room is not available for the selected dates", 409);
    }

    // Price is calculated on the server, never taken from the client
    const nights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = nights * room.pricePerNight;

    // Create. user comes from the JWT; hotel comes from the room.
    const booking = await Booking.create({
      user: req.user.id,
      hotel: room.hotel,
      room: room._id,
      checkInDate,
      checkOutDate,
      numberOfGuests: guests,
      totalPrice,
    });

    await booking.populate([
      { path: "hotel", select: HOTEL_FIELDS },
      { path: "room", select: ROOM_FIELDS },
    ]);

    res.status(201).json({
      success: true,
      message: "Booking confirmed",
      booking,
      nights,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/my-bookings   (logged-in users)
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("hotel", HOTEL_FIELDS)
      .populate("room", ROOM_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id   (owner or admin)
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hotel", HOTEL_FIELDS)
      .populate("room", ROOM_FIELDS);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    ensureOwnerOrAdmin(booking, req.user);

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/cancel   (owner or admin)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    ensureOwnerOrAdmin(booking, req.user);

    if (booking.status !== "confirmed") {
      throw new AppError(`Booking is already ${booking.status}`, 409);
    }
    if (booking.checkInDate <= new Date()) {
      throw new AppError("Cannot cancel a booking that has already started", 400);
    }

    booking.status = "cancelled"; // soft cancel: keep the record as history
    await booking.save();

    res.status(200).json({ success: true, message: "Booking cancelled", booking });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/bookings?status=confirmed   (admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status !== undefined) {
      if (!BOOKING_STATUSES.includes(status)) {
        throw new AppError(`status must be one of: ${BOOKING_STATUSES.join(", ")}`, 400);
      }
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name email")
      .populate("hotel", HOTEL_FIELDS)
      .populate("room", ROOM_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};