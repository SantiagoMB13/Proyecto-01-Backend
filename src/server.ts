import { Request, Response } from "express";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

// API ROUTES IMPORTS
import userRoutes from "./user/v1/user.routes";
import bookRoutes from "./book/v1/book.routes";
import reservationRoutes from "./reservation/v1/reservation.routes";

// MONGODB CONNECTION
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

// Error handler for MongoDB connection
mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("Error during MongoDB connection closure:", error);
    process.exit(1);
  }
});

// MIDDLEWARES
const app = express();

app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// ROUTES
const SERVER_VERSION = "/api/v1/";

app.use(SERVER_VERSION, userRoutes);
app.use(SERVER_VERSION, bookRoutes);
app.use(SERVER_VERSION, reservationRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    mongoConnection: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// FALLBACKS
function routeNotFound(request: Request, response: Response) {
  response.status(404).json({
    message: "Route not found.",
  });
}

app.use(routeNotFound);

// START SERVER
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});