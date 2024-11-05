import { Request, Response } from "express";
import cors from "cors";
import express from "express";

// API ROUTES IMPORTS
import userRoutes from "./user/v1/user.routes";
import bookRoutes from "./book/v1/book.routes";
import reservationRoutes from "./reservation/v1/reservation.routes";
import mongoose from "mongoose";

export default function createApp() {
    const app = express();

    // MIDDLEWARES
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
    const SERVER_VERSION = "/api/v1";

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

    return app;
}