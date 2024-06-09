import mongoose, {Schema, Document} from "mongoose";

export interface IExchange extends Document {
    exchange_rate_num: string,
    remark: string
}

const exchange = new Schema<IExchange>({
    exchange_rate_num: {
        type: String,
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const ExchangeRateSchema = mongoose.model<IExchange>("Exchange", exchange, "Exchanges")

export default ExchangeRateSchema