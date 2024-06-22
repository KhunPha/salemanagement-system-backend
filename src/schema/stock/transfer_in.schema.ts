import mongoose, {Schema, Document, mongo} from "mongoose";

export interface ITransferIn extends Document {
    product_details: object
    supplier_details: object
    qty: number
    remark: string
}

const transferin = new Schema<ITransferIn>({
    product_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    supplier_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier"
    },
    qty: {
        type: Number
    },
    remark: {
        type: String
    }
}, {timestamps: true})

const TransferInSchema = mongoose.model<ITransferIn>("TransferIn", transferin, "TransferIns")

export default TransferInSchema