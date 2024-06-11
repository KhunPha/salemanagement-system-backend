import { AuthenticationError } from "apollo-server-express";

const jwt = require("jsonwebtoken")

function verifyToken (context: any) {
    const authHeader = context.req.headers['authorization']
    if(context.req.body.operationName === 'Login' || context.req.body.operationName === "CreateUser"){
        return;
    }else{
        if (authHeader) {
            const token = authHeader.split(' ')[1]
            if(token){
                try {
                    const user = jwt.verify(token, process.env.JWT_KEY);
                    return user;
                } catch (err) {
                    throw new AuthenticationError("Invalid/Expired token")
                }
            }
            throw new Error("Authentication token must be 'Bearer [token]")
        }
        throw new Error("Authorization header must be provided")
    }
}

export {
    verifyToken
}