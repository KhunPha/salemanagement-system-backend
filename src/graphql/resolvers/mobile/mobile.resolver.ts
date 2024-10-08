import Expo from "expo-server-sdk";
import UserSchema from "../../../model/user/user.model";
import { message } from "../../../helper/message.helper";

const expo = new Expo();

const mobile = {
    Query: {
        getUserMobileLogin: async (_: any, args: any) => {
            const { username, expoPushToken } = args;

            // Find the user by username
            const user: any = await UserSchema.findOne({ username });

            const alreadyExist = user?.expoPushToken?.some((expoPushTokens: any) => expoPushTokens === expoPushToken);

            if (alreadyExist) {
                return user;
            }

            await UserSchema.findByIdAndUpdate(user?._id, { $push: { expoPushToken } })

            // Return the updated user object
            return user;
        }
    },
    Mutation: {
        logoutMobileUser: async (_: any, args: any) => {
            const { user_id, expoPushToken } = args
            const user: any = await UserSchema.findById(user_id);

            if (user) {
                const expoPushTokens = user.expoPushToken.filter((token: string) => token !== expoPushToken);

                await UserSchema.findByIdAndUpdate(user_id, { $set: { expoPushToken: expoPushTokens } })

                return message;
            }
        },
        sendUserNotification: async (_: any, args: any) => {
            const { username, title, body } = args;
            const user: any = await UserSchema.findOne({ username });

            try {
                // Filter valid Expo push tokens
                const validTokens: any[] = user?.expoPushToken?.filter((token: any) => {
                    return Expo.isExpoPushToken(token) && token !== ""; // Check if token is valid
                });

                if (!user || validTokens.length === 0) {
                    console.log('Invalid Expo Push Token or user not found');
                    return false;
                }

                // Prepare the notification message
                const message: any = {
                    sound: 'default',
                    title,
                    body,
                    data: { extraData: 'Some data' },
                    icon: "https://icons.iconarchive.com/icons/ampeross/qetto/256/icon-developer-icon.png"
                };

                // Send notifications for each valid token using forEach and await each notification
                await Promise.all(validTokens.map(async (token: any) => {
                    await expo.sendPushNotificationsAsync([{ ...message, to: token }]);
                }));

                return true;
            } catch (error) {
                console.error('Error sending notification:', error);
                return false;
            }
        },
    },
}

export default mobile