import mongoose, { Schema, Document } from "mongoose";

export interface IExchange extends Document {
    exchange_rate: number,
    isActive: boolean,
}

const exchange = new Schema<IExchange>({
    exchange_rate: {
        type: Number,
    },
    isActive: {
        type: Boolean
    }
}, { timestamps: true })

const ExchangeRateSchema = mongoose.model<IExchange>("Exchange", exchange, "Exchanges")

export default ExchangeRateSchema