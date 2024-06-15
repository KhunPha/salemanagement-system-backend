import mongoose, {Schema, Document} from "mongoose";

export interface IPurchase extends Document {
    supplier_details: object,
    products_list: object,
    date: string,
    product_type: string,
    amounts: number,
    remark: string
}

const purchase = new Schema<IPurchase>({
    supplier_details: {
        type: mongoose.Types.ObjectId,
        ref: "Supplier"
    },
    products_list: [
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
    remark: {
        type: String
    }
}, {timestamps: true})

const PurchaseSchema = mongoose.model<IPurchase>("Purchase", purchase, "Purchases")

export default PurchaseSchema