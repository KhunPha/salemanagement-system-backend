import mongoose, {Schema, Document, mongo} from "mongoose";

export interface ISales extends Document {
    product_details: object
    cashier: string
    total_qty: number
    total_amount: number
    discount_type: string,
    product_add: object
    discount: number
    unit_product_discount: object
}

const sale = new Schema<ISales>({
    product_details: [{
        product_name: {
            type: mongoose.Schema.Types.ObjectId
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
    total_qty: {
        type: Number
    },
    total_amount: {
        type: Number
    },
    discount_type: {
        type: String
    },
    discount: {
        type: Number
    },
    product_add: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    unit_product_discount: [{
        type: mongoose.Schema.Types.ObjectId
    }]
}, {timestamps: true})

const SaleSchema = mongoose.model<ISales>("Sale", sale, "Sales")

export default SaleSchema