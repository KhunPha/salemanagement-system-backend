import mongoose, {Schema, Document} from "mongoose";

export interface IStocks extends Document {
    stock_in_hand: number,
    pro_details: object
}

const stock = new Schema<IStocks>({
    stock_in_hand: {
        type: Number
    },
    pro_details: {
        type: mongoose.Types.ObjectId,
        ref: "Product"
    }
}, {timestamps: true})

const stocks = mongoose.model<IStocks>("Stock", stock, "Stocks")

export default stocks