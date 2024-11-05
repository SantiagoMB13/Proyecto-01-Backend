import mongoose from "mongoose";
import { env } from "process";

export default function handleMongoConnection() {
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
}