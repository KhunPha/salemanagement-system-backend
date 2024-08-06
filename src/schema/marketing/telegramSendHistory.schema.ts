import mongoose, {Schema, Document} from "mongoose";

export interface ITelegramSendHistory extends Document {
    customer_lists: object
    message: String
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
    message: {
        type: String
    }
}, {timestamps: true})

const TelegramSendHIstorySchema = mongoose.model<ITelegramSendHistory>("TelegramSendHistory", telegramsendhistory, "TelegramSendHistories")

export default TelegramSendHIstorySchema