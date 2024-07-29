import mongoose, {Schema, Document} from "mongoose";

export interface IReceiveProductTransaction extends Document {
    purchase_id: object
    product_lists: object
}

const receiveproductT = new Schema<IReceiveProductTransaction>({
    purchase_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    product_lists: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        qty: {
            type: Number
        }
    }]
}, {timestamps: true})

const ReceiveProductTransactionSchema = mongoose.model<IReceiveProductTransaction>("Receiveproducttransaction", receiveproductT, "Receiveproducttransactions")

export default ReceiveProductTransactionSchema