import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface ITransferOut extends Document {
    product_lists: object
    supplier_details: object
    date: Date
    total_qty: number
    total_price: number
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
    total_price: {
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
})

transferout.plugin(paginate)

const TransferOutSchema = mongoose.model<ITransferOut, PaginateModel<ITransferOut>>("TransferOut", transferout, "TransferOuts")

export default TransferOutSchema