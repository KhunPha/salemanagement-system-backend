import mongoose, {Schema, Document} from "mongoose";

export interface IStocks extends Document {
    product_details: object
    stock_in_hand: number
    discount: number
    cost: number
}

const stock = new Schema<IStocks>({
    product_details: {
        type: mongoose.Types.ObjectId,
        ref: "Product"
    },
    stock_in_hand: {
        type: Number
    },
    discount: {
        type: Number
    },
    cost: {
        type: Number
    }
}, {timestamps: true})

const StockSchema = mongoose.model<IStocks>("Stock", stock, "Stocks")

export default StockSchema