import mongoose from "mongoose";
import { MONGO_URI } from "../.."; // Adjust the import based on your project structure
const { success, error } = require("consola");
import * as http from "http";

const isInternetAvailable = async (): Promise<boolean> => {
    return new Promise((resolve) => {
        http.get("http://www.google.com", (res) => {
            resolve(res.statusCode === 200);
        }).on("error", () => {
            resolve(false);
        });
    });
};

const connectToDatabase = async (): Promise<any> => {
    const internetAvailable = await isInternetAvailable();
    if (!internetAvailable) {
        error({
            badge: true,
            message: 'No internet connection. Retrying in 5 seconds...'
        });
        return setTimeout(connectToDatabase, 5000);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // Increase server selection timeout
            socketTimeoutMS: 45000, // Increase socket timeout
        });
        success({
            badge: true,
            message: `Connected to MongoDB at ${MONGO_URI}`
        });
    } catch (err: any) {
        error({
            badge: true,
            message: `Error connecting to MongoDB: ${err.message}`
        });
        setTimeout(connectToDatabase, 5000); // Retry every 5 seconds
    }
};

// Start the connection attempt
connectToDatabase();
