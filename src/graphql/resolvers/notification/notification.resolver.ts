import { ApolloError } from "apollo-server-express"
import NotificationSchema from "../../../model/notification/notification.model"

const notification = {
    Query: {
        getNotifications: async (parent: any, args: any, context: any) => {
            try {
                return await NotificationSchema.find()
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default notification