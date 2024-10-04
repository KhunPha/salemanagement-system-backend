import mongoose, { Schema, Document, mongo, Date, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";
import Sequence from "./sequent.model";

export interface ISales extends Document {
    invoice_number: string
    product_lists: object
    cashier: string
    customer: object
    total_qty: number
    total_amount: number
    exchange_rate: number
    discount_type: string
    discount: number
    remind_status: boolean
    date_remind: Date,
    bank: object
    due: number
    total_pay: number
    total_price: number
    payback: number
    isSuspend: boolean
    createdBy: object
    modifiedBy: object
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
        type: String
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
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
    due: {
        type: Number
    },
    total_price: {
        type: Number
    },
    total_pay: {
        type: Number
    },
    payback: {
        type: Number
    },
    isSuspend: {
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

sale.plugin(paginate)

sale.pre('save', async function (next) {
    if (this.isNew) {
        const seq = await Sequence.findOneAndUpdate(
            { name: 'invoice_number' },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        this.invoice_number = `INV-${100000 + seq.value}`;
    }
    next();
});

const SaleSchema = mongoose.model<ISales, PaginateModel<ISales>>("Sale", sale, "Sales")

export default SaleSchema