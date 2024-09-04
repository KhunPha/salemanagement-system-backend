import { ApolloError } from "apollo-server-express";
import { verifyToken } from "../middleware/auth.middleware";

function verify(context: any){
    if(!verifyToken(context)){
        throw new ApolloError("Unauthenticated or Expired token")
    }
    const data = verifyToken(context)
    return data
}

export default verify