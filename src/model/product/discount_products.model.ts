import mongoose, { Schema, Document } from "mongoose";

export interface IDiscountProducts extends Document {
    product_id: object
    discount: number
    type: string
    from_date: Date
    to_date: Date
    remark: string
    createdBy: object
    modifiedBy: object
    isActive: boolean
    deadline: boolean
}

const discountproduct = new Schema<IDiscountProducts>({
    product_id: [
        {
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    discount: {
        type: Number
    },
    type: {
        type: String,
        enum: ["Cash", "Percentage"]
    },
    from_date: {
        type: Date
    },
    to_date: {
        type: Date
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
    isActive: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const DiscountProductSchema = mongoose.model<IDiscountProducts>("DiscountProduct", discountproduct, "DiscountProducts")

export default DiscountProductSchema