import mongoose, {Schema, Document, mongo} from "mongoose";

export interface ITransferOut extends Document {
    product_details: object
    supplier_details: object
    qty: number
    remark: string
}

const transferout = new Schema<ITransferOut>({
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
})

const TransferOutSchema = mongoose.model<ITransferOut>("TransferOut", transferout, "TransferOuts")

export default TransferOutSchema