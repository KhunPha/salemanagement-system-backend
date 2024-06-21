import mongoose from "mongoose"
import { MONGO_URI } from "../.."
import { ApolloError } from "apollo-server-express"
const { success, error } = require("consola")
try {
    mongoose.connect(MONGO_URI)
    success({
        badge: true,
        message: `${MONGO_URI}`
    })
} catch (error: any) {
    error({
        badge: true,
        message: error.message
    })
}