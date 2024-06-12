const jwt = require("jsonwebtoken")

export const getToken = (user: any) => {
    return jwt.sign({data: user}, process.env.JWT_KEY, {expiresIn: "5h"})
}