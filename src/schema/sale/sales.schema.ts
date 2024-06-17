import mongoose, {Schema, Document, mongo} from "mongoose";

export interface ISales extends Document {
    product_lists: object
    cashier: string
    total_qty: number
    total_amount: number
    discount_type: string,
    product_add: object
    discount: number
    unit_product_discount: object
}

const sale = new Schema<ISales>({
    product_lists: [{
        product_details: {
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
    }]
}, {timestamps: true})

const SaleSchema = mongoose.model<ISales>("Sale", sale, "Sales")

export default SaleSchema