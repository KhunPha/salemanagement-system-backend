import mongoose, {Schema, Document, mongo, Date} from "mongoose";

export interface ISales extends Document {
    product_lists: object
    cashier: string
    customer: object
    paymethod: string
    total_qty: number
    total_amount: number
    exchange_rate: number
    discount_type: string
    product_add: object
    discount: number
    unit_product_discount: object
    remind_status: boolean
    date_remind: Date,
    pay: object
    bank: object
}

const sale = new Schema<ISales>({
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
    product_add: [{
        product_details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        qty: {
            type: Number
        }
    }],
    unit_product_discount: [{
        product_details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        discount_type: {
            type: String
        },
        discount: {
            type: Number
        }
    }],
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
        type: mongoose.Schema.Types.ObjectId
    }
}, {timestamps: true})

const SaleSchema = mongoose.model<ISales>("Sale", sale, "Sales")

export default SaleSchema