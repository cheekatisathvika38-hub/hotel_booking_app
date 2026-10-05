import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js"; 
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);  
app.use("/api/rooms", roomRoutes); 

app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Error handling: must come AFTER all routes
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();