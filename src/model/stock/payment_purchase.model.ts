import mongoose, { Schema, Document } from "mongoose"

export interface IPaymentPurchase extends Document {
    purchase_id: object
    total_dollar: number
    total_riel: number
    payment_method: string
    bank: object
    remark: string
    createdBy: object
    modifiedBy: object
}

const payment_purchase = new Schema<IPaymentPurchase>({
    purchase_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    total_dollar: {
        type: Number
    },
    total_riel: {
        type: Number
    },
    payment_method: {
        type: String
    },
    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bank"
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

const PaymentPurchaseSchema = mongoose.model<IPaymentPurchase>("PaymentPurchase", payment_purchase, "PaymentPurchases")

export default PaymentPurchaseSchema