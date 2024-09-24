import { ApolloError } from "apollo-server-express"
import NotificationSchema from "../../../model/notification/notification.model"

const notification = {
    Query: {
        getNotifications: async (parent: any, args: any, context: any) => {
            try {
                return await NotificationSchema.find().sort({ createdAt: -1 })
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        getNotificationNotRead: async (parent: any, args: any, context: any) => {
            try {
                return await NotificationSchema.find({ read: false, section: "Stock" }).sort({ createdAt: -1 })
            } catch (error: any) {
                throw new ApolloError(error)
            }
        },
        getCountNotification: async (parent: any, args: any, context: any) => {
            try {
                return await NotificationSchema.countDocuments({ read: false });
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    },
    Mutation: {
        readNotification: async (parent: any, args: any, context: any) => {
            try {
                const { notification_id } = args

                await NotificationSchema.findByIdAndUpdate(notification_id, { $set: { read: true } })

                return true;
            } catch (error: any) {
                throw new ApolloError(error)
            }
        }
    }
}

export default notification