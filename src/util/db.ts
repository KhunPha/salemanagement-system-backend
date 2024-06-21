import mongoose from "mongoose"
import { MONGO_URI } from "../.."
const { success, error } = require("consola")
mongoose.connect(MONGO_URI)
success({
    badge: true,
    message: `${MONGO_URI}`
})