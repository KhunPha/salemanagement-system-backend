import mongoose, { Schema, Document } from "mongoose"

export interface IPaymentTransacPur extends Document {
    purchase_id: object
    reil: number
    dollar: number
    isVoid: boolean
    createdBy: object
    modifiedBy: object
}

const paymentTransacPurSchema = new Schema<IPaymentTransacPur>({
    purchase_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    reil: {
        type: Number
    },
    dollar: {
        type: Number
    },
    isVoid: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

const PaymentTransacPurSchema = mongoose.model<IPaymentTransacPur>("PaymentTransacPur", paymentTransacPurSchema, "PaymentTransacPurchase")

export default PaymentTransacPurSchema