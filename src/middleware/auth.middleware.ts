import { ApolloError } from "apollo-server-express"

const jwt = require("jsonwebtoken")

function verifyToken(context: any) {
    try {
        const authHeaders = context.req.headers['authorization']
        if (authHeaders) {
            const token = authHeaders.split(" ")[1]
            const decodedToken = jwt.verify(token, process.env.JWT_KEY)
            return decodedToken.data
        }
        return true
    } catch (error: any) {
        throw new ApolloError(error.message)
    }
}

export {
    verifyToken
}