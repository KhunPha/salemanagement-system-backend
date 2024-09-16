import mongoose, { Schema, Document } from "mongoose"

export interface ITelegramApi extends Document {
    apiId: string,
    apiHash: string
}

const telegramApiSchema = new Schema<ITelegramApi>({
    apiId: {
        type: String
    },
    apiHash: {
        type: String
    }
})

const TelegramApiSchema = mongoose.model<ITelegramApi>("TelegramApi", telegramApiSchema, "TelegramAPIS")

export default TelegramApiSchema