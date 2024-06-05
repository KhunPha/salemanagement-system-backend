import mongoose, {Schema, Document} from "mongoose";

export interface iSalePayments extends Document {
    customer_type: string,
    sale_details: object,
    type_of_pay: string,
}

const salepayment = new Schema<iSalePayments>({
    customer_type: {
        type: String
    },
    sale_details: {
        type: mongoose.Types.ObjectId,
        ref: "Sale"
    },
    type_of_pay: {
        type: String
    }
}, {timestamps: true})

const salepayments = mongoose.model<iSalePayments>("SalePayment", salepayment, "SalePayments")

export default salepayments