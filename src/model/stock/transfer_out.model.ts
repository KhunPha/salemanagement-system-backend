import mongoose, { Schema, Document } from "mongoose";

export interface ITransferOut extends Document {
    product_lists: object
    supplier_details: object
    remark: string
    createdBy: object
    modifiedBy: object 
}

const transferout = new Schema<ITransferOut>({
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
})

const TransferOutSchema = mongoose.model<ITransferOut>("TransferOut", transferout, "TransferOuts")

export default TransferOutSchema