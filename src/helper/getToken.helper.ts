const jwt = require("jsonwebtoken")

export const getToken = (user: any, sessionId: any) => {
    return jwt.sign({ data: { user, sessionId } }, process.env.JWT_KEY)
}