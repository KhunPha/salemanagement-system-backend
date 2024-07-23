import mongoose, {Schema, Document} from "mongoose";

export interface IExchange extends Document {
    exchange_rate_name: string
    exchange_rate: number,
    status: boolean
    remark: string
}

const exchange = new Schema<IExchange>({
    exchange_rate_name: {
        type: String
    },
    exchange_rate: {
        type: Number,
    },
    status: {
        type: Boolean
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const ExchangeRateSchema = mongoose.model<IExchange>("Exchange", exchange, "Exchanges")

export default ExchangeRateSchema