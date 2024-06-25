import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
    supplier_details: object,
    products_lists: {
        product_details: object,
        qty: number
        unit_price: number
    },
    date: string,
    product_type: string,
    amounts: number,
    status: boolean,
    priority: string,
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
        type: String
    },
    product_type: {
        type: String,
        enum: ["New", "Second Hand"]
    },
    amounts: {
        type: Number
    },
    status: {
        type: Boolean
    },
    priority: {
        type: String,
        enum: ["Hard", "Medium", "Normal"]
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

const PurchaseSchema = mongoose.model<IPurchase>("Purchase", purchase, "Purchases")

export default PurchaseSchema