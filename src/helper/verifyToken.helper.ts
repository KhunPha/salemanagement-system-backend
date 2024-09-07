import { ApolloError } from "apollo-server-express";
import { verifyToken } from "../middleware/auth.middleware";

async function verify(context: any) {
    if (!verifyToken(context)) {
        throw new ApolloError("Unauthenticated or Expired token")
    }
    const data: any = await verifyToken(context)

    if (data.status) {
        return { data: data.data, status: true }
    }
    return { data: data.data, status: false }
}

export default verify