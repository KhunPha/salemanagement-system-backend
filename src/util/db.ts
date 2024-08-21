import mongoose from "mongoose"
import { MONGO_URI } from "../.."
const { success, error } = require("consola")
try {
    mongoose.connect(MONGO_URI, {
        tls: true,
    })
    success({
        badge: true,
        message: `Connect to: ${MONGO_URI}`
    })
} catch (err: any) {
    error({
        badge: true,
        message: error.message
    })
}