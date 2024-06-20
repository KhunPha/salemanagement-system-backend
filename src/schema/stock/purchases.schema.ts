import mongoose, {Schema, Document} from "mongoose";

export interface IPurchase extends Document {
    supplier_details: object,
    products_lists: object,
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
    products_lists: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Product"
        }
    ],
    date: {
        type: String
    },
    product_type: {
        type: String
    },
    amounts: {
        type: Number
    },
    status: {
        type: Boolean
    },
    priority: {
        type: String
    },
    total_qty: {
        type: Number
    },
    due: {
        type: Number
    },
    remiding_date: {
        type: Date
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const PurchaseSchema = mongoose.model<IPurchase>("Purchase", purchase, "Purchases")

export default PurchaseSchema