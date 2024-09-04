import mongoose, { Schema, Document, mongo } from "mongoose";

export interface ITransferIn extends Document {
    product_lists: object
    supplier_details: object
    remark: string
    createdBy: object
    modifiedBy: object
}

const transferin = new Schema<ITransferIn>({
    product_lists: [{
        product_details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        qty: {
            type: Number,
            default: 0
        }
    }],
    supplier_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier"
    },
    remark: {
        type: String
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

const TransferInSchema = mongoose.model<ITransferIn>("TransferIn", transferin, "TransferIns")

export default TransferInSchema