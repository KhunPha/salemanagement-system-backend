import mongoose, { Schema, Document } from "mongoose";

export interface ITelegramSendHistory extends Document {
    customer_lists: object
    marketing_details: String
    createdBy: object
    modifiedBy: object
}

const telegramsendhistory = new Schema<ITelegramSendHistory>({
    customer_lists: [{
        customer_details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer"
        },
        status: {
            type: String
        }
    }],
    marketing_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Marketing"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true })

const TelegramSendHIstorySchema = mongoose.model<ITelegramSendHistory>("TelegramSendHistory", telegramsendhistory, "TelegramSendHistories")

export default TelegramSendHIstorySchema