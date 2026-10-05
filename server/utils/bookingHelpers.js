import Booking from "../models/Booking.js";
import AppError from "./AppError.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Turns two "YYYY-MM-DD" strings (what <input type="date"> sends) into Dates.
// "2026-12-10" is read as midnight UTC, so a date is a calendar day with
// no time-of-day or timezone surprises.
export const parseStayDates = (checkIn, checkOut) => {
  const isDateString = (value) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (!isDateString(checkIn) || !isDateString(checkOut)) {
    throw new AppError("Check-in and check-out dates are required in YYYY-MM-DD format", 400);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new AppError("Invalid date", 400);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (checkInDate < today) {
    throw new AppError("Check-in date cannot be in the past", 400);
  }

  if (checkOutDate <= checkInDate) {
    throw new AppError("Check-out date must be after check-in date", 400);
  }

  return { checkInDate, checkOutDate };
};

export const calculateNights = (checkInDate, checkOutDate) =>
  Math.ceil((checkOutDate - checkInDate) / MS_PER_DAY);

// The overlap rule, in one place. Only confirmed bookings block a room:
// cancelled bookings free it up.
const overlapFilter = (checkInDate, checkOutDate) => ({
  status: "confirmed",
  checkInDate: { $lt: checkOutDate },
  checkOutDate: { $gt: checkInDate },
});

// Is this room taken in this period? Returns the clashing booking, or null.
export const findOverlappingBooking = (roomId, checkInDate, checkOutDate) =>
  Booking.findOne({ room: roomId, ...overlapFilter(checkInDate, checkOutDate) });

// Which rooms of a hotel are taken in this period? Returns a list of room ids.
export const getBookedRoomIds = (hotelId, checkInDate, checkOutDate) =>
  Booking.distinct("room", { hotel: hotelId, ...overlapFilter(checkInDate, checkOutDate) });