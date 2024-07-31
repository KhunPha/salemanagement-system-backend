import mongoose, {Schema, Document} from "mongoose";

export interface IExchange extends Document {
    exchange_rate_name: string
    exchange_rate: number,
    isActive: boolean,
    type: string
    remark: string
}

const exchange = new Schema<IExchange>({
    exchange_rate_name: {
        type: String
    },
    exchange_rate: {
        type: Number,
    },
    isActive: {
        type: Boolean
    },
    type: {
        type: String
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const ExchangeRateSchema = mongoose.model<IExchange>("Exchange", exchange, "Exchanges")

export default ExchangeRateSchema