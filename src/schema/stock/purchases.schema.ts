import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IPurchase extends Document {
    supplier_details: object,
    products_lists: {
        product_details: object,
        qty: number
        unit_price: number
    },
    date: Date,
    product_type: string,
    amounts: number,
    isVoid: boolean,
    total_qty: number
    due: number
    remiding_date: Date
    remark: string
}

const purchase = new Schema<IPurchase>({
    supplier_details: {
        type: mongoose.Types.ObjectId,
        ref: "Supplier"
    },
    products_lists: [{
        product_details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        qty: {
            type: Number
        },
        unit_price: {
            type: Number
        }
    }],
    date: {
        type: Date
    },
    product_type: {
        type: String,
        enum: ["New", "Second Hand"]
    },
    amounts: {
        type: Number
    },
    isVoid: {
        type: Boolean,
        default: false
    },
    total_qty: {
        type: Number
    },
    due: {
        type: Number,
        default: 0
    },
    remiding_date: {
        type: Date
    },
    remark: {
        type: String
    }
}, { timestamps: true })

purchase.plugin(paginate)

const PurchaseSchema = mongoose.model<IPurchase, PaginateModel<IPurchase>>("Purchase", purchase, "Purchases")

export default PurchaseSchema