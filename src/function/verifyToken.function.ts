import { ApolloError } from "apollo-server-express";
import { verifyToken } from "../middleware/auth.middleware";

function verify(context: any){
    if(!verifyToken(context)){
        throw new ApolloError("Unauthenticated or Expired token")
    }
}

export default verify