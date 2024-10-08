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
                user?.expoPushToken?.map(async (exposToken: any) => {
                    if (!user || !Expo.isExpoPushToken(exposToken) || exposToken === "") {
                        console.log('Invalid Expo Push Token or user not found');
                    } else {
                        const message: any = {
                            to: exposToken,
                            sound: 'default',
                            title,
                            body,
                            data: { extraData: 'Some data' },
                            icon: "https://icons.iconarchive.com/icons/ampeross/qetto/256/icon-developer-icon.png"
                        };
                        await expo.sendPushNotificationsAsync([message]);
                    }
                })

                return true;
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        },
    },
}

export default mobile