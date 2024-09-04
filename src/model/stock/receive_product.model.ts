import mongoose, { Schema, Document } from "mongoose";

export interface IReceiveProductTransaction extends Document {
    purchase_id: object
    product_lists: object
    product_unit_type: string
    createdBy: object
    modifiedBy: object
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
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true })

const ReceiveProductTransactionSchema = mongoose.model<IReceiveProductTransaction>("ReceiveProductTransaction", receiveproductT, "ReceivProductTransactions")

export default ReceiveProductTransactionSchema