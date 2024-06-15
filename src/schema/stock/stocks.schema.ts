import mongoose, {Schema, Document} from "mongoose";

export interface IStocks extends Document {
    pro_details: object
    stock_in_hand: number,
}

const stock = new Schema<IStocks>({
    pro_details: {
        type: mongoose.Types.ObjectId,
        ref: "Product"
    },
    stock_in_hand: {
        type: Number
    }
}, {timestamps: true})

const StockSchema = mongoose.model<IStocks>("Stock", stock, "Stocks")

export default StockSchema