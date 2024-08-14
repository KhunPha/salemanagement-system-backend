import mongoose, {Schema, Document, mongo, Date, PaginateModel} from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface ISales extends Document {
    invoice_number: string
    product_lists: object
    cashier: object
    customer: object
    paymethod: string
    total_qty: number
    total_amount: number
    exchange_rate: number
    discount_type: string
    discount: number
    remind_status: boolean
    date_remind: Date,
    pay: object
    bank: object
}

const sale = new Schema<ISales>({
    invoice_number: {
        type: String
    },
    product_lists: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        qty: {
            type: Number
        },
        amount: {
            type: Number
        }
    }],
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    paymethod: {
        type: String
    },
    total_qty: {
        type: Number
    },
    total_amount: {
        type: Number
    },
    exchange_rate: {
        type: Number
    },
    discount_type: {
        type: String
    },
    discount: {
        type: Number
    },
    remind_status: {
        type: Boolean
    },
    date_remind: {
        type: Date
    },
    pay: {
        reil: {
            type: Number
        },
        dollar: {
            type: Number
        }
    },
    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bank"
    }
}, {timestamps: true})

sale.plugin(paginate)

const SaleSchema = mongoose.model<ISales, PaginateModel<ISales>>("Sale", sale, "Sales")

export default SaleSchema