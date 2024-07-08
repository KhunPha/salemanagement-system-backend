import mongoose, {Schema, Document, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

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

stock.plugin(paginate)

const StockSchema = mongoose.model<IStocks, PaginateModel<IStocks>>("Stock", stock, "Stocks")

export default StockSchema