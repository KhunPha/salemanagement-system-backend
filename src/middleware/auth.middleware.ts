import { ApolloError } from "apollo-server-express"
import UserShcema from "../model/user/user.model"
const jwt = require("jsonwebtoken")

async function verifyToken(context: any) {
    try {
        const authHeaders = context.req.headers['authorization']
        if (authHeaders) {
            const token = authHeaders.split(" ")[1]
            const decodedToken = jwt.verify(token, process.env.JWT_KEY)
            let user: any = null
            if (decodedToken.data.user) {
                user = await UserShcema.findById(decodedToken.data.user._id)
                if (user.sessionId === decodedToken.data.sessionId) {
                    return { data: decodedToken.data, status: true }
                }
            } else {
                user = await UserShcema.findById(decodedToken.data._id)
                if (user.sessionId === decodedToken.sessionId) {
                    return { data: decodedToken.data, status: true }
                }
            }
            return { data: null, status: false }
        }
        throw new ApolloError("JWT must provide")
    } catch (error: any) {
        throw new ApolloError(error)
    }
}

export {
    verifyToken
}