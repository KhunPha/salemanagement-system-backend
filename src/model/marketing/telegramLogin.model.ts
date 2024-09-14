import mongoose, { Schema, Document } from "mongoose";

export interface ITelegramLogin extends Document {
    firstname: string
    lastname: string
    username: string
    phonenumber: string
    sessionString: string
}

const telegramLogin = new Schema<ITelegramLogin>({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    username: {
        type: String
    },
    phonenumber: {
        type: String
    },
    sessionString: {
        type: String
    }
}, { timestamps: true })

const TelegramSchemaLogin = mongoose.model<ITelegramLogin>("TelegramLogin", telegramLogin, "TelegramLogins")

export default TelegramSchemaLogin