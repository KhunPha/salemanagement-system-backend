import mongoose from "mongoose"
const MONGO_URI: any = process.env.MONGO_URI
mongoose.connect(MONGO_URI)