import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IStocks extends Document {
    product_details: object
    stock_on_hand: number
    discount_type: string
    discount_id: object
    discount_day: Date
    discount: number
    after_discount: number
    isDiscount: boolean
    isDelete: boolean
    deadline: Date
    isNewInsert: boolean
    isDividedProduct: boolean
    isNotify: boolean
}

const stock = new Schema<IStocks>({
    product_details: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
    },
    stock_on_hand: {
        type: Number,
        default: 0
    },
    discount_type: {
        type: String,
        enum: ["", "$", "%"],
        default: ""
    },
    discount_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    discount_day: {
        type: Date
    },
    discount: {
        type: Number,
        default: 0
    },
    after_discount: {
        type: Number,
        default: 0
    },
    isDiscount: {
        type: Boolean,
        default: false
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Date
    },
    isNewInsert: {
        type: Boolean,
        default: true
    },
    isDividedProduct: {
        type: Boolean,
        default: false
    },
    isNotify: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

stock.plugin(paginate)

const StockSchema = mongoose.model<IStocks, PaginateModel<IStocks>>("Stock", stock, "Stocks")

export default StockSchema