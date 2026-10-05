import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/AppError.js";

// Only these fields may be set by the client
const ALLOWED_FIELDS = [
  "name", "description", "location", "address",
  "city", "images", "amenities", "rating",
];

const pickHotelFields = (body) => {
  const data = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
};

// Escape characters that have special meaning inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/hotels?search=beach&city=Goa&minRating=4   (public)
export const getHotels = async (req, res, next) => {
  try {
    const { search, city, minRating } = req.query;
    const filter = {};

    // Partial, case-insensitive match on name, city or location
    if (typeof search === "string" && search.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: pattern }, { city: pattern }, { location: pattern }];
    }

    // Whole-word, case-insensitive match on city
    if (typeof city === "string" && city.trim()) {
      filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, "i");
    }

    if (minRating !== undefined) {
      const rating = Number(minRating);
      if (Number.isNaN(rating)) {
        throw new AppError("minRating must be a number", 400);
      }
      filter.rating = { $gte: rating };
    }

    const hotels = await Hotel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    next(error);
  }
};

// GET /api/hotels/:id   (public)
export const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      throw new AppError("Hotel not found", 404);
    }

    res.status(200).json({ success: true, hotel });
  } catch (error) {
    next(error);
  }
};

// POST /api/hotels   (admin)
export const createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(pickHotelFields(req.body));

    res.status(201).json({ success: true, message: "Hotel created", hotel });
  } catch (error) {
    next(error); // schema validation errors become 400 in errorHandler
  }
};

// PUT /api/hotels/:id   (admin)
export const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      pickHotelFields(req.body),
      { new: true, runValidators: true } // return updated doc, apply schema rules
    );
    if (!hotel) {
      throw new AppError("Hotel not found", 404);
    }

    res.status(200).json({ success: true, message: "Hotel updated", hotel });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/hotels/:id   (admin)
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      throw new AppError("Hotel not found", 404);
    }

    // Don't delete a hotel that guests are still booked into
    const upcomingBooking = await Booking.findOne({
      hotel: hotel._id,
      status: "confirmed",
      checkOutDate: { $gte: new Date() },
    });
    if (upcomingBooking) {
      throw new AppError("Cannot delete a hotel with upcoming confirmed bookings", 409);
    }

    await Room.deleteMany({ hotel: hotel._id }); // rooms can't exist without their hotel
    await hotel.deleteOne();

    res.status(200).json({ success: true, message: "Hotel and its rooms deleted" });
  } catch (error) {
    next(error);
  }
};