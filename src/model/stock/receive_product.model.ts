import mongoose, { Schema, Document } from "mongoose";

export interface IReceiveProductTransaction extends Document {
    purchase_id: object
    product_lists: object
    product_unit_type: string
}

const receiveproductT = new Schema<IReceiveProductTransaction>({
    purchase_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    product_lists: [{
        product_details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        unit_price: {
            type: Number
        },
        whole: {
            type: Number
        },
        retail_in_whole: {
            type: Number
        }
    }],
    product_unit_type: {
        type: String,
        enum: ["Whole", "Retail"]
    }
}, { timestamps: true })

const ReceiveProductTransactionSchema = mongoose.model<IReceiveProductTransaction>("ReceiveProductTransaction", receiveproductT, "ReceivProductTransactions")

export default ReceiveProductTransactionSchema