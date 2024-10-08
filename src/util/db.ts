import mongoose from "mongoose";
import { MONGO_URI } from "../..";
const { success, error } = require("consola");

const connectToDatabase = async (retries = 5, delay = 2000): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI);
        success({
            badge: true,
            message: `Connected to: ${MONGO_URI}`
        });
    } catch (err: any) {
        if (retries > 0) {
            error({
                badge: true,
                message: `Connection error: ${err.message}. Retrying...`
            });
            setTimeout(() => connectToDatabase(retries - 1, delay), delay);
        } else {
            error({
                badge: true,
                message: `Failed to connect after multiple attempts: ${err.message}`
            });
        }
    }
};

connectToDatabase();