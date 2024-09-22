import mongoose, { Schema, Document, plugin, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface ITransferIn extends Document {
    product_lists: object
    supplier_details: object
    date: Date
    total_qty: number
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
        },
        price: {
            type: Number,
            default: 0
        }
    }],
    supplier_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier"
    },
    date: {
        type: Date
    },
    total_qty: {
        type: Number
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

transferin.plugin(paginate)

const TransferInSchema = mongoose.model<ITransferIn, PaginateModel<ITransferIn>>("TransferIn", transferin, "TransferIns")

export default TransferInSchema