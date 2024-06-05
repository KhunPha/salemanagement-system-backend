import mongoose, {Schema, Document} from "mongoose";

export interface IPurchase extends Document {
    supplier_details: object,
    products_list: object,
    date: string,
    type_of_product: string
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
    type_of_product: {
        type: String
    }
}, {timestamps: true})

const purchases = mongoose.model<IPurchase>("Purchase", purchase, "Purchases")

export default purchases