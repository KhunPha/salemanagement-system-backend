import mongoose, { Schema, Document } from "mongoose";

export interface ISalePayment extends Document {
    sale_id: object
    payment_method: string
    bank: object
    pay: object
    payback: object
    isVoid: boolean
    createdBy: object
    modifiedBy: object
}

const salepayment = new Schema<ISalePayment>({
    sale_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    payment_method: {
        type: String,
    },
    bank: {
        type: mongoose.Schema.Types.ObjectId
    },
    pay: {
        reil: {
            type: Number
        },
        dollar: {
            type: Number
        }
    },
    payback: {
        reil: {
            type: Number
        },
        dollar: {
            type: Number
        }
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

const SalePaymentSchema = mongoose.model<ISalePayment>("SalePayment", salepayment, "SalePayments")

export default SalePaymentSchema