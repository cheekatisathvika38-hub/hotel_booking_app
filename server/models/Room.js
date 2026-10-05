import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel is required"],
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    roomType: {
      type: String,
      enum: ["single", "double", "deluxe", "suite"],
      required: [true, "Room type is required"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [1, "Price must be greater than 0"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// The same room number can exist in different hotels, but not twice in one hotel
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;